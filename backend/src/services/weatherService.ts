import axios from 'axios';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

export interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  visibility: number;
  pressure: number;
  sunrise: string;
  sunset: string;
  forecast: ForecastDay[];
}

export interface ForecastDay {
  day: string;
  high: number;
  low: number;
  condition: string;
  rain: number;
  icon: string;
}

export interface WeatherAlert {
  type: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
  validFrom: string;
  validTo: string;
}

class WeatherService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.tomorrow.io/v4';

  constructor() {
    this.apiKey = config.tomorrowIoApiKey;
    if (!this.apiKey) {
      logger.warn('Tomorrow.io API key not configured');
    }
  }

  async getCurrentWeather(lat: number = 18.5204, lon: number = 73.8567): Promise<WeatherData> {
    try {
      if (!this.apiKey) {
        return this.getFallbackWeatherData();
      }

      const response = await axios.get(
        `${this.baseUrl}/weather/realtime?location=${lat},${lon}&apikey=${this.apiKey}`,
        {
          headers: {
            'accept': 'application/json'
          },
          timeout: 10000, // 10 seconds timeout
        }
      );
      
      if (!response.data?.data?.values) {
        throw new Error('Invalid response format from Tomorrow.io API');
      }
      
      const values = response.data.data.values;
      
      return {
        temperature: Math.round(values.temperature),
        condition: this.getWeatherCondition(values.weatherCode),
        humidity: Math.round(values.humidity),
        windSpeed: Math.round(values.windSpeed * 3.6), // Convert m/s to km/h
        visibility: Math.round(values.visibility),
        pressure: Math.round(values.pressureSeaLevel),
        sunrise: '6:15 AM', // Static for now
        sunset: '6:45 PM',  // Static for now
        forecast: [] // Will be filled by forecast API
      };
    } catch (error) {
      logger.error('Weather API error:', error);
      return this.getFallbackWeatherData();
    }
  }

  async getWeatherForecast(lat: number = 18.5204, lon: number = 73.8567): Promise<ForecastDay[]> {
    try {
      if (!this.apiKey) {
        return this.getFallbackForecast();
      }

      const response = await axios.get(
        `${this.baseUrl}/weather/forecast?location=${lat},${lon}&timesteps=1d&units=metric&apikey=${this.apiKey}`,
        {
          headers: {
            'accept': 'application/json'
          },
          timeout: 10000,
        }
      );
      
      if (!response.data?.data?.timelines?.[0]?.intervals) {
        throw new Error('Invalid response format from Tomorrow.io forecast API');
      }
      
      const days = ['Today', 'Tomorrow', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      
      return response.data.data.timelines[0].intervals.slice(0, 7).map((interval: any, index: number) => ({
        day: days[index],
        high: Math.round(interval.values.temperatureMax),
        low: Math.round(interval.values.temperatureMin),
        condition: this.getWeatherCondition(interval.values.weatherCode),
        rain: Math.round(interval.values.precipitationProbability),
        icon: this.getWeatherIcon(interval.values.weatherCode)
      }));
    } catch (error) {
      logger.error('Forecast API error:', error);
      return this.getFallbackForecast();
    }
  }

  async getWeatherAlerts(lat: number = 18.5204, lon: number = 73.8567): Promise<WeatherAlert[]> {
    try {
      if (!this.apiKey) {
        return this.getFallbackAlerts();
      }

      const response = await axios.get(
        `${this.baseUrl}/weather/alerts?location=${lat},${lon}&apikey=${this.apiKey}`,
        {
          headers: {
            'accept': 'application/json'
          },
          timeout: 10000,
        }
      );
      
      if (!response.data?.data?.alerts) {
        return [];
      }
      
      return response.data.data.alerts.map((alert: any) => ({
        type: alert.type,
        severity: alert.severity || 'medium',
        message: alert.title,
        validFrom: alert.validFrom,
        validTo: alert.validTo,
      }));
    } catch (error) {
      logger.error('Weather alerts API error:', error);
      return this.getFallbackAlerts();
    }
  }

  private getWeatherCondition(code: number): string {
    const conditions: Record<number, string> = {
      0: 'Unknown',
      1000: 'Clear',
      1001: 'Cloudy',
      1100: 'Mostly Clear',
      1101: 'Partly Cloudy',
      1102: 'Mostly Cloudy',
      2000: 'Fog',
      2100: 'Light Fog',
      4000: 'Drizzle',
      4001: 'Rain',
      4200: 'Light Rain',
      4201: 'Heavy Rain',
      5000: 'Snow',
      5001: 'Flurries',
      5100: 'Light Snow',
      5101: 'Heavy Snow',
      6000: 'Freezing Drizzle',
      6001: 'Freezing Rain',
      6200: 'Light Freezing Rain',
      6201: 'Heavy Freezing Rain',
      7000: 'Ice Pellets',
      7101: 'Heavy Ice Pellets',
      7102: 'Light Ice Pellets',
      8000: 'Thunderstorm'
    };
    return conditions[code] || 'Partly Cloudy';
  }

  private getWeatherIcon(code: number): string {
    const icons: Record<number, string> = {
      1000: '☀️',
      1001: '☁️',
      1100: '🌤️',
      1101: '⛅',
      1102: '☁️',
      2000: '🌫️',
      2100: '🌫️',
      4000: '🌦️',
      4001: '🌧️',
      4200: '🌦️',
      4201: '⛈️',
      5000: '❄️',
      5001: '🌨️',
      5100: '🌨️',
      5101: '❄️',
      8000: '⛈️'
    };
    return icons[code] || '⛅';
  }

  private getFallbackWeatherData(): WeatherData {
    return {
      temperature: 28,
      condition: 'Partly Cloudy',
      humidity: 65,
      windSpeed: 12,
      visibility: 10,
      pressure: 1013,
      sunrise: '6:15 AM',
      sunset: '6:45 PM',
      forecast: []
    };
  }

  private getFallbackForecast(): ForecastDay[] {
    return [
      { day: 'Today', high: 32, low: 24, condition: 'Partly Cloudy', rain: 10, icon: '⛅' },
      { day: 'Tomorrow', high: 29, low: 22, condition: 'Rainy', rain: 80, icon: '🌧️' },
      { day: 'Wed', high: 26, low: 20, condition: 'Heavy Rain', rain: 90, icon: '⛈️' },
      { day: 'Thu', high: 30, low: 23, condition: 'Cloudy', rain: 30, icon: '☁️' },
      { day: 'Fri', high: 33, low: 25, condition: 'Sunny', rain: 5, icon: '☀️' },
      { day: 'Sat', high: 31, low: 24, condition: 'Partly Cloudy', rain: 15, icon: '⛅' },
      { day: 'Sun', high: 28, low: 21, condition: 'Thunderstorm', rain: 85, icon: '⛈️' }
    ];
  }

  private getFallbackAlerts(): WeatherAlert[] {
    return [
      {
        type: 'rain',
        severity: 'medium',
        message: 'Heavy rainfall expected in the next 24 hours',
        validFrom: new Date().toISOString(),
        validTo: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }
    ];
  }
}

export const weatherService = new WeatherService(); 
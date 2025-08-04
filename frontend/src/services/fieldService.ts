// src/services/fieldService.ts

// Import necessary services
import { weatherService } from './weatherService';
import { satelliteService } from './satelliteService';
// Removed aiService import as its data is not displayed
// import { aiService } from './aiService';

// Define the interface for a single field's data
export interface FieldData {
    id: string;
    name: string;
    cropType: string;
    moisture: number | null;
    temperature: number;
    diseaseRisk: number | null;
    healthScore: number | null;
}

/**
 * Orchestrates fetching data for all fields from real APIs where available,
 * and sets other values to null as they are no longer displayed.
 */
export const fieldService = {
    async getAllFieldsData(): Promise<FieldData[]> {
        const centralLocation = { lat: 18.5204, lon: 73.8567 }; // Pune, Maharashtra
        let ambientTemperature = 25; // Default fallback
        let soilMoisture = null; // Default fallback
        let healthScore = null; // Default fallback

        // --- Fetch real weather data
        try {
            const currentWeather = await weatherService.getCurrentWeather(centralLocation.lat, centralLocation.lon);
            ambientTemperature = currentWeather.temperature;
        } catch (err) {
            console.error("Error fetching weather in fieldService:", err);
        }
        
        // --- Fetch real satellite data for soil moisture and crop health
        try {
            const satelliteData = await satelliteService.getSatelliteData(centralLocation.lat, centralLocation.lon);
            // The satelliteService returns a number for soilMoisture.
            // Map the health status to a number for the progress bar.
            soilMoisture = Math.round(satelliteData.soilMoisture);
            healthScore = Math.round(satelliteData.cropHealth);
        } catch (err) {
            console.error("Error fetching satellite data in fieldService:", err);
            // Soil moisture and health score remain at fallback null values
        }

        const compiledFields: FieldData[] = [
            {
                id: 'field-1',
                name: 'North Field',
                cropType: 'Tomato',
                moisture: soilMoisture,
                temperature: ambientTemperature,
                diseaseRisk: null, // Not displayed
                healthScore: healthScore,
            },
            {
                id: 'field-2',
                name: 'South Field',
                cropType: 'Onion',
                moisture: soilMoisture,
                temperature: ambientTemperature - 3,
                diseaseRisk: null,
                healthScore: healthScore,
            },
            {
                id: 'field-3',
                name: 'East Field',
                cropType: 'Maize',
                moisture: soilMoisture,
                temperature: ambientTemperature + 2,
                diseaseRisk: null,
                healthScore: healthScore,
            },
        ];
        
        return Promise.resolve(compiledFields);
    },

    async getFieldDataById(fieldId: string): Promise<FieldData | null> {
        const allFields = await this.getAllFieldsData();
        return allFields.find(field => field.id === fieldId) || null;
    }
};

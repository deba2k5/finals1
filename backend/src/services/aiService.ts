import axios from 'axios';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  language?: string;
}

export interface CropRecommendation {
  cropName: string;
  confidence: number;
  reasons: string[];
  expectedYield: string;
  investmentRequired: string;
  roi: string;
}

export interface DiseaseDiagnosis {
  disease: string;
  confidence: number;
  symptoms: string[];
  treatment: string;
  prevention: string;
  severity: 'low' | 'medium' | 'high';
}

class AIService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://generativelanguage.googleapis.com/v1beta';

  constructor() {
    this.apiKey = config.geminiApiKey;
    if (!this.apiKey) {
      logger.warn('Gemini API key not configured');
    }
  }

  async sendChatMessage(message: string, language: string = 'english', context?: any): Promise<string> {
    try {
      if (!this.apiKey) {
        return this.getDefaultResponse(message, language);
      }

      const systemPrompt = `You are KrishakSure AI, an expert agricultural assistant for Indian farmers. 
      Respond in ${this.getLanguageCode(language)}.
      
      Keep responses practical, actionable, and culturally appropriate for Indian farming practices. 
      Include specific advice about timing, quantities, costs in Indian Rupees, and local resources.
      
      Context: ${context ? JSON.stringify(context) : 'General agricultural query'}`;

      const response = await axios.post(
        `${this.baseUrl}/models/gemini-pro:generateContent?key=${this.apiKey}`,
        {
          contents: [{
            parts: [{
              text: `${systemPrompt}\n\nUser question: ${message}`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000, // 30 seconds timeout
        }
      );

      if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        return response.data.candidates[0].content.parts[0].text;
      } else {
        throw new Error('Invalid response format from Gemini API');
      }
    } catch (error) {
      logger.error('Gemini API error:', error);
      return this.getDefaultResponse(message, language);
    }
  }

  async getCropRecommendations(
    soilType: string,
    climate: string,
    season: string,
    farmSize: number,
    location: string
  ): Promise<CropRecommendation[]> {
    try {
      if (!this.apiKey) {
        return this.getDefaultCropRecommendations(season);
      }

      const prompt = `As an agricultural expert for ${location}, India, recommend the top 3 crops for:
      - Soil type: ${soilType}
      - Climate: ${climate}
      - Season: ${season}
      - Farm size: ${farmSize} hectares
      
      Provide specific recommendations with expected yield, investment, and ROI in INR.
      Format the response as a JSON array with objects containing: cropName, confidence, reasons (array), expectedYield, investmentRequired, roi.`;

      const response = await axios.post(
        `${this.baseUrl}/models/gemini-pro:generateContent?key=${this.apiKey}`,
        {
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 1024,
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        const text = response.data.candidates[0].content.parts[0].text;
        return this.parseCropRecommendations(text);
      } else {
        throw new Error('Invalid response format from Gemini API');
      }
    } catch (error) {
      logger.error('Crop recommendation error:', error);
      return this.getDefaultCropRecommendations(season);
    }
  }

  async diagnoseCropDisease(imageBase64: string, cropType: string): Promise<string> {
    try {
      if (!this.apiKey) {
        return this.getDefaultDiseaseResponse(cropType);
      }

      const prompt = `Analyze this ${cropType} plant image for diseases, pests, or nutrient deficiencies. 
      Provide diagnosis, treatment recommendations, and prevention measures. 
      Include cost-effective solutions available in India.`;

      const response = await axios.post(
        `${this.baseUrl}/models/gemini-pro-vision:generateContent?key=${this.apiKey}`,
        {
          contents: [{
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: imageBase64
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 1024,
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 60000, // 60 seconds for image processing
        }
      );

      if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        return response.data.candidates[0].content.parts[0].text;
      } else {
        throw new Error('Invalid response format from Gemini Vision API');
      }
    } catch (error) {
      logger.error('Disease diagnosis error:', error);
      return this.getDefaultDiseaseResponse(cropType);
    }
  }

  private getLanguageCode(language: string): string {
    const languageMap: Record<string, string> = {
      'hindi': 'Hindi (Devanagari script)',
      'marathi': 'Marathi',
      'gujarati': 'Gujarati',
      'punjabi': 'Punjabi',
      'english': 'English'
    };
    return languageMap[language] || 'English';
  }

  private getDefaultResponse(message: string, language: string): string {
    const responses: Record<string, string> = {
      english: "I'm here to help you with your farming questions! Due to high demand, I'm working on getting you the best answer. Meanwhile, consider consulting local agricultural experts or KVK centers.",
      hindi: "मैं आपके खेती के सवालों में आपकी मदद करने के लिए यहाँ हूँ! अधिक मांग के कारण, मैं आपको सर्वोत्तम उत्तर देने पर काम कर रहा हूँ।",
      marathi: "मी तुमच्या शेतीच्या प्रश्नांसाठी मदत करण्यासाठी येथे आहे! जास्त मागणीमुळे, मी तुम्हाला सर्वोत्तम उत्तर मिळवून देण्यावर काम करत आहे।",
      gujarati: "હું તમારા ખેતીના પ્રશ્નોમાં મદદ કરવા માટે અહીં છું! વધુ માંગને કારણે, હું તમને શ્રેષ્ઠ જવાબ આપવા પર કામ કરી રહ્યો છું।",
      punjabi: "ਮੈਂ ਤੁਹਾਡੇ ਖੇਤੀ ਦੇ ਸਵਾਲਾਂ ਵਿੱਚ ਮਦਦ ਕਰਨ ਲਈ ਇੱਥੇ ਹਾਂ! ਵਧੇਰੇ ਮੰਗ ਕਾਰਨ, ਮੈਂ ਤੁਹਾਨੂੰ ਸਭ ਤੋਂ ਵਧੀਆ ਜਵਾਬ ਦੇਣ 'ਤੇ ਕੰਮ ਕਰ ਰਿਹਾ ਹਾਂ।"
    };
    return responses[language] || responses.english;
  }

  private parseCropRecommendations(text: string): CropRecommendation[] {
    try {
      // Try to parse JSON from the response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (error) {
      logger.warn('Failed to parse JSON from AI response, using fallback');
    }

    // Fallback recommendations
    return [
      {
        cropName: 'Wheat',
        confidence: 0.92,
        reasons: ['Suitable for current soil conditions', 'Good market demand', 'Optimal planting season'],
        expectedYield: '25-30 quintals/hectare',
        investmentRequired: '₹15,000-20,000/hectare',
        roi: '25-30%'
      },
      {
        cropName: 'Cotton',
        confidence: 0.85,
        reasons: ['High market price', 'Suitable climate', 'Government support available'],
        expectedYield: '15-20 quintals/hectare',
        investmentRequired: '₹25,000-30,000/hectare',
        roi: '35-40%'
      },
      {
        cropName: 'Sugarcane',
        confidence: 0.78,
        reasons: ['Long-term crop', 'Guaranteed purchase', 'Good for large farms'],
        expectedYield: '400-500 quintals/hectare',
        investmentRequired: '₹40,000-50,000/hectare',
        roi: '20-25%'
      }
    ];
  }

  private getDefaultCropRecommendations(season: string): CropRecommendation[] {
    const kharifCrops = [
      {
        cropName: 'Rice',
        confidence: 0.9,
        reasons: ['Monsoon crop', 'High demand', 'Government MSP available'],
        expectedYield: '40-50 quintals/hectare',
        investmentRequired: '₹20,000-25,000/hectare',
        roi: '20-25%'
      }
    ];

    const rabiCrops = [
      {
        cropName: 'Wheat',
        confidence: 0.92,
        reasons: ['Winter crop', 'Stable prices', 'Good storage life'],
        expectedYield: '25-30 quintals/hectare',
        investmentRequired: '₹15,000-20,000/hectare',
        roi: '25-30%'
      }
    ];

    return season.toLowerCase().includes('kharif') ? kharifCrops : rabiCrops;
  }

  private getDefaultDiseaseResponse(cropType: string): string {
    return `Unable to analyze the image at the moment. Please try again or consult with a local agricultural expert. 
    Common issues in ${cropType} include fungal infections, nutrient deficiencies, and pest damage. 
    Consider regular monitoring and preventive measures.`;
  }
}

export const aiService = new AIService(); 
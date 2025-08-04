# 🌾 GeoGrow – Precision Farming & Agri Intelligence Dashboard

GeoGrow is an AI-driven smart agriculture platform built for **farmers**, **agronomists**, and **agritech innovators** to analyze crop health, manage resources, receive real-time alerts, and boost yield sustainably. 

With integrations across satellite intelligence, weather forecasts, mandi prices, crop insurance, and AI advisories – **GeoGrow** bridges the gap between the farm and future-ready data.

---

## 🚀 Project Highlights

| Feature                         | Description                                                                 |
|---------------------------------|-----------------------------------------------------------------------------|
| 🛰️ **NDVI Vegetation Health**   | Real-time NDVI & surface reflectance maps via **Planet API + Leaflet**     |
| ☁️ **Weather Forecast**         | 7-day forecasts + alerts via **Tomorrow.io API**                           |
| 📉 **Mandi Price Analysis**     | Real-time prices + AI-powered price prediction with 50K+ synthetic dataset |
| 🧬 **Crop Health Diagnosis**    | Upload plant image → detect diseases using **Groq VLM (Llama-4-Scout-17B)**                  |
| 🌱 **Cross Crop Advisory**      | Soil-Season-Crop input → get companion crop suggestions (via AI)           |
| 🔔 **Smart Alerts**             | WhatsApp/SMS via **Twilio API**, alerts for weather, disease & prices      |
| 🛡️ **Crop Insurance Calculator**| Estimate premium & find available government insurance                     |
| 📍 **Farm Location Mapping**    | Field polygons + markers with **Leaflet + React-Leaflet**                  |
| 🤖 **Chatbot Advisory**         | Personalized chatbot powered by **Firebase + Gemini API**                  |
| 🔒 **User Authentication**      | Secure login using **Firebase Auth**                                       |

---

## 🧩 Tech Stack

| Frontend | Backend / APIs | Tools & Libraries |
|----------|----------------|-------------------|
| ✅ React.js + TypeScript | ☁️ Tomorrow Weather API | ⚙️ Vite |
| 🎨 Tailwind CSS | 🛰️ Planet API (NDVI) | 🌍 Leaflet + React-Leaflet |
| 🧩 Shadcn/UI | 📊 Agmarknet API (Mandi prices) | 📦 Axios |
| 🧠 Gemini AI | 🔐 Firebase (Auth, DB) | ✨ Animations via Tailwind |
| 💬 Serper AI (fallback NLP) | 📲 Twilio API (SMS/WhatsApp) | 🧠 Gemini (Disease/Chat AI) |

---

## 📂 Project Structure

GeoGrow/
├── public/ # Static assets
├── src/
│ ├── assets/ # Images, icons
│ ├── components/ # Reusable UI components
│ ├── pages/ # Main app pages (Dashboard, Weather, Prices)
│ ├── services/ # API services (weather, NDVI, price, chatbot)
│ ├── styles/ # Tailwind + global styles
│ └── main.tsx # App entry point
├── vite.config.ts
└── README.md


---

## ⚙️ Setup & Installation

> Prerequisites: `Node.js >= 18`, `npm`, `Git`

```bash
# 1. Clone the repository
git clone https://github.com/deba2k5/GeoGrow.git
cd GeoGrow

# 2. Install dependencies
npm install
npm install axios leaflet react-leaflet

# 3. Run locally
npm run dev

| Command           | Action                   |
| ----------------- | ------------------------ |
| `npm run dev`     | Start dev server         |
| `npm run build`   | Build production bundle  |
| `npm run preview` | Preview production build |

| Module                | Description                                                |
| --------------------- | ---------------------------------------------------------- |
| 🤖 Chatbot Advisor    | Firebase + Gemini powered natural advisory engine          |
| 🌱 Cross Crop Advisor | AI generates intercropping tips based on soil + season     |
| 🛰️ NDVI Classifier   | Uses Planet's NDVI & reflectance bands for crop health map |
| ☁️ Weather AI Alerts  | Intelligent push alerts via Twilio for severe forecasts    |
| 📉 Price Extractor    | Market rates parsed with Serper AI fallback when necessary |

| API / Service        | Purpose                               |
| -------------------- | ------------------------------------- |
| 🌍 **Planet API**    | NDVI & surface reflectance imagery    |
| ⛅ **Tomorrow\.io**   | Weather forecast & real-time alerts   |
| 🧬 **Groq VLM API**    | Real-time crop disease analysis using Llama-4-Scout-17B   |
| 📉 **Price Prediction** | AI-powered price forecasting with linear regression |
| 💬 **Twilio API**    | SMS/WhatsApp for urgent alerts        |
| 🔐 **Firebase**      | Auth, Firestore DB, Chatbot storage   |
| 🔎 **Serper API**    | Fallback NLP advisory if Gemini fails |

### 🧬 Groq VLM Integration

The crop health diagnosis feature now uses **Groq's Vision Language Model** powered by **Llama-4-Scout-17B** for real-time image analysis.

- **Real-time Analysis**: Upload plant images and get instant disease detection
- **Advanced AI Model**: Uses state-of-the-art Llama-4-Scout-17B model for accurate diagnosis
- **Comprehensive Results**: Provides disease name, confidence score, severity level, treatment recommendations, and prevention tips
- **Fallback System**: Includes robust fallback data if API calls fail
- **Error Handling**: Comprehensive error handling for file validation, API limits, and parsing issues

**API Key Setup**: 
1. Copy `env.example` to `.env`
2. Add your Groq API key: `GROQ_API_KEY=your_actual_key_here`
3. The key is automatically loaded from environment variables

### 📉 Enhanced Price Prediction System

The MarketPrices component now includes advanced AI-powered price prediction capabilities:

- **Synthetic Dataset**: 50,000+ historical price records across 7 states and 70+ mandis
- **Linear Regression Model**: Advanced statistical analysis for price forecasting
- **Multiple Timeframes**: Predictions for next month and next quarter
- **Real-time Input**: Users can input current prices for more accurate predictions
- **Trend Analysis**: Visual indicators for price trends (up/down/stable)
- **Confidence Scoring**: 70-95% confidence levels with progress bars
- **Seasonal Factors**: Built-in seasonal adjustments for different crops
- **Key Factors Display**: Shows influencing factors like demand patterns, weather, policies

**Features**:
- **Market Prices Mode**: Current mandi prices with min/max/modal ranges
- **Price Prediction Mode**: AI-powered forecasting with trend analysis
- **Cross Crop Advisory Mode**: Expert planting advice based on soil and season

| Issue                                        | Fix                                                |
| -------------------------------------------- | -------------------------------------------------- |
| `error: src refspec main does not match any` | `git branch -M main`                               |
| `remote origin already exists`               | `git remote remove origin`                         |
| `404 on Vercel`                              | Set fallback route in Vercel → `/* => /index.html` |

# Create a new feature branch
git checkout -b feature/my-feature

# Make changes, then commit
git add .
git commit -m "feat: add NDVI map feature"

# Push changes
git push origin feature/my-feature

BACKEND - https://infosysfinal.onrender.com/


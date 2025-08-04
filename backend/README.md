# GeoGrow Backend API

A robust Node.js/Express backend for the GeoGrow agricultural application, providing secure API endpoints for AI services, weather data, satellite imagery, and SMS alerts.

## Features

- 🔐 **Secure API endpoints** with rate limiting and CORS protection
- 🤖 **AI Integration** with Google Gemini for agricultural advice
- 🌦️ **Weather Services** with Tomorrow.io integration
- 🛰️ **Satellite Data** with Planet.com integration
- 📱 **SMS Alerts** with Twilio integration
- 💾 **Caching** with NodeCache for improved performance
- 📊 **Comprehensive Logging** with structured logging
- 🔒 **Authentication** with JWT and Firebase Admin
- 📝 **Input Validation** with Joi schemas
- 🚀 **Production Ready** with error handling and monitoring

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Environment variables configured

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp env.example .env
   # Edit .env with your API keys and configuration
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

## Environment Variables

Create a `.env` file with the following variables:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# API Keys
GEMINI_API_KEY=your_gemini_api_key_here
TOMORROW_IO_API_KEY=your_tomorrow_io_api_key_here
PLANET_API_KEY=your_planet_api_key_here

# Twilio Configuration (for SMS)
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=your_twilio_phone_number_here

# Firebase Configuration
FIREBASE_PROJECT_ID=your_firebase_project_id_here
FIREBASE_PRIVATE_KEY=your_firebase_private_key_here
FIREBASE_CLIENT_EMAIL=your_firebase_client_email_here

# JWT Secret
JWT_SECRET=your_jwt_secret_here

# CORS Configuration
CORS_ORIGIN=http://localhost:8080
```

## API Endpoints

### AI Services

- `POST /api/v1/ai/chat` - Send chat messages to AI assistant
- `POST /api/v1/ai/crop-recommendations` - Get crop recommendations
- `POST /api/v1/ai/diagnose-disease` - Diagnose crop diseases from images
- `GET /api/v1/ai/health` - AI service health check

### Weather Services

- `GET /api/v1/weather/current` - Get current weather data
- `GET /api/v1/weather/forecast` - Get weather forecast
- `GET /api/v1/weather/alerts` - Get weather alerts
- `GET /api/v1/weather/health` - Weather service health check

### Satellite Services

- `GET /api/v1/satellite/data` - Get satellite imagery and analysis
- `GET /api/v1/satellite/field-boundaries` - Get field boundary detection
- `GET /api/v1/satellite/health` - Satellite service health check

### SMS Services

- `POST /api/v1/sms/send` - Send SMS alerts
- `POST /api/v1/sms/subscribe` - Subscribe to SMS alerts
- `GET /api/v1/sms/history` - Get SMS history
- `GET /api/v1/sms/health` - SMS service health check

### User Management

- `POST /api/v1/user/register` - Register new user
- `POST /api/v1/user/login` - User login
- `GET /api/v1/user/profile` - Get user profile
- `PUT /api/v1/user/profile` - Update user profile

### Health Checks

- `GET /health` - Main application health check
- `GET /api/v1/health` - Detailed health status

## Request Examples

### AI Chat
```bash
curl -X POST http://localhost:3001/api/v1/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "How to grow tomatoes in Maharashtra?",
    "language": "english"
  }'
```

### Weather Data
```bash
curl "http://localhost:3001/api/v1/weather/current?lat=18.5204&lon=73.8567"
```

### Crop Recommendations
```bash
curl -X POST http://localhost:3001/api/v1/ai/crop-recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "soilType": "clay",
    "climate": "tropical",
    "season": "kharif",
    "farmSize": 5,
    "location": "Maharashtra"
  }'
```

## Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "data": {
    // Response data here
  },
  "cached": false,
  "responseTime": 150
}
```

Error responses:
```json
{
  "success": false,
  "error": "Error message here",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/v1/endpoint"
}
```

## Caching

The backend implements intelligent caching for:
- Weather data (30 minutes)
- Satellite data (1 hour)
- AI responses (2 hours)
- SMS history (24 hours)

## Rate Limiting

- General endpoints: 100 requests per 15 minutes
- AI endpoints: 10 requests per 15 minutes
- SMS endpoints: 20 requests per 15 minutes

## Security Features

- Helmet.js for security headers
- CORS protection
- Rate limiting
- Input validation with Joi
- JWT authentication
- API key protection

## Monitoring

- Structured logging with different levels
- Request/response logging
- External API call monitoring
- Cache hit/miss tracking
- Error tracking with stack traces

## Development

### Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

### Project Structure

```
src/
├── config/          # Configuration management
├── controllers/     # Request handlers
├── middleware/      # Express middleware
├── routes/          # API route definitions
├── schemas/         # Joi validation schemas
├── services/        # Business logic and external API calls
├── utils/           # Utility functions
└── index.ts         # Application entry point
```

## Deployment

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3001
CMD ["npm", "start"]
```

### Environment Setup

1. Set all required environment variables
2. Configure CORS origins for your domain
3. Set up proper logging
4. Configure rate limiting for your traffic
5. Set up monitoring and alerting

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details 
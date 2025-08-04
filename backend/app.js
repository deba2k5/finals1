// backend/app.js (Renamed from proxy.js)

// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

// Import necessary modules
import express from 'express';
import mongoose from 'mongoose'; // For MongoDB interaction
import cors from 'cors'; // If your React app is on a different port/domain
import NodeCache from 'node-cache'; // For caching AGMARKNET API responses
import fetch from 'node-fetch'; // Explicitly import fetch if Node.js version is <18 or for consistency

const app = express();
const PORT = process.env.PORT || 5000;

// Create a cache instance (cache for 10 minutes)
const cache = new NodeCache({ stdTTL: 600 });

// AGMARKNET API Resource ID
const RESOURCE_ID = '9ef84268-d588-465a-a308-a864a43d0070';

// Middleware
app.use(cors()); // Enable CORS for cross-origin requests from your React app
app.use(express.json()); // Enable parsing of JSON request bodies

// --- MongoDB Connection ---
// Get MongoDB URI from .env file.
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Error: MONGODB_URI is not defined in your .env file.');
    console.error('Please add MONGODB_URI="your_mongodb_connection_string" to your .env');
    process.exit(1); // Use process.exit(1) for critical errors
}

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('MongoDB connected successfully!');
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
        console.error('Failed to connect to MongoDB. Exiting process.');
        process.exit(1); // Use process.exit(1) for critical errors
    });

// --- MongoDB Schema and Model for AGMARKNET Records ---
const agmarknetRecordSchema = new mongoose.Schema({
    commodity: { type: String, required: true, trim: true },
    market: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    variety: { type: String, trim: true },
    grade: { type: String, trim: true },
    arrival_date: { type: String, required: true, trim: true },
    min_price: { type: Number },
    max_price: { type: Number },
    modal_price: { type: Number },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const AgmarknetRecord = mongoose.model('AgmarknetRecord', agmarknetRecordSchema);

// --- New MongoDB Schema and Model for AI Recommendations ---
const aiRecommendationSchema = new mongoose.Schema({
    cropName: { type: String, required: true, trim: true },
    suitabilityScore: { type: Number, required: true },
    expectedYield: { type: String },
    season: { type: String },
    waterNeed: { type: String },
    marketDemand: { type: String },
    investment: { type: String },
    advantages: { type: String },
    considerations: { type: String },
    region: { type: String },
    recommendedAt: {
        type: Date,
        default: Date.now
    }
});

const AiRecommendation = mongoose.model('AiRecommendation', aiRecommendationSchema);

// --- Existing AGMARKNET Proxy API Route ---
app.get('/api/agmarknet', async (req, res) => {
    const {
        commodity,
        market,
        date,
        state,
        district,
        variety,
        grade,
        limit = 10,
        offset = 0,
        dropdown
    } = req.query;

    const isDropdown = dropdown === 'true';
    const MAX_LIMIT = isDropdown ? 2000 : 200;
    const requestedLimit = Number(limit) || 10;
    const actualLimit = Math.min(requestedLimit, MAX_LIMIT);

    // Make sure VITE_AGMARKNET_API_KEY is correctly defined in your .env
    const apiKey = process.env.VITE_AGMARKNET_API_KEY;

    if (!apiKey) {
        return res.status(500).json({
            error: 'API key not found. Please set VITE_AGMARKNET_API_KEY in your .env file'
        });
    }

    const cacheKey = `agmarknet:${JSON.stringify({ commodity, market, date, state, district, variety, grade, actualLimit, offset, isDropdown })}`;

    if (isDropdown) {
        const cached = cache.get(cacheKey);
        if (cached) {
            console.log('Serving dropdown data from cache');
            return res.json(cached);
        }
    }

    // Using process.env.VITE_AGMARKNET_API_URL from .env
    const agmarknetApiBaseUrl = process.env.VITE_AGMARKNET_API_URL || 'https://api.data.gov.in/resource/';
    let url = `${agmarknetApiBaseUrl}${RESOURCE_ID}?api-key=${apiKey}&format=json&limit=${actualLimit}&offset=${offset}`;

    if (commodity) url += `&filters[commodity]=${encodeURIComponent(commodity)}`;
    if (market) url += `&filters[market]=${encodeURIComponent(market)}`;
    if (date) url += `&filters[arrival_date]=${encodeURIComponent(date)}`;
    if (state) url += `&filters[state]=${encodeURIComponent(state)}`;
    if (district) url += `&filters[district]=${encodeURIComponent(district)}`;
    if (variety) url += `&filters[variety]=${encodeURIComponent(variety)}`;
    if (grade) url += `&filters[grade]=${encodeURIComponent(grade)}`;

    console.log('AGMARKNET request:', { requestedLimit, actualLimit, url });

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log(`Received ${data.records?.length || 0} records`);

        if (isDropdown) {
            cache.set(cacheKey, data);
        }

        res.json(data);
    } catch (e) {
        console.error('Error fetching from AGMARKNET:', e);
        res.status(500).json({
            error: 'Failed to fetch from AGMARKNET',
            details: e.message
        });
    }
});

// --- MongoDB API Routes for AGMARKNET Records ---
app.post('/api/agmarknet-records', async (req, res) => {
    try {
        const { commodity, market, state, district, variety, grade, arrival_date, min_price, max_price, modal_price } = req.body;

        if (!commodity || !market || !state || !district || !arrival_date) {
            return res.status(400).json({ message: 'Commodity, market, state, district, and arrival_date are required fields.' });
        }

        const newRecord = new AgmarknetRecord({
            commodity,
            market,
            state,
            district,
            variety,
            grade,
            arrival_date,
            min_price,
            max_price,
            modal_price
        });

        await newRecord.save();
        res.status(201).json(newRecord);
    } catch (error) {
        console.error('Error creating AGMARKNET record:', error);
        res.status(500).json({ message: 'Server error creating record', error: error.message });
    }
});

app.get('/api/agmarknet-records', async (req, res) => {
    try {
        const records = await AgmarknetRecord.find({});
        res.status(200).json(records);
    } catch (error) {
        console.error('Error fetching AGMARKNET records:', error);
        res.status(500).json({ message: 'Server error fetching records', error: error.message });
    }
});

app.get('/api/agmarknet-records/:id', async (req, res) => {
    try {
        const record = await AgmarknetRecord.findById(req.params.id);
        if (!record) {
            return res.status(404).json({ message: 'AGMARKNET record not found' });
        }
        res.status(200).json(record);
    } catch (error) {
        console.error('Error fetching AGMARKNET record by ID:', error);
        res.status(500).json({ message: 'Server error fetching record', error: error.message });
    }
});

app.put('/api/agmarknet-records/:id', async (req, res) => {
    try {
        const { commodity, market, state, district, variety, grade, arrival_date, min_price, max_price, modal_price } = req.body;

        const updatedRecord = await AgmarknetRecord.findByIdAndUpdate(
            req.params.id,
            { commodity, market, state, district, variety, grade, arrival_date, min_price, max_price, modal_price },
            { new: true, runValidators: true }
        );

        if (!updatedRecord) {
            return res.status(404).json({ message: 'AGMARKNET record not found' });
        }
        res.status(200).json(updatedRecord);
    } catch (error) {
        console.error('Error updating AGMARKNET record:', error);
        res.status(500).json({ message: 'Server error updating record', error: error.message });
    }
});

app.delete('/api/agmarknet-records/:id', async (req, res) => {
    try {
        const deletedRecord = await AgmarknetRecord.findByIdAndDelete(req.params.id);
        if (!deletedRecord) {
            return res.status(404).json({ message: 'AGMARKNET record not found' });
        }
        res.status(200).json({ message: 'AGMARKNET record deleted successfully', deletedRecord });
    } catch (error) {
        console.error('Error deleting AGMARKNET record:', error);
        res.status(500).json({ message: 'Server error deleting record', error: error.message });
    }
});

// --- New MongoDB API Route for AI Recommendations (Create) ---
app.post('/api/ai-recommendations', async (req, res) => {
    try {
        const {
            cropName,
            suitabilityScore,
            expectedYield,
            season,
            waterNeed,
            marketDemand,
            investment,
            advantages,
            considerations,
            region
        } = req.body;

        if (!cropName || suitabilityScore === undefined) {
            return res.status(400).json({ message: 'Crop name and suitability score are required.' });
        }

        const newRecommendation = new AiRecommendation({
            cropName,
            suitabilityScore,
            expectedYield,
            season,
            waterNeed,
            marketDemand,
            investment,
            advantages,
            considerations,
            region
        });

        await newRecommendation.save();
        console.log('New AI Recommendation saved:', newRecommendation);
        res.status(201).json(newRecommendation);
    } catch (error) {
        console.error('Error saving AI Recommendation:', error);
        res.status(500).json({ message: 'Server error saving AI recommendation', error: error.message });
    }
});

// Optional: Add a GET route to retrieve saved recommendations
app.get('/api/ai-recommendations', async (req, res) => {
    try {
        const recommendations = await AiRecommendation.find({});
        res.status(200).json(recommendations);
    } catch (error) {
        console.error('Error fetching AI recommendations:', error);
        res.status(500).json({ message: 'Server error fetching AI recommendations', error: error.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Proxy server running on port ${PORT}`);
});
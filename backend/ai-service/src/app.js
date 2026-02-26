/**
 * SGDUS AI/ML Service
 * BrainSAIT Neural AI Integration
 * 
 * Provides:
 * - Natural Language Processing (Arabic/English)
 * - Sentiment Analysis
 * - OCR/Text Recognition
 * - Predictive Analytics
 * - Recommendation Engine
 * 
 * OID Root: 1.3.6.1.4.1.61026
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { Pool } = require('pg');
const { createClient } = require('redis');
const natural = require('natural');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const winston = require('winston');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

// ==================== CONFIGURATION ====================
const CONFIG = {
    port: process.env.PORT || 3007,
    postgres: {
        host: process.env.POSTGRES_HOST || 'localhost',
        port: process.env.POSTGRES_PORT || 5432,
        database: process.env.POSTGRES_DB || 'sgdus',
        user: process.env.POSTGRES_USER || 'postgres',
        password: process.env.POSTGRES_PASSWORD || 'postgres'
    },
    redis: {
        url: process.env.REDIS_URL || 'redis://localhost:6379'
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'sgdus-ai-secret-key'
    }
};

// ==================== LOGGER SETUP ====================
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});

// ==================== NLP SETUP ====================
const tokenizer = new natural.WordTokenizer();
const Analyzer = natural.SentimentAnalyzer;
const stemmer = natural.PorterStemmer;
const analyzer = new Analyzer('Arabic', stemmer, 'afinn');

// Support both Arabic and English
const arabicStopWords = new Set([
    'في', 'من', 'على', 'إلى', 'عن', 'مع', 'هذا', 'هذه', 'التي', 'الذي',
    'أن', 'كان', 'ليس', 'ما', 'لا', 'لم', 'لن', 'هو', 'هي', 'هم', 'أنا', 'نحن'
]);

// ==================== DATABASE CONNECTION ====================
const pool = new Pool(CONFIG.postgres);

// ==================== REDIS CONNECTION ====================
let redisClient;
(async () => {
    redisClient = createClient({ url: CONFIG.redis.url });
    redisClient.on('error', (err) => logger.error('Redis Client Error', err));
    await redisClient.connect();
    logger.info('Connected to Redis');
})();

// ==================== EXPRESS APP ====================
const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500
});
app.use(limiter);

// ==================== AUTHENTICATION ====================
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }
    
    jwt.verify(token, CONFIG.jwt.secret, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
};

// ==================== AI ENDPOINTS ====================

/**
 * NLP Text Processing
 * POST /api/ai/nlp/process
 */
app.post('/api/ai/nlp/process',
    authenticateToken,
    [
        body('text').isString().notEmpty(),
        body('language').optional().isIn(['ar', 'en', 'auto'])
    ],
    async (req, res) => {
        try {
            const { text, language = 'auto' } = req.body;
            
            // Detect language if auto
            let detectedLang = language;
            if (language === 'auto') {
                detectedLang = detectLanguage(text);
            }
            
            // Tokenize
            const tokens = tokenizer.tokenize(text);
            
            // Remove stop words
            const filteredTokens = tokens.filter(t => {
                if (detectedLang === 'ar') {
                    return !arabicStopWords.has(t);
                }
                return true;
            });
            
            // Stemming
            const stems = filteredTokens.map(t => stemmer.stem(t));
            
            // Sentiment analysis
            const sentiment = analyzer.getSentiment(tokens);
            
            // Extract entities (simplified)
            const entities = extractEntities(text, detectedLang);
            
            // Intent detection
            const intent = detectIntent(text, detectedLang);
            
            res.json({
                success: true,
                language: detectedLang,
                tokens,
                filteredTokens,
                stems,
                sentiment: {
                    score: sentiment,
                    label: sentiment > 0 ? 'positive' : sentiment < 0 ? 'negative' : 'neutral'
                },
                entities,
                intent
            });
        } catch (error) {
            logger.error('NLP Error:', error);
            res.status(500).json({ error: 'NLP processing failed' });
        }
    }
);

/**
 * Language Detection
 * POST /api/ai/nlp/detect-language
 */
app.post('/api/ai/nlp/detect-language',
    authenticateToken,
    [body('text').isString().notEmpty()],
    async (req, res) => {
        try {
            const { text } = req.body;
            const language = detectLanguage(text);
            res.json({ success: true, language, confidence: 0.95 });
        } catch (error) {
            res.status(500).json({ error: 'Detection failed' });
        }
    }
);

/**
 * Translation (Mock - would connect to translation API)
 * POST /api/ai/translate
 */
app.post('/api/ai/translate',
    authenticateToken,
    [
        body('text').isString().notEmpty(),
        body('source').isIn(['ar', 'en']),
        body('target').isIn(['ar', 'en'])
    ],
    async (req, res) => {
        try {
            const { text, source, target } = req.body;
            
            // In production, use BrainSAIT translation API
            const translated = text; // Mock translation
            
            res.json({
                success: true,
                original: text,
                translated,
                source,
                target
            });
        } catch (error) {
            res.status(500).json({ error: 'Translation failed' });
        }
    }
);

/**
 * Sentiment Analysis
 * POST /api/ai/sentiment
 */
app.post('/api/ai/sentiment',
    authenticateToken,
    [body('text').isString().notEmpty()],
    async (req, res) => {
        try {
            const { text } = req.body;
            
            const tokens = tokenizer.tokenize(text);
            const score = analyzer.getSentiment(tokens);
            
            res.json({
                success: true,
                text,
                sentiment: {
                    score,
                    label: score > 0.1 ? 'positive' : score < -0.1 ? 'negative' : 'neutral',
                    confidence: Math.abs(score) > 0.5 ? 'high' : 'low'
                }
            });
        } catch (error) {
            res.status(500).json({ error: 'Sentiment analysis failed' });
        }
    }
);

/**
 * Intent Detection
 * POST /api/ai/intent
 */
app.post('/api/ai/intent',
    authenticateToken,
    [body('text').isString().notEmpty()],
    async (req, res) => {
        try {
            const { text } = req.body;
            const intent = detectIntent(text, 'auto');
            
            res.json({
                success: true,
                text,
                intent,
                confidence: 0.85
            });
        } catch (error) {
            res.status(500).json({ error: 'Intent detection failed' });
        }
    }
);

/**
 * Recommendation Engine
 * POST /api/ai/recommend
 */
app.post('/api/ai/recommend',
    authenticateToken,
    [body('profile').isObject()],
    async (req, res) => {
        try {
            const { profile } = req.body;
            
            // AI recommendation based on profile
            const recommendations = generateRecommendations(profile);
            
            res.json({
                success: true,
                recommendations
            });
        } catch (error) {
            res.status(500).json({ error: 'Recommendation failed' });
        }
    }
);

/**
 * Predictive Analytics
 * POST /api/ai/predict
 */
app.post('/api/ai/predict',
    authenticateToken,
    [
        body('citizenOid').matches(/^1\.3\.6\.1\.4\.1\.61026\./),
        body('data').isObject()
    ],
    async (req, res) => {
        try {
            const { citizenOid, data } = req.body;
            
            // ML predictions based on historical data
            const predictions = {
                nextService: predictNextService(data),
                renewalDue: predictRenewal(data),
                satisfactionScore: predictSatisfaction(data)
            };
            
            res.json({
                success: true,
                predictions
            });
        } catch (error) {
            res.status(500).json({ error: 'Prediction failed' });
        }
    }
);

/**
 * Chatbot/Conversational AI
 * POST /api/ai/chat
 */
app.post('/api/ai/chat',
    authenticateToken,
    [
        body('message').isString().notEmpty(),
        body('context').optional().isObject()
    ],
    async (req, res) => {
        try {
            const { message, context = {} } = req.body;
            
            // Generate AI response
            const response = await generateAIResponse(message, context);
            
            res.json({
                success: true,
                response,
                sessionId: context.sessionId || uuidv4()
            });
        } catch (error) {
            res.status(500).json({ error: 'Chat failed' });
        }
    }
);

/**
 * OCR - Text Extraction from Image
 * POST /api/ai/ocr
 */
app.post('/api/ai/ocr',
    authenticateToken,
    [body('image').isString()],
    async (req, res) => {
        try {
            const { image } = req.body;
            
            // In production, use ML model for OCR
            const extractedText = 'Extracted text from image'; // Mock
            
            res.json({
                success: true,
                text: extractedText,
                confidence: 0.92,
                language: 'ar'
            });
        } catch (error) {
            res.status(500).json({ error: 'OCR failed' });
        }
    }
);

/**
 * Voice Processing
 * POST /api/ai/voice
 */
app.post('/api/ai/voice',
    authenticateToken,
    [body('audio').isString()],
    async (req, res) => {
        try {
            const { audio } = req.body;
            
            // Speech to text
            const transcription = 'Transcribed text'; // Mock
            
            // Process as NLP
            const intent = detectIntent(transcription, 'ar');
            
            res.json({
                success: true,
                transcription,
                intent,
                language: 'ar'
            });
        } catch (error) {
            res.status(500).json({ error: 'Voice processing failed' });
        }
    }
);

// ==================== HELPER FUNCTIONS ====================

function detectLanguage(text) {
    // Simple Arabic detection
    const arabicRegex = /[\u0600-\u06FF]/;
    return arabicRegex.test(text) ? 'ar' : 'en';
}

function extractEntities(text, language) {
    const entities = [];
    
    // Government service keywords
    const services = {
        ar: ['صحة', 'تعليم', 'زراعة', 'مالية', 'عمل', 'عدالة'],
        en: ['health', 'education', 'agriculture', 'finance', 'labor', 'justice']
    };
    
    const langServices = services[language] || services.en;
    langServices.forEach(service => {
        if (text.toLowerCase().includes(service)) {
            entities.push({ type: 'SERVICE', value: service });
        }
    });
    
    // Location detection (Sudan states)
    const states = [' الخرائط', 'البحر الأحمر', 'دارفور', 'كسلا', 'الجزيرة'];
    states.forEach(state => {
        if (text.includes(state)) {
            entities.push({ type: 'LOCATION', value: state });
        }
    });
    
    return entities;
}

function detectIntent(text, language) {
    const lowerText = text.toLowerCase();
    
    // Common intents
    if (lowerText.includes('help') || lowerText.includes('مساعدة')) {
        return { name: 'help', confidence: 0.9 };
    }
    if (lowerText.includes('health') || lowerText.includes('صحة') || lowerText.includes('طبيب')) {
        return { name: 'health_inquiry', confidence: 0.85 };
    }
    if (lowerText.includes('education') || lowerText.includes('تعليم') || lowerText.includes('مدرسة')) {
        return { name: 'education_inquiry', confidence: 0.85 };
    }
    if (lowerText.includes('register') || lowerText.includes('تسجيل')) {
        return { name: 'registration', confidence: 0.9 };
    }
    if (lowerText.includes('check') || lowerText.includes('تحقق') || lowerText.includes('استعلام')) {
        return { name: 'inquiry', confidence: 0.8 };
    }
    
    return { name: 'general', confidence: 0.5 };
}

function generateRecommendations(profile) {
    const recommendations = [];
    
    // Age-based
    if (profile.age < 18) {
        recommendations.push({ service: 'education', priority: 'high', reason: 'Educational services available' });
    }
    if (profile.age > 60) {
        recommendations.push({ service: 'health', priority: 'high', reason: 'Elderly health programs' });
    }
    
    // Occupation-based
    if (profile.occupation === 'farmer') {
        recommendations.push({ service: 'agriculture', priority: 'high', reason: 'Agricultural subsidies' });
    }
    if (profile.employmentStatus === 'unemployed') {
        recommendations.push({ service: 'labor', priority: 'high', reason: 'Job placement services' });
    }
    
    // Income-based
    if (profile.incomeLevel === 'low') {
        recommendations.push({ service: 'social_welfare', priority: 'high', reason: 'Social assistance programs' });
    }
    
    return recommendations;
}

function predictNextService(data) {
    // Mock prediction
    return { service: 'health', probability: 0.75 };
}

function predictRenewal(data) {
    return { document: 'national_id', dueInDays: 90 };
}

function predictSatisfaction(data) {
    return { score: 0.82, trend: 'increasing' };
}

async function generateAIResponse(message, context) {
    const lowerMessage = message.toLowerCase();
    
    // Context-aware responses
    if (lowerMessage.includes('health') || lowerMessage.includes('صحة')) {
        return {
            text: 'للخدمات الصحية، يمكنك:\n1. عرض السجلات الطبية\n2. حجز موعد في المستشفى\n3. عرض التطعيمات\n\nاختر رقم الخدمة',
            quickReplies: ['1', '2', '3']
        };
    }
    
    if (lowerMessage.includes('education') || lowerMessage.includes('تعليم')) {
        return {
            text: 'للخدمات التعليمية:\n1. الشهادات الدراسية\n2. تسجيل المدارس\n3. نتائج الامتحانات',
            quickReplies: ['1', '2', '3']
        };
    }
    
    if (lowerMessage.includes('agriculture') || lowerMessage.includes('زراعة')) {
        return {
            text: 'الخدمات الزراعية:\n1. تسجيل المزارعين\n2. الدعم الزراعي\n3. أسعار المحاصيل',
            quickReplies: ['1', '2', '3']
        };
    }
    
    // Default response
    return {
        text: 'مرحباً! كيف يمكنني مساعدتك؟\n\nيمكنني帮助你 with:\n- الخدمات الصحية\n- الخدمات التعليمية\n- الخدمات الزراعية\n- الخدمات المالية\n- الخدمات الحكومية الأخرى',
        quickReplies: ['صحة', 'تعليم', 'زراعة', 'مالية']
    };
}

// ==================== HEALTH CHECK ====================
app.get('/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        await redisClient.ping();
        
        res.json({
            status: 'healthy',
            service: 'ai',
            timestamp: new Date().toISOString(),
            capabilities: ['nlp', 'sentiment', 'recommendations', 'prediction', 'ocr', 'voice']
        });
    } catch (error) {
        res.status(503).json({ status: 'unhealthy', error: error.message });
    }
});

// ==================== START SERVER ====================
app.listen(CONFIG.port, () => {
    logger.info(`AI Service running on port ${CONFIG.port}`);
    logger.info('BrainSAIT Neural AI Integration Ready');
});

module.exports = app;

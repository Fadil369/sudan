/**
 * SGDUS USSD Service
 * Basic Phone Access - Reaching 80% of Sudanese Citizens
 * 
 * USSD (Unstructured Supplementary Service Data) provides:
 * - Real-time, session-based text menus
 * - No internet required
 * - Works on all basic phones
 * - Arabic/English support
 * 
 * OID Root: 1.3.6.1.4.1.61026
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { Pool } = require('pg');
const { createClient } = require('redis');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const winston = require('winston');
const rateLimit = require('express-rate-limit');
const { body, validationResult, param, query } = require('express-validator');
require('dotenv').config();

// ==================== CONFIGURATION ====================
const CONFIG = {
    port: process.env.PORT || 3006,
    oidRoot: process.env.OID_ROOT || '1.3.6.1.4.1.61026',
    oidServiceUrl: process.env.OID_SERVICE_URL || null,
    oidServiceTimeoutMs: parseInt(process.env.OID_SERVICE_TIMEOUT_MS || '5000', 10),
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
        secret: process.env.JWT_SECRET || 'sgdus-ussd-secret-key'
    },
    sessionTimeout: 300, // 5 minutes
    maxMenuDepth: 5
};

// ==================== SUDAN STATES ====================
const SUDAN_STATE_LIST = Object.freeze([
    { code: '01', en: 'Khartoum', ar: 'الخرطوم' },
    { code: '02', en: 'Red Sea', ar: 'البحر الأحمر' },
    { code: '03', en: 'Kassala', ar: 'كسلا' },
    { code: '04', en: 'Al Qadarif', ar: 'القضارف' },
    { code: '05', en: 'River Nile', ar: 'نهر النيل' },
    { code: '06', en: 'Northern', ar: 'الشمالية' },
    { code: '07', en: 'North Kordofan', ar: 'شمال كردفان' },
    { code: '08', en: 'South Kordofan', ar: 'جنوب كردفان' },
    { code: '09', en: 'West Kordofan', ar: 'غرب كردفان' },
    { code: '10', en: 'Blue Nile', ar: 'النيل الأزرق' },
    { code: '11', en: 'Sennar', ar: 'سنار' },
    { code: '12', en: 'White Nile', ar: 'النيل الأبيض' },
    { code: '13', en: 'North Darfur', ar: 'شمال دارفور' },
    { code: '14', en: 'South Darfur', ar: 'جنوب دارفور' },
    { code: '15', en: 'West Darfur', ar: 'غرب دارفور' },
    { code: '16', en: 'Central Darfur', ar: 'وسط دارفور' },
    { code: '17', en: 'East Darfur', ar: 'شرق دارفور' },
    { code: '18', en: 'Al Jazirah', ar: 'الجزيرة' },
]);

const SUDAN_STATE_BY_CODE = Object.freeze(Object.fromEntries(SUDAN_STATE_LIST.map((s) => [s.code, s])));

function getStateName(stateCode, language = 'en') {
    const entry = SUDAN_STATE_BY_CODE[stateCode];
    if (!entry) return stateCode;
    return language === 'ar' ? entry.ar : entry.en;
}

function generateNationalId(stateCode) {
    // 10 digits total (matches init.sql data quality rule): [2-digit state][8 random digits]
    const value = crypto.randomBytes(4).readUInt32BE(0) % 100000000;
    return `${stateCode}${String(value).padStart(8, '0')}`;
}

async function findExistingOid({ type, stateCode, entityId }) {
    const result = await pool.query(
        `SELECT oid FROM oid_registry WHERE type = $1 AND state_code = $2 AND entity_id = $3 ORDER BY created_at DESC LIMIT 1`,
        [type, stateCode, entityId]
    );
    return result.rows[0]?.oid || null;
}

async function ensureOidLocal({ type, stateCode, entityId, metadata }) {
    const existing = await findExistingOid({ type, stateCode, entityId });
    if (existing) return existing;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const counterResult = await client.query(
            `INSERT INTO oid_counters (type, state_code, counter)
             VALUES ($1, $2, 1)
             ON CONFLICT (type, state_code)
             DO UPDATE SET counter = oid_counters.counter + 1, updated_at = CURRENT_TIMESTAMP
             RETURNING counter`,
            [type, stateCode]
        );

        const counter = counterResult.rows[0].counter;
        const oid = `${CONFIG.oidRoot}.${type}.${stateCode}.${String(counter).padStart(8, '0')}`;

        await client.query(
            `INSERT INTO oid_registry (oid, type, state_code, entity_id, metadata, status)
             VALUES ($1, $2, $3, $4, $5::jsonb, 'active')`,
            [oid, type, stateCode, entityId, JSON.stringify(metadata ?? {})]
        );

        await client.query('COMMIT');
        return oid;
    } catch (err) {
        try {
            await client.query('ROLLBACK');
        } catch {
            // ignore rollback errors
        }

        if (err && err.code === '23505') {
            const concurrent = await findExistingOid({ type, stateCode, entityId });
            if (concurrent) return concurrent;
        }

        throw err;
    } finally {
        client.release();
    }
}

async function ensureOid({ type, stateCode, entityId, metadata }) {
    if (CONFIG.oidServiceUrl) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), CONFIG.oidServiceTimeoutMs);
        try {
            const response = await fetch(`${CONFIG.oidServiceUrl}/api/v1/oid/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, stateCode, entityId, metadata }),
                signal: controller.signal
            });

            if (response.ok) {
                const payload = await response.json();
                if (payload?.oid) return payload.oid;
            }

            logger.warn('OID service non-OK response, falling back', { status: response.status });
        } catch (err) {
            logger.warn('OID service request failed, falling back', { error: err.message });
        } finally {
            clearTimeout(timeout);
        }
    }

    return ensureOidLocal({ type, stateCode, entityId, metadata });
}

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
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100 // 100 USSD requests per minute
});
app.use(limiter);

// ==================== USSD MENU SYSTEM ====================

// Main Menu
const MENUS = {
    MAIN: {
        id: 'main',
        ar: 'الخدمات الحكومية السودانية\n======\n1. تسجيل مواطن جديد\n2. التحقق من الهوية\n3. الخدمات الصحية\n4. الخدمات التعليمية\n5. الخدمات الزراعية\n6. الخدمات المالية\n7. حالة الطلب\n0. خروج',
        en: 'Sudan Government Services\n======\n1. New Citizen Registration\n2. Identity Verification\n3. Health Services\n4. Education Services\n5. Agriculture Services\n6. Financial Services\n7. Application Status\n0. Exit'
    },
    
    // Registration Flow
    REGISTRATION_START: {
        id: 'reg_start',
        ar: 'تسجيل مواطن جديد\n======\nالرجاء إدخال رقم الهاتف الشخصي (10 أرقام):',
        en: 'New Citizen Registration\n======\nPlease enter your personal phone number (10 digits):'
    },
    REGISTRATION_NAME: {
        id: 'reg_name',
        ar: 'الرجاء إدخال الاسم الأول:',
        en: 'Please enter your first name:'
    },
    REGISTRATION_MIDDLE: {
        id: 'reg_middle',
        ar: 'الرجاء إدخال اسم الأب:',
        en: 'Please enter your father\'s name:'
    },
    REGISTRATION_LAST: {
        id: 'reg_last',
        ar: 'الرجاء إدخال اسم العائلة:',
        en: 'Please enter your last name:'
    },
    REGISTRATION_DOB: {
        id: 'reg_dob',
        ar: 'الرجاء إدخال تاريخ الميلاد (YYYY-MM-DD):',
        en: 'Please enter date of birth (YYYY-MM-DD):'
    },
    REGISTRATION_GENDER: {
        id: 'reg_gender',
        ar: 'اختر الجنس:\n1. ذكر\n2. أنثى',
        en: 'Select gender:\n1. Male\n2. Female'
    },
    REGISTRATION_STATE: {
        id: 'reg_state',
        ar: 'اختر الولاية:\n1. الخرائط\n2. البحر الأحمر\n3. شمال دارفور\n4. جنوب دارفور\n5. القضارف\n6. شمال كردفان\n7. جنوب كردفان\n8. سنار\n9. غرب دارفور\n10. كسلا\n11. الشمالية\n12. نهر النيل\n13. الجزيرة\n14. النيل الأبيض\n15. النيل الأزرق\n16. سنار\n17. البحيرات\n18. شرق الاستوائية',
        en: 'Select state:\n1. Khartoum\n2. Red Sea\n3. North Darfur\n4. South Darfur\n5. Gedarif\n6. North Kordufan\n7. South Kordufan\n8. Sennar\n9. West Darfur\n10. Kassala\n11. Northern\n12. River Nile\n13. Gezira\n14. White Nile\n15. Blue Nile\n16. Sinar\n17. Lakes\n18. East Equatoria'
    },
    REGISTRATION_ADDRESS: {
        id: 'reg_address',
        ar: 'الرجاء إدخال العنوان بالتفصيل:',
        en: 'Please enter your full address:'
    },
    REGISTRATION_CONFIRM: {
        id: 'reg_confirm',
        ar: 'تأكيد التسجيل\n======\n1. تأكيد\n2. إلغاء',
        en: 'Confirm Registration\n======\n1. Confirm\n2. Cancel'
    },
    
    // Identity Verification
    VERIFY_START: {
        id: 'verify_start',
        ar: 'التحقق من الهوية\n======\nالرجاء إدخال رقم الهوية الوطنية (10 أرقام):',
        en: 'Identity Verification\n======\nPlease enter your National ID number (10 digits):'
    },
    VERIFY_OTP: {
        id: 'verify_otp',
        ar: 'تم إرسال رمز التحقق إلى هاتفك. الرجاء إدخال الرمز:',
        en: 'Verification code sent to your phone. Please enter the code:'
    },
    
    // Health Services
    HEALTH_MENU: {
        id: 'health',
        ar: 'الخدمات الصحية\n======\n1. أقرب مستشفى\n2. طلب إسعاف\n3. البطاقة الصحية\n4. التطعيمات\n5. الوصفات الطبية\n0. 返回主菜单',
        en: 'Health Services\n======\n1. Nearest Hospital\n2. Ambulance Request\n3. Health Card\n4. Vaccinations\n5. Prescriptions\n0. Back to Main Menu'
    },
    
    // Education Services
    EDUCATION_MENU: {
        id: 'education',
        ar: 'الخدمات التعليمية\n======\n1. الشهادات\n2. المدارس القريبة\n3. نتائج الامتحانات\n4. التسجيل الدراسي\n0. 返回主菜单',
        en: 'Education Services\n======\n1. Certificates\n2. Nearby Schools\n3. Exam Results\n4. School Registration\n0. Back to Main Menu'
    },
    
    // Agriculture Services
    AGRICULTURE_MENU: {
        id: 'agriculture',
        ar: 'الخدمات الزراعية\n======\n1. تسجيل مزارع\n2. أسعار المحاصيل\n3. الطقس\n4. الدعم الزراعي\n0. 返回主菜单',
        en: 'Agriculture Services\n======\n1. Farm Registration\n2. Crop Prices\n3. Weather\n4. Agricultural Support\n0. Back to Main Menu'
    },
    
    // Financial Services
    FINANCIAL_MENU: {
        id: 'financial',
        ar: 'الخدمات المالية\n======\n1. التحقق من الضرائب\n2. المساعدة الاجتماعية\n3. الحساب المصرفي\n0. 返回主菜单',
        en: 'Financial Services\n======\n1. Tax Verification\n2. Social Assistance\n3. Bank Account\n0. Back to Main Menu'
    },
    
    // Application Status
    APPLICATION_STATUS: {
        id: 'app_status',
        ar: 'حالة الطلب\n======\nالرجاء إدخال رقم الطلب:',
        en: 'Application Status\n======\nPlease enter your application number:'
    },
    
    // Success/Error Messages
    SUCCESS: {
        id: 'success',
        ar: '✅ تم بنجاح',
        en: '✅ Success'
    },
    ERROR: {
        id: 'error',
        ar: '❌ حدث خطأ',
        en: '❌ An error occurred'
    },
    NOT_FOUND: {
        id: 'not_found',
        ar: '⚠️ لم يتم العثور على البيانات',
        en: '⚠️ Data not found'
    },
    GOODBYE: {
        id: 'goodbye',
        ar: 'شكراً لاستخدامك الخدمات الحكومية السودانية\nمع السلامة',
        en: 'Thank you for using Sudan Government Services\nGoodbye'
    }
};

// ==================== USSD SESSION MANAGEMENT ====================

/**
 * Create or update USSD session
 */
async function getOrCreateSession(phoneNumber) {
    // Try to get existing session
    const existingSession = await redisClient.get(`ussd:session:${phoneNumber}`);
    
    if (existingSession) {
        const session = JSON.parse(existingSession);
        session.lastActivity = Date.now();
        await redisClient.set(
            `ussd:session:${phoneNumber}`,
            JSON.stringify(session),
            { EX: CONFIG.sessionTimeout }
        );
        return session;
    }
    
    // Create new session
    const session = {
        id: uuidv4(),
        phoneNumber,
        state: 'main',
        step: 0,
        data: {},
        language: 'ar',
        createdAt: Date.now(),
        lastActivity: Date.now()
    };
    
    await redisClient.set(
        `ussd:session:${phoneNumber}`,
        JSON.stringify(session),
        { EX: CONFIG.sessionTimeout }
    );
    
    return session;
}

/**
 * Update session state
 */
async function updateSession(phoneNumber, updates) {
    const session = await getOrCreateSession(phoneNumber);
    Object.assign(session, updates);
    session.lastActivity = Date.now();
    
    await redisClient.set(
        `ussd:session:${phoneNumber}`,
        JSON.stringify(session),
        { EX: CONFIG.sessionTimeout }
    );
    
    return session;
}

/**
 * Clear session
 */
async function clearSession(phoneNumber) {
    await redisClient.del(`ussd:session:${phoneNumber}`);
}

// ==================== MENU HANDLERS ====================

/**
 * Process user input and return appropriate menu response
 */
async function processMenu(phoneNumber, userInput) {
    const session = await getOrCreateSession(phoneNumber);
    const language = session.language || 'ar';
    
    // Helper function to get localized menu text
    const t = (menuId) => MENUS[menuId]?.[language] || MENUS[menuId]?.en || '';
    
    // Process based on current state
    switch (session.state) {
        case 'main':
            return await handleMainMenu(session, userInput, t);
            
        case 'registration_start':
            return await handleRegistration(session, userInput, t);
            
        case 'registration_name':
        case 'registration_middle':
        case 'registration_last':
        case 'registration_dob':
        case 'registration_gender':
        case 'registration_state':
        case 'registration_address':
            return await handleRegistrationFlow(session, userInput, t);
            
        case 'registration_confirm':
            return await handleRegistrationConfirm(session, userInput, t);
            
        case 'verify_start':
            return await handleVerification(session, userInput, t);
            
        case 'verify_otp':
            return await handleVerificationOTP(session, userInput, t);
            
        case 'health_menu':
        case 'education_menu':
        case 'agriculture_menu':
        case 'financial_menu':
            return await handleSubMenu(session, userInput, t);
            
        case 'app_status':
            return await handleApplicationStatus(session, userInput, t);
            
        default:
            // Reset to main menu
            await updateSession(phoneNumber, { state: 'main', step: 0 });
            return t('MAIN');
    }
}

/**
 * Handle main menu selection
 */
async function handleMainMenu(session, input, t) {
    const choice = input.trim();
    
    switch (choice) {
        case '1': // New Registration
            await updateSession(session.phoneNumber, {
                state: 'registration_start',
                step: 1,
                data: {}
            });
            return t('REGISTRATION_START');
            
        case '2': // Identity Verification
            await updateSession(session.phoneNumber, {
                state: 'verify_start',
                step: 1,
                data: {}
            });
            return t('VERIFY_START');
            
        case '3': // Health Services
            await updateSession(session.phoneNumber, {
                state: 'health_menu',
                step: 1
            });
            return t('HEALTH_MENU');
            
        case '4': // Education Services
            await updateSession(session.phoneNumber, {
                state: 'education_menu',
                step: 1
            });
            return t('EDUCATION_MENU');
            
        case '5': // Agriculture Services
            await updateSession(session.phoneNumber, {
                state: 'agriculture_menu',
                step: 1
            });
            return t('AGRICULTURE_MENU');
            
        case '6': // Financial Services
            await updateSession(session.phoneNumber, {
                state: 'financial_menu',
                step: 1
            });
            return t('FINANCIAL_MENU');
            
        case '7': // Application Status
            await updateSession(session.phoneNumber, {
                state: 'app_status',
                step: 1
            });
            return t('APPLICATION_STATUS');
            
        case '0': // Exit
            await clearSession(session.phoneNumber);
            return t('GOODBYE');
            
        case '99': // Language toggle
            const newLang = session.language === 'ar' ? 'en' : 'ar';
            await updateSession(session.phoneNumber, { language: newLang });
            return t('MAIN');
            
        default:
            return t('MAIN') + '\n\n⚠️ Invalid choice. Please try again.';
    }
}

/**
 * Handle registration start - phone number entry
 */
async function handleRegistration(session, input, t) {
    const phoneNumber = input.trim();
    
    // Validate phone number format (+249xxxxxxxxx)
    if (!/^\+249\d{9}$/.test(phoneNumber) && !/^249\d{9}$/.test(phoneNumber)) {
        return t('REGISTRATION_START') + '\n\n⚠️ Invalid phone format. Use: +249xxxxxxxxx';
    }
    
    // Store phone and move to next step
    session.data.phoneNumber = phoneNumber;
    await updateSession(session.phoneNumber, {
        state: 'registration_name',
        step: 2,
        data: session.data
    });
    
    return t('REGISTRATION_NAME');
}

/**
 * Handle registration flow
 */
async function handleRegistrationFlow(session, input, t) {
    const state = session.state;
    const data = { ...session.data };
    
    if (state === 'registration_name') {
        data.firstName = input.trim();
        await updateSession(session.phoneNumber, {
            state: 'registration_middle',
            step: 3,
            data
        });
        return t('REGISTRATION_MIDDLE');
    }
    
    if (state === 'registration_middle') {
        data.middleName = input.trim();
        await updateSession(session.phoneNumber, {
            state: 'registration_last',
            step: 4,
            data
        });
        return t('REGISTRATION_LAST');
    }
    
    if (state === 'registration_last') {
        data.lastName = input.trim();
        await updateSession(session.phoneNumber, {
            state: 'registration_dob',
            step: 5,
            data
        });
        return t('REGISTRATION_DOB');
    }
    
    if (state === 'registration_dob') {
        // Validate date format
        const dob = input.trim();
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
            return t('REGISTRATION_DOB') + '\n\n⚠️ Invalid format. Use: YYYY-MM-DD';
        }
        data.dateOfBirth = dob;
        await updateSession(session.phoneNumber, {
            state: 'registration_gender',
            step: 6,
            data
        });
        return t('REGISTRATION_GENDER');
    }
    
    if (state === 'registration_gender') {
        const choice = input.trim();
        if (choice === '1') {
            data.gender = 'M';
        } else if (choice === '2') {
            data.gender = 'F';
        } else {
            return t('REGISTRATION_GENDER') + '\n\n⚠️ Please enter 1 or 2';
        }
        
        await updateSession(session.phoneNumber, {
            state: 'registration_state',
            step: 7,
            data
        });
        return t('REGISTRATION_STATE');
    }
    
    if (state === 'registration_state') {
        const choice = parseInt(input.trim());
        if (!Number.isInteger(choice) || choice < 1 || choice > SUDAN_STATE_LIST.length) {
            return t('REGISTRATION_STATE') + '\n\n⚠️ Please enter a number 1-18';
        }

        const stateEntry = SUDAN_STATE_LIST[choice - 1];
        data.stateCode = stateEntry.code;
        data.stateName = getStateName(stateEntry.code, session.language);
        
        await updateSession(session.phoneNumber, {
            state: 'registration_address',
            step: 8,
            data
        });
        return t('REGISTRATION_ADDRESS');
    }
    
    if (state === 'registration_address') {
        data.address = input.trim();
        
        // Show confirmation
        await updateSession(session.phoneNumber, {
            state: 'registration_confirm',
            step: 9,
            data
        });
        
        const summary = `\n\n${session.language === 'ar' ? 'ملخص البيانات:' : 'Data Summary:'}
${data.firstName} ${data.middleName} ${data.lastName}
${data.dateOfBirth}
${data.gender === 'M' ? (session.language === 'ar' ? 'ذكر' : 'Male') : (session.language === 'ar' ? 'أنثى' : 'Female')}
${data.stateName}
${data.phoneNumber}`;
        
        return t('REGISTRATION_CONFIRM') + summary;
    }
    
    return t('ERROR');
}

/**
 * Handle registration confirmation
 */
async function handleRegistrationConfirm(session, input, t) {
    const choice = input.trim();
    
    if (choice === '1') {
        // Submit registration
        try {
            const stateCode = session.data.stateCode;
            const nationalId = generateNationalId(stateCode);

            // OID type 2 = citizens (sudan.md hierarchy)
            const oid = await ensureOid({
                type: 2,
                stateCode,
                entityId: nationalId,
                metadata: { entityType: 'citizen', source: 'ussd', phoneNumber: session.data.phoneNumber }
            });
            
            // Insert citizen
            await pool.query(
                `INSERT INTO citizens 
                (oid, national_id, first_name, middle_name, last_name, date_of_birth, gender, phone_number, address, state_code, status)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'active')`,
                [
                    oid,
                    nationalId,
                    session.data.firstName,
                    session.data.middleName,
                    session.data.lastName,
                    session.data.dateOfBirth,
                    session.data.gender,
                    session.data.phoneNumber,
                    session.data.address,
                    session.data.stateCode
                ]
            );
            
            // Log to audit
            await pool.query(
                `INSERT INTO audit_logs (event, user_oid, entity_oid, entity_type, new_value)
                VALUES ($1, $2, $3, $4, $5)`,
                ['USSD_REGISTRATION', oid, oid, 'citizen', JSON.stringify(session.data)]
            );
            
            await clearSession(session.phoneNumber);
            
            const successMsg = `\n\n✅ ${session.language === 'ar' ? 'تم التسجيل بنجاح!' : 'Registration successful!'}
${session.language === 'ar' ? 'رقم الهوية:' : 'National ID:'} ${nationalId}
OID: ${oid}
${session.language === 'ar' ? 'احتفظ بهذه المعلومات للاستخدام المستقبلي' : 'Keep this information for future use'}`;
            
            return t('GOODBYE') + successMsg;
            
        } catch (error) {
            logger.error('Registration error:', error);
            return t('ERROR') + '\n\n' + (session.language === 'ar' ? 'الرجاء المحاولة مرة أخرى' : 'Please try again');
        }
    } else if (choice === '2') {
        // Cancel
        await clearSession(session.phoneNumber);
        return t('GOODBYE');
    }
    
    return t('REGISTRATION_CONFIRM') + '\n\n⚠️ Invalid choice';
}

/**
 * Handle identity verification
 */
async function handleVerification(session, input, t) {
    const nationalId = input.trim();
    
    // Validate format
    if (!/^\d{10}$/.test(nationalId)) {
        return t('VERIFY_START') + '\n\n⚠️ National ID must be 10 digits';
    }
    
    try {
        // Check if citizen exists
        const result = await pool.query(
            `SELECT c.*, o.oid FROM citizens c 
            JOIN oid_registry o ON c.oid = o.oid 
            WHERE c.national_id = $1`,
            [nationalId]
        );
        
        if (result.rows.length === 0) {
            return t('NOT_FOUND') + '\n\n' + (session.language === 'ar' ? 'لم يتم العثور على مواطن بهذا الرقم' : 'No citizen found with this ID');
        }
        
        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Store OTP temporarily
        await redisClient.set(
            `ussd:otp:${nationalId}`,
            otp,
            { EX: 300 } // 5 minutes
        );
        
        session.data.nationalId = nationalId;
        await updateSession(session.phoneNumber, {
            state: 'verify_otp',
            step: 2,
            data: session.data
        });
        
        // In production, send SMS
        logger.info(`OTP for ${nationalId}: ${otp}`);
        
        return t('VERIFY_OTP');
        
    } catch (error) {
        logger.error('Verification error:', error);
        return t('ERROR');
    }
}

/**
 * Handle OTP verification
 */
async function handleVerificationOTP(session, input, t) {
    const enteredOtp = input.trim();
    const nationalId = session.data.nationalId;
    
    try {
        const storedOtp = await redisClient.get(`ussd:otp:${nationalId}`);
        
        if (!storedOtp) {
            return t('ERROR') + '\n\n' + (session.language === 'ar' ? 'انتهت صلاحية الرمز' : 'Code expired');
        }
        
        if (enteredOtp !== storedOtp) {
            return t('VERIFY_OTP') + '\n\n⚠️ ' + (session.language === 'ar' ? 'رمز خاطئ' : 'Incorrect code');
        }
        
        // Get citizen data
        const result = await pool.query(
            `SELECT c.*, o.oid FROM citizens c 
            JOIN oid_registry o ON c.oid = o.oid 
            WHERE c.national_id = $1`,
            [nationalId]
        );
        
        const citizen = result.rows[0];
        
        // Clear OTP
        await redisClient.del(`ussd:otp:${nationalId}`);
        await clearSession(session.phoneNumber);
        
        const info = `
${session.language === 'ar' ? '✅ تم التحقق بنجاح!' : '✅ Verification successful!'}
========================
${session.language === 'ar' ? 'الاسم:' : 'Name:'} ${citizen.first_name} ${citizen.middle_name} ${citizen.last_name}
${session.language === 'ar' ? 'رقم الهاتف:' : 'Phone:'} ${citizen.phone_number}
${session.language === 'ar' ? 'الولاية:' : 'State:'} ${getStateName(citizen.state_code, session.language)}
OID: ${citizen.oid}
${session.language === 'ar' ? 'الحالة:' : 'Status:'} ${citizen.status}`;
        
        return t('GOODBYE') + info;
        
    } catch (error) {
        logger.error('OTP verification error:', error);
        return t('ERROR');
    }
}

/**
 * Handle sub-menu selections
 */
async function handleSubMenu(session, input, t) {
    const choice = input.trim();
    
    if (choice === '0') {
        await updateSession(session.phoneNumber, { state: 'main', step: 0 });
        return t('MAIN');
    }
    
    // For each sub-menu, show relevant information
    const menuResponses = {
        health_menu: {
            '1': session.language === 'ar' ? '🏥 أقرب مستشفى: الرجاء الاتصال ب 999' : '🏥 Nearest Hospital: Call 999',
            '2': session.language === 'ar' ? '🚑 تم طلب الإسعاف. الرجاء انتظار الاتصال' : '🚑 Ambulance requested. Please wait for call.',
            '3': session.language === 'ar' ? '💳 خدمة البطاقة الصحية قيد التطوير' : '💳 Health card service coming soon.',
            '4': session.language === 'ar' ? '💉 التطعيمات:قم بزيارة أقرب مركز صحي' : '💉 Vaccinations: Visit nearest health center.',
            '5': session.language === 'ar' ? '💊 الوصفات الطبية: راجع أقرب صيدلية' : '💊 Prescriptions: Visit nearest pharmacy.'
        },
        education_menu: {
            '1': session.language === 'ar' ? '📜 الشهادات: زر nearest school' : '📜 Certificates: Visit nearest school.',
            '2': session.language === 'ar' ? '🏫 المدارس: ابحث في التطبيق' : '🏫 Schools: Search in app.',
            '3': session.language === 'ar' ? '📝 نتائج الامتحانات: متوفرة قريباً' : '📝 Exam results: Coming soon.',
            '4': session.language === 'ar' ? '📚 التسجيل الدراسي: ابدأ قريباً' : '📚 School registration: Coming soon.'
        },
        agriculture_menu: {
            '1': session.language === 'ar' ? '🌾 تسجيل المزارع: زر وزارة الزراعة' : '🌾 Farm registration: Visit Agriculture Ministry.',
            '2': session.language === 'ar' ? '💰 أسعار المحاصيل: متوفرة في التطبيق' : '💰 Crop prices: Available in app.',
            '3': session.language === 'ar' ? '☁️ الطقس: ابحث في التطبيق' : '☁️ Weather: Search in app.',
            '4': session.language === 'ar' ? '🤝 الدعم الزراعي: تواصل مع الوزارة' : '🤝 Agricultural support: Contact Ministry.'
        },
        financial_menu: {
            '1': session.language === 'ar' ? '💳 الضرائب: زر مكتب الضرائب' : '💳 Tax: Visit Tax Office.',
            '2': session.language === 'ar' ? '🤝 المساعدة الاجتماعية: تواصل مع الشؤون الاجتماعية' : '🤝 Social assistance: Contact Social Welfare.',
            '3': session.language === 'ar' ? '🏦 الحساب المصرفي: تواصل مع البنك' : '🏦 Bank account: Contact bank.'
        }
    };
    
    const responses = menuResponses[session.state];
    if (responses && responses[choice]) {
        return responses[choice] + '\n\n0. ' + (session.language === 'ar' ? 'القائمة السابقة' : 'Back');
    }
    
    return t('ERROR') + '\n\n⚠️ Invalid choice';
}

/**
 * Handle application status lookup
 */
async function handleApplicationStatus(session, input, t) {
    const appNumber = input.trim();
    
    try {
        // Check application status (mock)
        const result = await pool.query(
            `SELECT * FROM audit_logs WHERE entity_oid LIKE $1 ORDER BY created_at DESC LIMIT 1`,
            [`%${appNumber}%`]
        );
        
        if (result.rows.length === 0) {
            return t('NOT_FOUND') + '\n\n' + (session.language === 'ar' ? 'لم يتم العثور على طلب' : 'Application not found');
        }
        
        const app = result.rows[0];
        
        await clearSession(session.phoneNumber);
        
        const status = `
${session.language === 'ar' ? '📋 حالة الطلب:' : '📋 Application Status:'}
${session.language === 'ar' ? 'الحدث:' : 'Event:'} ${app.event}
${session.language === 'ar' ? 'التاريخ:' : 'Date:'} ${app.created_at}`;
        
        return t('GOODBYE') + status;
        
    } catch (error) {
        logger.error('Application status error:', error);
        return t('ERROR');
    }
}

// ==================== USSD ENDPOINT ====================

/**
 * Main USSD callback endpoint (Africa's Talking format)
 * POST /api/ussd
 */
app.post('/api/ussd', async (req, res) => {
    try {
        // Parse Africa'...
        const { phoneNumber, text, sessionId, serviceCode } = req.body;
        
        // Clean phone number
        const cleanPhone = phoneNumber.replace(/^\+/, '');
        
        logger.info(`USSD Request: ${cleanPhone} - "${text}"`);
        
        // Get or create session
        const session = await getOrCreateSession(cleanPhone);
        
        // Determine input (first input or continuation)
        const input = text || '1';
        
        // Process menu
        const response = await processMenu(cleanPhone, input);
        
        // Log to database
        await pool.query(
            `INSERT INTO ussd_sessions 
            (session_id, phone_number, state, step, data)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (session_id) DO UPDATE SET 
                state = $3, step = $4, data = $5, updated_at = NOW()`,
            [session.id, cleanPhone, session.state, session.step, JSON.stringify(session.data)]
        );
        
        // Return USSD response
        res.send('CON ' + response);
        
    } catch (error) {
        logger.error('USSD Error:', error);
        res.send('END An error occurred. Please try again.');
    }
});

// ==================== SIMPLE ENDPOINT FOR TESTING ====================

/**
 * Simple text-based endpoint for testing
 * POST /api/ussd/simple
 */
app.post('/api/ussd/simple', async (req, res) => {
    try {
        const { phoneNumber, input, language } = req.body;
        
        if (!phoneNumber || !input) {
            return res.status(400).json({ error: 'phoneNumber and input required' });
        }
        
        // Set language if provided
        if (language) {
            await updateSession(phoneNumber, { language });
        }
        
        // Process menu
        const response = await processMenu(phoneNumber, input);
        
        res.json({
            response,
            phoneNumber
        });
        
    } catch (error) {
        logger.error('USSD Simple Error:', error);
        res.status(500).json({ error: 'Processing failed' });
    }
});

// ==================== SESSION MANAGEMENT ====================

/**
 * Get session info
 * GET /api/ussd/session/:phoneNumber
 */
app.get('/api/ussd/session/:phoneNumber', async (req, res) => {
    try {
        const { phoneNumber } = req.params;
        
        const session = await redisClient.get(`ussd:session:${phoneNumber}`);
        
        if (!session) {
            return res.status(404).json({ error: 'No active session' });
        }
        
        res.json(JSON.parse(session));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== STATISTICS ====================

/**
 * Get USSD statistics
 * GET /api/ussd/stats
 */
app.get('/api/ussd/stats', async (req, res) => {
    try {
        const totalSessions = await pool.query(
            `SELECT COUNT(*) as total FROM ussd_sessions WHERE created_at > NOW() - INTERVAL '30 days'`
        );
        
        const activeSessions = await redisClient.keys('ussd:session:*');
        
        const popularMenus = await pool.query(`
            SELECT state, COUNT(*) as count 
            FROM ussd_sessions 
            WHERE created_at > NOW() - INTERVAL '7 days'
            GROUP BY state 
            ORDER BY count DESC 
            LIMIT 10
        `);
        
        res.json({
            totalSessions30Days: parseInt(totalSessions.rows[0].total),
            activeSessionsNow: activeSessions.length,
            popularMenus: popularMenus.rows
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== HEALTH CHECK ====================

app.get('/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        await redisClient.ping();
        
        res.json({
            status: 'healthy',
            service: 'ussd',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            error: error.message
        });
    }
});

// ==================== START SERVER ====================
app.listen(CONFIG.port, () => {
    logger.info(`USSD Service running on port ${CONFIG.port}`);
    logger.info('Ready to serve 80% of Sudanese citizens via basic phones');
});

module.exports = app;

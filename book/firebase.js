// ==============================================
// Firebase Configuration - Unified Service
// Secure initialization with environment variables
// ==============================================

const admin = require('firebase-admin');

let firebaseApp = null;
let databaseInstance = null;
let authInstance = null;

class FirebaseService {
    static initialize() {
        if (!firebaseApp && !admin.apps.length) {
            try {
                // Validate environment variables
                const requiredEnvVars = [
                    'FIREBASE_PROJECT_ID',
                    'FIREBASE_CLIENT_EMAIL',
                    'FIREBASE_PRIVATE_KEY',
                    'FIREBASE_DB_URL'
                ];
                
                const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
                
                if (missingVars.length > 0) {
                    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
                }
                
                // Format private key (handle newline characters)
                const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
                
                firebaseApp = admin.initializeApp({
                    credential: admin.credential.cert({
                        projectId: process.env.FIREBASE_PROJECT_ID,
                        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                        privateKey: privateKey
                    }),
                    databaseURL: process.env.FIREBASE_DB_URL,
                    storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`
                });
                
                console.log('Firebase initialized successfully');
                
            } catch (error) {
                console.error('Firebase initialization error:', error);
                throw error;
            }
        }
        
        return firebaseApp;
    }
    
    static getDatabase() {
        if (!databaseInstance) {
            const app = this.initialize();
            databaseInstance = app.database();
        }
        return databaseInstance;
    }
    
    static getAuth() {
        if (!authInstance) {
            const app = this.initialize();
            authInstance = app.auth();
        }
        return authInstance;
    }
    
    static async validateToken(token) {
        try {
            const decodedToken = await admin.auth().verifyIdToken(token);
            return { valid: true, uid: decodedToken.uid, email: decodedToken.email };
        } catch (error) {
            console.error('Token validation error:', error.message);
            return { valid: false, error: error.message };
        }
    }
    
    static async createCustomToken(uid, additionalClaims = {}) {
        try {
            const token = await admin.auth().createCustomToken(uid, additionalClaims);
            return { success: true, token };
        } catch (error) {
            console.error('Custom token creation error:', error);
            return { success: false, error: error.message };
        }
    }
    
    static async saveAccessToken(tokenData) {
        try {
            const database = this.getDatabase();
            const tokenRef = database.ref(`access_tokens/${tokenData.token}`);
            
            await tokenRef.set({
                ...tokenData,
                created_at: admin.database.ServerValue.TIMESTAMP,
                last_accessed: null,
                access_count: 0,
                active: true
            });
            
            console.log(`Access token saved: ${tokenData.token.substring(0, 8)}...`);
            return { success: true };
        } catch (error) {
            console.error('Error saving access token:', error);
            return { success: false, error: error.message };
        }
    }
    
    static async verifyAccessToken(token) {
        try {
            const database = this.getDatabase();
            const tokenRef = database.ref(`access_tokens/${token}`);
            const snapshot = await tokenRef.once('value');
            
            if (!snapshot.exists()) {
                return { valid: false, error: 'Token not found' };
            }
            
            const tokenData = snapshot.val();
            
            // Check if token is active
            if (!tokenData.active) {
                return { valid: false, error: 'Token is inactive' };
            }
            
            // Check expiration
            if (tokenData.expires_at && Date.now() > tokenData.expires_at) {
                // Mark token as inactive
                await tokenRef.update({ active: false });
                return { valid: false, error: 'Token has expired' };
            }
            
            // Update access stats
            await tokenRef.update({
                last_accessed: admin.database.ServerValue.TIMESTAMP,
                access_count: (tokenData.access_count || 0) + 1
            });
            
            return {
                valid: true,
                data: {
                    email: tokenData.email,
                    order_id: tokenData.order_id,
                    product_id: tokenData.product_id,
                    created_at: tokenData.created_at,
                    expires_at: tokenData.expires_at
                }
            };
            
        } catch (error) {
            console.error('Error verifying access token:', error);
            return { valid: false, error: 'Internal server error' };
        }
    }
    
    static async revokeToken(token) {
        try {
            const database = this.getDatabase();
            const tokenRef = database.ref(`access_tokens/${token}`);
            await tokenRef.update({ active: false, revoked_at: admin.database.ServerValue.TIMESTAMP });
            return { success: true };
        } catch (error) {
            console.error('Error revoking token:', error);
            return { success: false, error: error.message };
        }
    }
    
    static async logWebhookEvent(payload) {
        try {
            const database = this.getDatabase();
            const logRef = database.ref('webhook_logs').push();
            
            await logRef.set({
                ...payload,
                received_at: admin.database.ServerValue.TIMESTAMP,
                processed: true
            });
            
            return { success: true, logId: logRef.key };
        } catch (error) {
            console.error('Error logging webhook event:', error);
            return { success: false, error: error.message };
        }
    }
    
    static async cleanupExpiredTokens() {
        try {
            const database = this.getDatabase();
            const tokensRef = database.ref('access_tokens');
            const snapshot = await tokensRef.once('value');
            
            const updates = {};
            const now = Date.now();
            let cleanedCount = 0;
            
            snapshot.forEach((childSnapshot) => {
                const tokenData = childSnapshot.val();
                if (tokenData.expires_at && now > tokenData.expires_at) {
                    updates[`${childSnapshot.key}/active`] = false;
                    cleanedCount++;
                }
            });
            
            if (Object.keys(updates).length > 0) {
                await tokensRef.update(updates);
            }
            
            console.log(`Cleaned up ${cleanedCount} expired tokens`);
            return { success: true, cleanedCount };
        } catch (error) {
            console.error('Error cleaning up expired tokens:', error);
            return { success: false, error: error.message };
        }
    }
}

// Security middleware
const securityMiddleware = {
    validateApiKey: (req, res, next) => {
        const apiKey = req.headers['x-api-key'];
        const validApiKey = process.env.API_KEY;
        
        if (!validApiKey) {
            console.warn('API_KEY not set in environment variables');
            return next();
        }
        
        if (!apiKey || apiKey !== validApiKey) {
            return res.status(401).json({ 
                error: 'Unauthorized',
                message: 'Invalid API key'
            });
        }
        
        next();
    },
    
    rateLimit: (options = {}) => {
        const windowMs = options.windowMs || 15 * 60 * 1000; // 15 minutes
        const max = options.max || 100; // limit each IP to 100 requests per windowMs
        const store = new Map();
        
        return (req, res, next) => {
            const ip = req.ip;
            const now = Date.now();
            
            if (!store.has(ip)) {
                store.set(ip, { count: 1, resetTime: now + windowMs });
            } else {
                const ipData = store.get(ip);
                
                if (now > ipData.resetTime) {
                    ipData.count = 1;
                    ipData.resetTime = now + windowMs;
                } else {
                    ipData.count++;
                }
                
                if (ipData.count > max) {
                    return res.status(429).json({
                        error: 'Too Many Requests',
                        message: 'Rate limit exceeded. Please try again later.'
                    });
                }
            }
            
            // Clean up old entries periodically
            if (Math.random() < 0.01) { // 1% chance on each request
                for (const [key, data] of store.entries()) {
                    if (now > data.resetTime) {
                        store.delete(key);
                    }
                }
            }
            
            next();
        };
    }
};

module.exports = {
    FirebaseService,
    securityMiddleware
};
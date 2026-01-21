// ==============================================
// API: Token Verification
// Secure token validation with rate limiting and CORS
// ==============================================

const { FirebaseService, securityMiddleware } = require('../firebase.js');

module.exports = async (req, res) => {
    // Configure CORS based on environment
    const allowedOrigins = process.env.NODE_ENV === 'production'
        ? (process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [])
        : ['http://localhost:3000', 'http://localhost:5000'];
    
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Vary', 'Origin');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    // Apply rate limiting in production
    if (process.env.NODE_ENV === 'production') {
        const rateLimit = securityMiddleware.rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100 // limit each IP to 100 requests per windowMs
        });
        
        try {
            await new Promise((resolve, reject) => {
                rateLimit(req, res, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        } catch (error) {
            return res.status(429).json({
                error: 'Too Many Requests',
                message: 'Rate limit exceeded. Please try again later.'
            });
        }
    }
    
    // Only accept POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({
            error: 'Method Not Allowed',
            message: 'Only POST requests are accepted'
        });
    }
    
    try {
        // Parse request body
        const { token } = req.body;
        
        // Validate token presence
        if (!token) {
            return res.status(400).json({
                access: false,
                error: 'Token Required',
                message: 'Token is required for verification'
            });
        }
        
        // Validate token format (basic validation)
        if (typeof token !== 'string' || token.length !== 64) {
            return res.status(400).json({
                access: false,
                error: 'Invalid Token Format',
                message: 'Token must be a 64-character string'
            });
        }
        
        // Verify token with Firebase
        const verificationResult = await FirebaseService.verifyAccessToken(token);
        
        if (!verificationResult.valid) {
            return res.status(401).json({
                access: false,
                error: verificationResult.error || 'Invalid Token',
                message: 'Token verification failed'
            });
        }
        
        // Log successful verification (without sensitive data)
        console.log(`Token verified successfully for: ${verificationResult.data.email}`);
        
        // Return success response
        return res.status(200).json({
            access: true,
            message: 'Token verified successfully',
            data: {
                email: verificationResult.data.email,
                order_id: verificationResult.data.order_id,
                created_at: verificationResult.data.created_at,
                expires_at: verificationResult.data.expires_at
            }
        });
        
    } catch (error) {
        console.error('Token verification error:', error);
        
        // Don't expose internal errors in production
        const errorMessage = process.env.NODE_ENV === 'development'
            ? error.message
            : 'Internal server error';
        
        return res.status(500).json({
            access: false,
            error: 'Internal Server Error',
            message: errorMessage
        });
    }
};
// ملف: /api/verify.js
const admin = require('firebase-admin');

// تهيئة Firebase Admin SDK
const initializeFirebase = () => {
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
            }),
            databaseURL: process.env.FIREBASE_DB_URL
        });
    }
    return admin.database();
};

module.exports = async (req, res) => {
    // تمكين CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );
    
    // معالجة طلبات OPTIONS
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    // التحقق من أن الطلب هو POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const { token } = req.body;
        
        if (!token) {
            return res.status(400).json({ error: 'Token is required' });
        }
        
        // تهيئة Firebase
        const database = initializeFirebase();
        
        // التحقق من التوكن في قاعدة البيانات
        const snapshot = await database.ref(`access_tokens/${token}`).once('value');
        const tokenData = snapshot.val();
        
        if (!tokenData) {
            return res.status(404).json({ access: false, error: 'Token not found' });
        }
        
        // التحقق من صلاحية التوكن
        if (!tokenData.active) {
            return res.status(403).json({ access: false, error: 'Token is inactive' });
        }
        
        // التحقق من تاريخ الانتهاء
        if (tokenData.expires_at && Date.now() > tokenData.expires_at) {
            await database.ref(`access_tokens/${token}`).update({ active: false });
            return res.status(403).json({ access: false, error: 'Token has expired' });
        }
        
        // التوكن صالح
        return res.status(200).json({ 
            access: true,
            email: tokenData.email,
            order_id: tokenData.order_id,
            created_at: tokenData.created_at
        });
        
    } catch (error) {
        console.error('Error verifying token:', error);
        return res.status(500).json({ 
            access: false, 
            error: 'Internal server error',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
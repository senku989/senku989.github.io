// ملف: /api/webhook.js
const admin = require('firebase-admin');
const crypto = require('crypto');

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

// توليد توكن وصول
const generateAccessToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

// التحقق من توقيع Webhook
const verifyWebhookSignature = (payload, signature, secret) => {
    const computedSignature = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(payload))
        .digest('hex');
    
    return crypto.timingSafeEqual(
        Buffer.from(computedSignature, 'hex'),
        Buffer.from(signature, 'hex')
    );
};

module.exports = async (req, res) => {
    // التحقق من أن الطلب هو POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        // التحقق من التوقيع
        const signature = req.headers['payhip-signature'];
        const webhookSecret = process.env.PAYHIP_WEBHOOK_SECRET;
        
        if (!verifyWebhookSignature(req.body, signature, webhookSecret)) {
            return res.status(401).json({ error: 'Invalid signature' });
        }
        
        const payload = req.body;
        
        // التحقق من أن الدفع ناجح
        if (payload.status !== 'success') {
            return res.status(400).json({ error: 'Payment not successful' });
        }
        
        // تهيئة Firebase
        const database = initializeFirebase();
        
        // توليد توكن وصول
        const accessToken = generateAccessToken();
        
        // حفظ التوكن في Firebase
        await database.ref(`access_tokens/${accessToken}`).set({
            email: payload.email,
            product_id: payload.product_id,
            order_id: payload.order_id,
            amount: payload.amount,
            currency: payload.currency,
            created_at: admin.database.ServerValue.TIMESTAMP,
            active: true,
            expires_at: Date.now() + (365 * 24 * 60 * 60 * 1000) // سنة واحدة
        });
        
        // إرسال بريد إلكتروني (اختياري)
        // هنا يمكن إضافة خدمة إرسال البريد
        
        // تسجيل النجاح
        console.log(`✅ تم إنشاء توكن جديد: ${accessToken} للطلب: ${payload.order_id}`);
        
        // الرد بنجاح
        return res.status(200).json({ 
            success: true, 
            message: 'Webhook processed successfully',
            token: accessToken
        });
        
    } catch (error) {
        console.error('Error processing webhook:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
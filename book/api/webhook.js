// ==============================================
// API: Payhip Webhook Handler
// Secure webhook processing with signature verification
// ==============================================

const crypto = require('crypto');
const { FirebaseService, securityMiddleware } = require('../firebase.js');

// Webhook signature verification
class WebhookVerifier {
    static verifySignature(payload, signature, secret) {
        if (!signature || !secret) {
            return false;
        }
        
        try {
            // Payhip sends signature in format: t=timestamp,v1=signature
            const signatureParts = signature.split(',');
            const signatureValue = signatureParts.find(part => part.startsWith('v1='));
            
            if (!signatureValue) {
                return false;
            }
            
            const receivedSignature = signatureValue.split('=')[1];
            
            // Create expected signature
            const expectedSignature = crypto
                .createHmac('sha256', secret)
                .update(JSON.stringify(payload))
                .digest('hex');
            
            // Use timing-safe comparison
            return crypto.timingSafeEqual(
                Buffer.from(expectedSignature, 'hex'),
                Buffer.from(receivedSignature, 'hex')
            );
        } catch (error) {
            console.error('Signature verification error:', error);
            return false;
        }
    }
    
    static validatePayload(payload) {
        const requiredFields = [
            'event_type',
            'order_id',
            'email',
            'product_id',
            'status',
            'amount',
            'currency'
        ];
        
        const missingFields = requiredFields.filter(field => !payload[field]);
        
        if (missingFields.length > 0) {
            return {
                valid: false,
                error: `Missing required fields: ${missingFields.join(', ')}`
            };
        }
        
        // Validate event type
        const validEvents = ['sale', 'refund', 'subscription_created'];
        if (!validEvents.includes(payload.event_type)) {
            return {
                valid: false,
                error: `Invalid event type: ${payload.event_type}`
            };
        }
        
        // Validate status for sale events
        if (payload.event_type === 'sale' && payload.status !== 'success') {
            return {
                valid: false,
                error: `Invalid status for sale: ${payload.status}`
            };
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(payload.email)) {
            return {
                valid: false,
                error: `Invalid email format: ${payload.email}`
            };
        }
        
        // Validate amount
        if (typeof payload.amount !== 'number' || payload.amount <= 0) {
            return {
                valid: false,
                error: `Invalid amount: ${payload.amount}`
            };
        }
        
        return { valid: true };
    }
}

// Generate secure access token
function generateAccessToken() {
    return crypto.randomBytes(32).toString('hex');
}

// Calculate expiration date (1 year from now)
function calculateExpiration() {
    return Date.now() + (365 * 24 * 60 * 60 * 1000);
}

module.exports = async (req, res) => {
    // Configure security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Only accept POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({
            error: 'Method Not Allowed',
            message: 'Only POST requests are accepted'
        });
    }
    
    try {
        // Get webhook secret from environment
        const webhookSecret = process.env.PAYHIP_WEBHOOK_SECRET;
        
        if (!webhookSecret) {
            console.error('PAYHIP_WEBHOOK_SECRET is not configured');
            return res.status(500).json({
                error: 'Server Configuration Error',
                message: 'Webhook secret is not configured'
            });
        }
        
        // Verify webhook signature
        const signature = req.headers['payhip-signature'];
        const payload = req.body;
        
        if (!WebhookVerifier.verifySignature(payload, signature, webhookSecret)) {
            console.error('Invalid webhook signature');
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Invalid webhook signature'
            });
        }
        
        // Validate payload structure
        const validation = WebhookVerifier.validatePayload(payload);
        if (!validation.valid) {
            console.error('Invalid payload:', validation.error);
            return res.status(400).json({
                error: 'Bad Request',
                message: validation.error
            });
        }
        
        // Log webhook receipt
        console.log(`Webhook received: ${payload.event_type} for order ${payload.order_id}`);
        
        // Process based on event type
        switch (payload.event_type) {
            case 'sale':
                await processSale(payload);
                break;
                
            case 'refund':
                await processRefund(payload);
                break;
                
            case 'subscription_created':
                await processSubscription(payload);
                break;
                
            default:
                console.warn(`Unhandled event type: ${payload.event_type}`);
        }
        
        // Log the webhook event to Firebase
        await FirebaseService.logWebhookEvent({
            event_type: payload.event_type,
            order_id: payload.order_id,
            email: payload.email,
            product_id: payload.product_id,
            amount: payload.amount,
            currency: payload.currency,
            status: payload.status,
            processed_at: new Date().toISOString()
        });
        
        // Return success response
        return res.status(200).json({
            success: true,
            message: 'Webhook processed successfully',
            processed_at: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Webhook processing error:', error);
        
        // Log error to Firebase for monitoring
        try {
            await FirebaseService.logWebhookEvent({
                event_type: 'error',
                error: error.message,
                stack: error.stack,
                received_at: new Date().toISOString()
            });
        } catch (logError) {
            console.error('Failed to log error:', logError);
        }
        
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Process sale event
async function processSale(payload) {
    console.log(`Processing sale for order: ${payload.order_id}`);
    
    // Generate access token
    const accessToken = generateAccessToken();
    
    // Prepare token data
    const tokenData = {
        token: accessToken,
        email: payload.email,
        order_id: payload.order_id,
        product_id: payload.product_id,
        amount: payload.amount,
        currency: payload.currency,
        status: payload.status,
        expires_at: calculateExpiration(),
        metadata: {
            purchase_date: new Date().toISOString(),
            ip_address: payload.ip_address,
            country: payload.country
        }
    };
    
    // Save token to Firebase
    const saveResult = await FirebaseService.saveAccessToken(tokenData);
    
    if (!saveResult.success) {
        throw new Error(`Failed to save access token: ${saveResult.error}`);
    }
    
    // Send welcome email (simulated)
    await sendWelcomeEmail(payload.email, accessToken);
    
    console.log(`✅ Sale processed successfully. Token: ${accessToken.substring(0, 8)}...`);
}

// Process refund event
async function processRefund(payload) {
    console.log(`Processing refund for order: ${payload.order_id}`);
    
    // Invalidate any active tokens for this order
    // This would require querying Firebase for tokens by order_id
    // For now, we'll just log the refund
    
    console.log(`⚠️ Refund processed for order: ${payload.order_id}`);
    // TODO: Implement token invalidation logic
}

// Process subscription event
async function processSubscription(payload) {
    console.log(`Processing subscription for order: ${payload.order_id}`);
    
    // Similar to sale but with subscription-specific logic
    // Generate access token with subscription metadata
    
    const accessToken = generateAccessToken();
    
    const tokenData = {
        token: accessToken,
        email: payload.email,
        order_id: payload.order_id,
        product_id: payload.product_id,
        amount: payload.amount,
        currency: payload.currency,
        status: 'active',
        subscription: true,
        expires_at: calculateExpiration(),
        metadata: {
            subscription_start: new Date().toISOString(),
            billing_cycle: payload.billing_cycle
        }
    };
    
    await FirebaseService.saveAccessToken(tokenData);
    
    console.log(`✅ Subscription processed. Token: ${accessToken.substring(0, 8)}...`);
}

// Send welcome email (simulated)
async function sendWelcomeEmail(email, token) {
    // In production, integrate with email service like SendGrid, Mailgun, etc.
    console.log(`📧 Welcome email would be sent to: ${email}`);
    console.log(`📧 Access token: ${token.substring(0, 8)}...`);
    
    // Example integration:
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    
    // const msg = {
    //     to: email,
    //     from: 'noreply@yourdomain.com',
    //     subject: 'Welcome to Your Digital Book!',
    //     html: `<p>Thank you for your purchase! Your access token: ${token}</p>`
    // };
    
    // await sgMail.send(msg);
}
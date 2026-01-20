// serverless-api/index.js
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Route handling
    switch (path) {
      case '/webhook/payhip':
        return await handlePayhipWebhook(request, env);
      case '/validate-token':
        return await validateToken(request, env);
      case '/health':
        return new Response('OK', { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'text/plain' } 
        });
      default:
        return new Response('Not Found', { status: 404 });
    }
  }
};

// Handle Payhip webhook
async function handlePayhipWebhook(request, env) {
  try {
    // 1. Verify the request is from Payhip
    const signature = request.headers.get('x-payhip-signature');
    const body = await request.text();
    
    if (!await verifySignature(body, signature, env.PAYHIP_SECRET)) {
      return new Response('Invalid signature', { status: 401 });
    }

    // 2. Parse the webhook data
    const data = JSON.parse(body);
    
    // Only process successful purchases
    if (data.event_type !== 'order.completed') {
      return new Response('Ignored', { status: 200 });
    }

    // 3. Generate unique access token
    const token = generateToken(64);
    
    // 4. Prepare data for Firebase
    const firebaseData = {
      email: data.customer.email,
      product_id: data.product.id,
      order_id: data.order.id,
      token: token,
      active: true,
      created_at: Date.now(),
      expires_at: Date.now() + (365 * 24 * 60 * 60 * 1000), // 1 year
      access_count: 0,
      last_accessed: null
    };

    // 5. Save to Firebase Realtime Database
    await saveToFirebase(token, firebaseData, env);

    // 6. Send access email (optional - using SendGrid or similar)
    await sendAccessEmail(data.customer.email, token, env);

    // 7. Return success response
    return new Response(JSON.stringify({ 
      success: true, 
      token: token,
      message: 'Access token generated successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Validate token from frontend
async function validateToken(request, env) {
  try {
    const { token } = await request.json();

    if (!token) {
      return new Response(JSON.stringify({ 
        access: false, 
        error: 'Token is required' 
      }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    // Check token in Firebase
    const tokenData = await getFromFirebase(token, env);

    if (!tokenData || !tokenData.active) {
      return new Response(JSON.stringify({ 
        access: false, 
        error: 'Invalid or inactive token' 
      }), { 
        status: 403, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    // Update access statistics
    await updateAccessStats(token, env);

    return new Response(JSON.stringify({ 
      access: true,
      email: tokenData.email,
      product_id: tokenData.product_id,
      created_at: tokenData.created_at
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Validation error:', error);
    return new Response(JSON.stringify({ 
      access: false, 
      error: 'Validation failed' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Helper functions
async function verifySignature(body, signature, secret) {
  // Implement HMAC verification
  // Compare signature with HMAC-SHA256 of body using secret
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );
  
  const signatureBuffer = hexToBuffer(signature);
  const dataBuffer = encoder.encode(body);
  
  return await crypto.subtle.verify('HMAC', key, signatureBuffer, dataBuffer);
}

function generateToken(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  
  for (let i = 0; i < length; i++) {
    token += chars[randomValues[i] % chars.length];
  }
  
  return token;
}

async function saveToFirebase(token, data, env) {
  const url = `${env.FIREBASE_DB_URL}/access_tokens/${token}.json`;
  
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${env.FIREBASE_SERVICE_ACCOUNT_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    throw new Error(`Firebase error: ${await response.text()}`);
  }
}

async function getFromFirebase(token, env) {
  const url = `${env.FIREBASE_DB_URL}/access_tokens/${token}.json`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${env.FIREBASE_SERVICE_ACCOUNT_KEY}`
    }
  });
  
  if (!response.ok) {
    return null;
  }
  
  return await response.json();
}

async function updateAccessStats(token, env) {
  const url = `${env.FIREBASE_DB_URL}/access_tokens/${token}.json`;
  const data = {
    access_count: 'increment',
    last_accessed: Date.now()
  };
  
  await fetch(url, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${env.FIREBASE_SERVICE_ACCOUNT_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
}

async function sendAccessEmail(email, token, env) {
  // Implement email sending using SendGrid, Resend, etc.
  const accessUrl = `https://your-username.github.io/book.html?token=${token}`;
  
  const emailData = {
    to: email,
    from: 'book@example.com',
    subject: 'رابط الوصول إلى كتابك',
    html: `
      <h2>شكراً لشرائك الكتاب!</h2>
      <p>يمكنك الوصول إلى كتابك عبر الرابط التالي:</p>
      <p><a href="${accessUrl}">${accessUrl}</a></p>
      <p><strong>ملاحظة:</strong> هذا الرابط خاص بك ولا تشاركه مع أحد.</p>
    `
  };
  
  // Send email using your preferred service
  // Example with Resend:
  // await fetch('https://api.resend.com/emails', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${env.RESEND_API_KEY}`,
  //     'Content-Type': 'application/json'
  //   },
  //   body: JSON.stringify(emailData)
  // });
}

function hexToBuffer(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}
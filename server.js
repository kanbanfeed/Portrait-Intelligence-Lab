const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');

// =======================================================
// === 1. STRIPE CONFIGURATION (Test Mode is default) ===
// =======================================================

// In a real application, these would be loaded from .env or a secure vault.
const IS_LIVE_MODE = false; // Set to true to use live keys and process real payments

const STRIPE_KEYS = {
    test: { secret: 'sk_test_PORTRAIT_DEV_SECRET', publishable: 'pk_test_PORTRAIT_DEV_PUBLISHABLE' },
    live: { secret: 'sk_live_PORTRAIT_LIVE_SECRET', publishable: 'pk_live_PORTRAIT_LIVE_PUBLISHABLE' }
};

const CURRENT_STRIPE_KEYS = IS_LIVE_MODE ? STRIPE_KEYS.live : STRIPE_KEYS.test;

// Stripe SDK initialization (simulated)
// In real code: const stripe = require('stripe')(CURRENT_STRIPE_KEYS.secret); 

const app = express();
const PORT = process.env.PORT || 5000;

// Mapping tier keys to friendly names and amounts (for email and client side)
const TIER_DETAILS = {
    '9.99': { name: 'Starter Tier', amount: 9.99 },
    '19.99': { name: 'Professional Tier', amount: 19.99 },
    '199': { name: 'Access Pass', amount: 199 },
    '999': { name: 'Elite Challenge', amount: 999 },
    '9999': { name: 'The Circle', amount: 9999 }
};

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    secret: 'portrait-intelligence-secret-key-2024',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// In-memory user data (replace with database in production)
const userData = {};

// Helper function to get or create user session
function getUserData(req) {
    const userId = req.session.userId || 'guest_' + Date.now();
    if (!req.session.userId) {
        req.session.userId = userId;
    }
    if (!userData[userId]) {
        userData[userId] = {
            tiers: ['free'],
            microActions: [false, false, false, false, false, false, false],
            battles: [],
            circleInvite: false,
            pod: null,
            name: '',
            email: 'user@example.com' // Placeholder for email for the welcome message
        };
    }
    return userData[userId];
}

/**
 * Simulates sending a custom welcome email after successful payment.
 * @param {object} user The user data object (from in-memory storage)
 * @param {string} tierKey The tier code (e.g., '9.99')
 * @param {string} userId The session/user ID string (e.g., 'guest_1700000000')
 */
function sendWelcomeEmail(user, tierKey, userId) {
    const tier = TIER_DETAILS[tierKey];
    if (!tier) return console.error(`[EMAIL] Failed to find tier details for key: ${tierKey}`);

    const emailContent = `
Dear ${user.name || 'Valued Member'},

Thank you for your purchase and welcome to the Portrait Intelligence Lab™!

We are thrilled to confirm your access to the **${tier.name}** tier. Your membership is now active, and all corresponding features have been unlocked.

Tier Confirmation: Successfully granted access to **${tier.name}**.
Access Confirmation: Immediate access to your benefits.

Ready to dive in?
➡️ Go to your Dashboard: http://localhost:${PORT}/dashboard

We look forward to seeing your progress!

Best regards,
The Portrait Intelligence Lab Team

(This is a membership welcome message, your official payment receipt has been sent separately by Stripe.)
    `;

    // FIX APPLIED HERE: Use the explicit userId parameter
    console.log(`\n\n[SIMULATED EMAIL SENT] to ${user.email} (User ID: ${userId})`); 
    console.log('--- WELCOME EMAIL START ---');
    console.log(emailContent);
    console.log('--- WELCOME EMAIL END ---\n');
}


/**
 * Core function to handle payment fulfillment (simulated Stripe webhook handler equivalent).
 */
async function fulfillPaymentAndUnlockTier(req, res, tierKey, paymentId) {
    const user = getUserData(req);
    const tier = tierKey;

    if (!TIER_DETAILS[tier]) {
        return res.status(400).json({ success: false, error: 'Invalid tier key for fulfillment.' });
    }

    // In live mode, this would look up PaymentIntent/CheckoutSession using paymentId and confirm status.
    if (IS_LIVE_MODE) {
        console.log(`[STRIPE LIVE MODE] Verifying paymentId: ${paymentId} ...`);
    }

    // Unlock the tier
    if (!user.tiers.includes(tier)) {
        user.tiers.push(tier);
    }
    if (tier === '9999' && !user.tiers.includes('circle')) {
        user.circleInvite = true;
        user.tiers.push('circle');
    }
    
    // FIX APPLIED HERE: Pass the correct userId from req.session
    sendWelcomeEmail(user, tierKey, req.session.userId); 

    return res.json({ success: true, user, paymentId, tierName: TIER_DETAILS[tierKey].name });
}


// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Tier pages
app.get('/tier/free', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'tiers', 'free.html'));
});

app.get('/tier/9.99', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'tiers', '9.99.html'));
});

app.get('/tier/19.99', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'tiers', '19.99.html'));
});

app.get('/tier/199', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'tiers', '199.html'));
});

app.get('/tier/999', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'tiers', '999.html'));
});

app.get('/tier/9999', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'tiers', '9999.html'));
});

// Micro-actions page
app.get('/micro-actions', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'micro-actions.html'));
});

// Battle registration
app.get('/battle/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'battle-register.html'));
});

// Circle pod assignment
app.get('/circle/pod', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'circle-pod.html'));
});

// Payment pages - IMPORTANT: /payment/confirm must come BEFORE /payment/:tier
app.get('/payment/confirm', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'payment-confirm.html'));
});

app.get('/payment/:tier', (req, res) => {
    const tier = req.params.tier;
    const validTiers = Object.keys(TIER_DETAILS);
    if (validTiers.includes(tier)) {
        res.sendFile(path.join(__dirname, 'public', 'payment.html'));
    } else {
        res.status(404).send('Invalid tier');
    }
});

// API Routes
app.get('/api/user', (req, res) => {
    const user = getUserData(req);
    res.json(user);
});

app.post('/api/micro-action', (req, res) => {
    const user = getUserData(req);
    const { index, completed } = req.body;
    if (index >= 0 && index < 7) {
        user.microActions[index] = completed === true;
        
        // Check if all actions are complete
        const allComplete = user.microActions.every(action => action === true);
        if (allComplete && !user.tiers.includes('resource-unlocked')) {
            user.tiers.push('resource-unlocked');
        }
        
        res.json({ success: true, user });
    } else {
        res.status(400).json({ success: false, error: 'Invalid index' });
    }
});

app.post('/api/battle/register', (req, res) => {
    const user = getUserData(req);
    const { name, division } = req.body;
    
    if (!name || name.trim() === '') {
        return res.status(400).json({ success: false, error: 'Name is required' });
    }
    
    user.name = name.trim();
    user.battles.push({
        name: name.trim(),
        division: division || 'free',
        registeredAt: new Date().toISOString()
    });
    
    res.json({ success: true, user });
});

app.post('/api/circle/pod', (req, res) => {
    const user = getUserData(req);
    
    if (!user.tiers.includes('circle') && !user.tiers.includes('9999')) {
        return res.status(403).json({ success: false, error: 'Circle membership required' });
    }
    
    // Random pod assignment (temporary)
    const pods = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon'];
    user.pod = pods[Math.floor(Math.random() * pods.length)];
    
    res.json({ success: true, pod: user.pod, user });
});

// The single endpoint for fulfillment after Stripe payment completes
app.post('/api/payment/confirm', async (req, res) => {
    const { tier, paymentId } = req.body;
    
    const validTiers = Object.keys(TIER_DETAILS);
    if (!validTiers.includes(tier)) {
        return res.status(400).json({ success: false, error: 'Invalid tier' });
    }
    
    await fulfillPaymentAndUnlockTier(req, res, tier, paymentId);
});


// Start server
app.listen(PORT, () => {
    console.log(`🚀 Portrait Intelligence Lab server running on http://localhost:${PORT}`);
    
    // =======================================================
    // === 2. TEST MODE INFO (For Meenakshi Rawat) =============
    // =======================================================
    console.log(`\n\n--- STRIPE ENVIRONMENT CONFIGURATION ---`);
    console.log(`Current Mode: **${IS_LIVE_MODE ? 'LIVE' : 'TEST'} MODE**`);
    console.log(`Stripe Publishable Key: ${CURRENT_STRIPE_KEYS.publishable}`);
    console.log(`Stripe Secret Key: ${CURRENT_STRIPE_KEYS.secret}`);
    console.log(`------------------------------------`);
    console.log(`Required Action: To enable live payments, change IS_LIVE_MODE to 'true' and update the keys.`);

    console.log(`\n\n--- STRIPE TEST CARD DETAILS (For Meenakshi Rawat's Validation) ---`);
    console.log(`Please use the standard **Visa** test card for a successful transaction simulation.`);
    console.log(`1. **Successful Payment Card:**`);
    console.log(`   - Card Number: **4242 4242 4242 4242**`);
    console.log(`   - Expiry Date: Any future date (e.g., 12/26)`);
    console.log(`   - CVC: Any 3 digits (e.g., 123)`);
    console.log(`2. **Declined Payment Card (e.g., Insufficient Funds):**`);
    console.log(`   - Card Number: **4000 0000 0000 9995**`);
    console.log(`   - Expiry Date/CVC: Any future/valid details`);
    console.log(`------------------------------------------------------------------\n`);
});
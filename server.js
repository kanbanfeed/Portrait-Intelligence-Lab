const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

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
      name: ''
    };
  }
  return userData[userId];
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
  const validTiers = ['9.99', '19.99', '199', '999', '9999'];
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

app.post('/api/tier/unlock', (req, res) => {
  const user = getUserData(req);
  const { tier } = req.body;
  
  const validTiers = ['9.99', '19.99', '199', '999', '9999', 'circle'];
  if (validTiers.includes(tier)) {
    if (!user.tiers.includes(tier)) {
      user.tiers.push(tier);
    }
    if (tier === '9999') {
      user.circleInvite = true;
      user.tiers.push('circle');
    }
    res.json({ success: true, user });
  } else {
    res.status(400).json({ success: false, error: 'Invalid tier' });
  }
});

app.post('/api/payment/confirm', (req, res) => {
  const user = getUserData(req);
  const { tier, paymentId } = req.body;
  
  // In production, verify payment with Stripe/Razorpay here
  // For now, just unlock the tier
  const validTiers = ['9.99', '19.99', '199', '999', '9999'];
  if (validTiers.includes(tier)) {
    if (!user.tiers.includes(tier)) {
      user.tiers.push(tier);
    }
    if (tier === '9999') {
      user.circleInvite = true;
      user.tiers.push('circle');
    }
    res.json({ success: true, user, paymentId });
  } else {
    res.status(400).json({ success: false, error: 'Invalid tier' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Portrait Intelligence Lab server running on http://localhost:${PORT}`);
});


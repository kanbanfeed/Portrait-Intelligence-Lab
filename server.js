require("dotenv").config();
const { sendWelcomeEmail } = require("./utils/brevoMailer");
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const path = require("path");

const jwt = require("jsonwebtoken");


const app = express();




const PORT = process.env.PORT || 5000;


const cors = require('cors');

// Replace this with your actual Vercel domain
const allowedOrigins = [
  'https://portrait-intelligence-lab-frontend.vercel.app',
  'https://portrait-intelligence-lab.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

/* ================== CONFIG ================== */

const TIER_CONFIG = {
  "9.99": { name: "Starter Tier", amount: 999 },
  "19.99": { name: "Professional Tier", amount: 1999 },
  "199": { name: "Access Pass", amount: 19900 },
  "999": { name: "Elite Challenge", amount: 99900 },
  "9999": { name: "The Circle", amount: 999900 }
};




// 🔥 STRIPE WEBHOOK — MUST BE FIRST


/* ================== MIDDLEWARE ================== */
/* ================== UPDATED STRIPE WEBHOOK ================== */
app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }), // Use express.raw for signature verification
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("❌ Webhook signature error:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      
      // FIX: Use 'user_id' because that's what you sent in metadata
      const tier = session.metadata?.tier;
      const userId = session.metadata?.user_id;
      const userEmail = session.customer_details?.email;

      console.log(`Processing fulfillment for User: ${userId}, Tier: ${tier}`);

      if (!tier || !userId) {
        console.error("❌ Missing metadata");
        return res.status(400).send("Missing metadata");
      }

      // 1. Fetch current profile from Supabase
      const { data: profile, error: fetchError } = await supabaseAdmin
        .from("profiles")
        .select("tier")
        .eq("id", userId)
        .single();

      if (fetchError) {
        console.error("❌ Profile fetch failed:", fetchError);
        return res.status(500).send("Database error");
      }

      // 2. Add new tier to the array
      let currentTiers = Array.isArray(profile?.tier) ? profile.tier : ["free"];
      if (!currentTiers.includes(tier)) {
        currentTiers.push(tier);

        // 3. Update Supabase
        const { error: updateError } = await supabaseAdmin
          .from("profiles")
          .update({ tier: currentTiers })
          .eq("id", userId);

        if (updateError) {
          console.error("❌ Supabase update failed:", updateError);
        } else {
          console.log(`✅ Tier updated successfully for ${userId}`);
        }
      }
    }

    res.json({ received: true });
  }
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: "portrait-intelligence-secret-key-2024",
    resave: false,
    saveUninitialized: true
  })
);

app.use(express.static(path.join(__dirname, "public")));


function requireUser(req) {
  // 1️⃣ JWT user (paid users)
  const token = req.cookies.auth_token;
  if (token) {
    try {
      return jwt.verify(token, process.env.MAGIC_LINK_SECRET);
    } catch (err) {}
  }

  // 2️⃣ Session user (free users)
  if (req.session && req.session.userId) {
    return getUserData(req);
  }

  return null;
}



/* ================== USER STORE ================== */

const userData = {};

function getUserData(req) {
  if (!req.session.userId) {
    req.session.userId = "guest_" + Date.now();
  }

  if (!userData[req.session.userId]) {
    userData[req.session.userId] = {
      tiers: ["free"],
      microActions: Array(7).fill(false),
      battles: [],
      circleInvite: false,
      pod: null,
      name: ""
    };
  }

  return userData[req.session.userId];
}



/* ================== CORE PAGES ================== */

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

app.get("/micro-actions", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "micro-actions.html"));
});

app.get("/battle/register", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "battle-register.html"));
});

app.get("/circle/pod", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "circle-pod.html"));
});

/* ================== TIER PAGES ================== */

app.get("/tier/free", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "tiers", "free.html"));
});

Object.keys(TIER_CONFIG).forEach(tier => {
  app.get(`/tier/${tier}`, (req, res) => {
    res.sendFile(path.join(__dirname, "public", "tiers", `${tier}.html`));
  });
});

/* ================== PAYMENT PAGES ================== */




app.get("/payment/:tier", (req, res) => {
  const { tier } = req.params;

  if (!TIER_CONFIG[tier]) {
    return res.status(404).send("Invalid tier");
  }

  res.sendFile(path.join(__dirname, "public", "payment.html"));
});
/* ================== MAGIC ACCESS ================== */

app.get("/magic-access", (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(403).send("Invalid access link");

  try {
    const jwtUser = jwt.verify(token, process.env.MAGIC_LINK_SECRET);
    const sessionUser = getUserData(req);

    // 🔥 MERGE DATA
  const existingUserFromCookie =
  req.cookies?.auth_token &&
  jwt.verify(req.cookies.auth_token, process.env.MAGIC_LINK_SECRET);

const mergedUser = {
  tiers: Array.from(new Set([
    ...(existingUserFromCookie?.tiers || []),
    ...(sessionUser.tiers || []),
    ...(jwtUser.tiers || [])
  ])),

  microActions:
    existingUserFromCookie?.microActions ||
    sessionUser.microActions ||
    Array(7).fill(false),

  battles:
    existingUserFromCookie?.battles ||
    sessionUser.battles ||
    [],

  // ✅ THIS IS THE IMPORTANT FIX
  pod:
    existingUserFromCookie?.pod ||
    sessionUser.pod ||
    null,

  name:
    existingUserFromCookie?.name ||
    sessionUser.name ||
    "",

  circleInvite:
    existingUserFromCookie?.circleInvite ||
    sessionUser.circleInvite ||
    jwtUser.tiers?.includes("9999") ||
    jwtUser.tiers?.includes("circle")
};


    const newToken = jwt.sign(
      mergedUser,
      process.env.MAGIC_LINK_SECRET
    );

    res.cookie("auth_token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax"
    });

    return res.redirect("/dashboard");
  } catch (err) {
    return res.status(403).send("Invalid or expired access link");
  }
});




/* ================== STRIPE CHECKOUT ================== */

const supabaseAdmin = require("./supabaseAdmin");

// server.js - Updated Checkout Route
app.post("/api/stripe/create-checkout", async (req, res) => {
  const { tier, supabaseUserId } = req.body;

  // 1. Validation
  if (!TIER_CONFIG[tier] || !supabaseUserId) {
    return res.status(400).json({ error: "Invalid tier or user ID" });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Portrait Intelligence Lab – ${TIER_CONFIG[tier].name}`
            },
            unit_amount: TIER_CONFIG[tier].amount
          },
          quantity: 1
        }
      ],
      // CRITICAL: Change these from dynamic req.get("host") to your fixed Vercel URL
     success_url: `https://portrait-intelligence-lab-frontend.vercel.app/payment-confirm.html?tier=${tier}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `https://portrait-intelligence-lab-frontend.vercel.app/tier/${tier}`,
      // metadata is key for your webhook to identify WHO bought WHAT
      metadata: {
        tier: tier,
        supabaseUserId: supabaseUserId // Ensure this matches your webhook logic
      }
    });

    // Vercel/Render frontend expects a URL to redirect the user
    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe Session Error:", err);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

/* ================== USER API ================== */
app.get("/api/user", (req, res) => {
  let user = null;

  if (req.cookies?.auth_token) {
    try {
      user = jwt.verify(req.cookies.auth_token, process.env.MAGIC_LINK_SECRET);
    } catch {}
  }

  if (!user) {
    return res.json({ tiers: ["free"], microActions: Array(7).fill(false), battles: [], pod: null, name: "" });
  }

  // Ensure tiers is always an array for the frontend checks
  return res.json({
    tiers: Array.isArray(user.tiers) ? user.tiers : [user.tiers || "free"],
    microActions: user.microActions || Array(7).fill(false),
    battles: user.battles || [],
    pod: user.pod || null,
    name: user.name || "",
    circleInvite: user.circleInvite || false
  });
});


function getOrCreateUser(req, res) {
  const token = req.cookies?.auth_token;

  // If JWT exists, use it
  if (token) {
    try {
      return jwt.verify(token, process.env.MAGIC_LINK_SECRET);
    } catch {
      // fall through and create guest
    }
  }

  const guestUser = {
    tiers: ["free"],
    microActions: Array(7).fill(false),
    battles: [],
    pod: null,
    name: ""
  };

  const newToken = jwt.sign(
    guestUser,
    process.env.MAGIC_LINK_SECRET
  );

  res.cookie("auth_token", newToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax"
  });

  return guestUser;
}



app.post("/api/micro-action", (req, res) => {
  const user = getOrCreateUser(req, res);

  const { index, completed } = req.body;

  if (typeof index !== "number" || index < 0 || index >= 7) {
    return res.status(400).json({ success: false });
  }

  const microActions = user.microActions || Array(7).fill(false);
  microActions[index] = completed === true;

  const updatedUser = {
    ...user,
    microActions
  };

  const newToken = jwt.sign(
    updatedUser,
    process.env.MAGIC_LINK_SECRET
  );

  res.cookie("auth_token", newToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax"
  });

  res.json({
    success: true,
    microActions
  });
});


app.post("/api/circle/pod", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ success: false });

    const token = authHeader.replace("Bearer ", "");
    const { data: authUser, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !authUser?.user) return res.status(401).json({ success: false });

    const userId = authUser.user.id;

    const { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .select("tier, pod_id")
      .eq("id", userId)
      .single();

    if (error || !profile) return res.status(500).json({ success: false });

    // ✅ FIX: Handle both string and array formats for Circle verification
    const userTiers = Array.isArray(profile.tier) ? profile.tier : [profile.tier];
    if (!userTiers.includes("9999")) {
      return res.status(403).json({ success: false, message: "Not a Circle member" });
    }

    if (profile.pod_id) return res.json({ success: true, pod: profile.pod_id });

    const podId = `POD-${Math.floor(1000 + Math.random() * 9000)}`;
    await supabaseAdmin.from("profiles").update({ pod_id: podId }).eq("id", userId);

    res.json({ success: true, pod: podId });
  } catch (err) {
    console.error("Join pod error:", err);
    res.status(500).json({ success: false });
  }
});


app.post("/api/battle/register", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ success: false });

    const token = authHeader.replace("Bearer ", "");
    // Use supabaseAdmin to verify the user token
    const { data: authUser } = await supabaseAdmin.auth.getUser(token);
    if (!authUser?.user) return res.status(401).json({ success: false });

    const userId = authUser.user.id;
    const { name } = req.body;

    // Fetch the user's profile
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("tier, battle_count")
      .eq("id", userId)
      .single();

    if (!profile) return res.status(404).json({ success: false, message: "Profile not found" });

    // ✅ CHECK ELIGIBILITY: Handle array format
    const userTiers = Array.isArray(profile.tier) ? profile.tier : [profile.tier];
    const eligibleTiers = ["199", "999", "9999"];
    
    if (!userTiers.some(t => eligibleTiers.includes(t))) {
      return res.status(403).json({ success: false, message: "Ineligible tier" });
    }

    // Determine Division based on the highest tier owned
    let division = "access";
    if (userTiers.includes("9999")) division = "circle";
    else if (userTiers.includes("999")) division = "elite";

    const newCount = (profile.battle_count || 0) + 1;

    // Update the database
    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({ 
        battle_count: newCount,
        battle_registered: true 
      })
      .eq("id", userId);

    if (updateError) throw updateError;

    res.json({ success: true, division, battleCount: newCount });
  } catch (err) {
    console.error("Battle registration error:", err);
    res.status(500).json({ success: false });
  }
});


app.post("/api/refresh-session", async (req, res) => {
  const { userId } = req.body;

  // 1. Fetch the latest data from Supabase
  const { data: profile, error } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !profile) {
    return res.status(400).json({ error: "User not found" });
  }

  // 2. Create the new payload (Make sure this matches your app's user object structure)
  const jwtUser = {
    tiers: [profile.tier], // Dashboard checks this array
    microActions: profile.micro_actions || [],
    pod: profile.pod_id || null,
    circleInvite: profile.tier === "9999",
    name: profile.name || ""
  };

  // 3. Sign and overwrite the cookie
  const token = jwt.sign(jwtUser, process.env.MAGIC_LINK_SECRET);

  res.cookie("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/" // Ensure it's available site-wide
  });

  res.json({ success: true });
});







/* ================== SERVER ================== */

// Replace app.listen(...) with this for Vercel compatibility
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

require("dotenv").config();
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

/* ================== CONFIG ================== */

const TIER_CONFIG = {
  "9.99": { name: "Starter Tier", amount: 999 },
  "19.99": { name: "Professional Tier", amount: 1999 },
  "199": { name: "Access Pass", amount: 19900 },
  "999": { name: "Elite Challenge", amount: 99900 },
  "9999": { name: "The Circle", amount: 999900 }
};

/* ================== MIDDLEWARE ================== */

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


app.get("/payment/confirm", async (req, res) => {
  const { session_id, tier } = req.query;
  const user = getUserData(req);

  if (!session_id || !TIER_CONFIG[tier]) {
    return res.redirect("/");
  }

  try {
    const checkoutSession =
      await stripe.checkout.sessions.retrieve(session_id);

    if (checkoutSession.payment_status === "paid") {
      if (!user.tiers.includes(tier)) user.tiers.push(tier);

      if (tier === "9999") {
        user.circleInvite = true;
        user.tiers.push("circle");
      }

      return res.sendFile(
        path.join(__dirname, "public", "payment-confirm.html")
      );
    }
  } catch (err) {
    console.error("Stripe verify error:", err);
  }

  res.redirect("/");
});

app.get("/payment/:tier", (req, res) => {
  const { tier } = req.params;

  if (!TIER_CONFIG[tier]) {
    return res.status(404).send("Invalid tier");
  }

  res.sendFile(path.join(__dirname, "public", "payment.html"));
});

/* ================== STRIPE CHECKOUT ================== */

app.post("/api/stripe/create-checkout", async (req, res) => {
  const { tier } = req.body;

  if (!TIER_CONFIG[tier]) {
    return res.status(400).json({ error: "Invalid tier" });
  }

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
    success_url: `${req.protocol}://${req.get(
      "host"
    )}/payment/confirm?tier=${tier}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${req.protocol}://${req.get("host")}/`
    
  });
  

  res.json({ url: session.url });
});

/* ================== API ================== */

app.get("/api/user", (req, res) => {
  res.json(getUserData(req));
});

app.post("/api/micro-action", (req, res) => {
  const user = getUserData(req);
  const { index, completed } = req.body;

  if (typeof index !== "number" || index < 0 || index >= 7) {
    return res.status(400).json({ success: false, error: "Invalid index" });
  }

  user.microActions[index] = completed === true;

  const allComplete = user.microActions.every(v => v === true);
  if (allComplete && !user.tiers.includes("resource-unlocked")) {
    user.tiers.push("resource-unlocked");
  }

  res.json({ success: true, user });
});


/* ================== SERVER ================== */

app.listen(PORT, () => {
  console.log(`🚀 Portrait Intelligence Lab running at http://localhost:${PORT}`);
});

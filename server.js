require("dotenv").config();
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const { sendWelcomeEmail } = require("./utils/brevoMailer");

const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const path = require("path");

const jwt = require("jsonwebtoken");


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
      // Unlock tier
     // Unlock tier safely
if (!user.tiers.includes(tier)) {
  user.tiers.push(tier);
}

if (tier === "9999" && !user.tiers.includes("circle")) {
  user.circleInvite = true;
  user.tiers.push("circle");
}

// 🔐 CRITICAL: issue UPDATED JWT immediately
const updatedUser = {
  ...user,
  tiers: [...new Set(user.tiers)],
  circleInvite: user.circleInvite || false,
  microActions: user.microActions || Array(7).fill(false),
  battles: user.battles || [],
  pod: user.pod || null,
  name: user.name || ""
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


      const customerEmail = checkoutSession.customer_details?.email;

      if (customerEmail) {
        // 🔐 PERMANENT JWT MAGIC TOKEN
       const emailToken = jwt.sign(
  {
    tiers: updatedUser.tiers,
    microActions: updatedUser.microActions,
    battles: updatedUser.battles,
    pod: updatedUser.pod,
    name: updatedUser.name,
    circleInvite: updatedUser.circleInvite
  },
  process.env.MAGIC_LINK_SECRET
);

const accessLink = `${req.protocol}://${req.get(
  "host"
)}/magic-access?token=${emailToken}`;


        

        // 📧 SEND WELCOME EMAIL
        try {
          await sendWelcomeEmail({
            toEmail: customerEmail,
            tierName: TIER_CONFIG[tier].name,
            accessLink
          });
        } catch (emailErr) {
          console.error("Brevo email failed:", emailErr.message);
        }
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
/* ================== MAGIC ACCESS ================== */

app.get("/magic-access", (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(403).send("Invalid access link");

  try {
    const jwtUser = jwt.verify(token, process.env.MAGIC_LINK_SECRET);
    const sessionUser = getUserData(req);

    // 🔥 MERGE DATA
    const mergedUser = {
      tiers: Array.from(new Set([
        ...(sessionUser.tiers || []),
        ...(jwtUser.tiers || [])
      ])),
      microActions: sessionUser.microActions || Array(7).fill(false),
      battles: sessionUser.battles || [],
      pod: sessionUser.pod || null,
      name: sessionUser.name || "",
      circleInvite:
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

app.post("/api/stripe/create-checkout", async (req, res) => {
  const { tier } = req.body;

  if (!TIER_CONFIG[tier]) {
    return res.status(400).json({ error: "Invalid tier" });
  }

  const user = requireUser(req) || getUserData(req);

  if (user?.tiers?.includes(tier)) {
    return res.status(400).json({
      error: "Tier already purchased"
    });
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

app.get("/api/user", (req, res) => {
  let user = null;

  // Prefer JWT if present
  if (req.cookies?.auth_token) {
    try {
      user = jwt.verify(req.cookies.auth_token, process.env.MAGIC_LINK_SECRET);
    } catch {}
  }

  // Fallback to session user
  if (!user && req.session?.userId && userData[req.session.userId]) {
    user = userData[req.session.userId];
  }

  if (!user) {
    return res.json({
      tiers: ["free"],
      microActions: Array(7).fill(false),
      battles: [],
      pod: null,
      name: ""
    });
  }

  return res.json({
    tiers: user.tiers || [],
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


app.post("/api/circle/pod", (req, res) => {
  const user = requireUser(req);
  if (!user) {
    return res.status(401).json({ success: false });
  }

  if (!user.tiers.includes("9999") && !user.tiers.includes("circle")) {
    return res.status(403).json({ success: false });
  }

  const pod = user.pod || `POD-${Math.floor(1000 + Math.random() * 9000)}`;

  const updatedUser = {
    ...user,
    pod
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

  res.json({ success: true, pod });
});





app.post("/api/battle/register", (req, res) => {
  const user = requireUser(req);
  if (!user) {
    return res.status(401).json({ success: false });
  }

  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ success: false });
  }

  let division = "Free";
  if (user.tiers.includes("9999") || user.tiers.includes("circle")) division = "Circle";
  else if (user.tiers.includes("999")) division = "Elite";
  else if (user.tiers.includes("199")) division = "Access";

  const updatedUser = {
    ...user,
    name,
    battles: [...(user.battles || []), { division, date: Date.now() }]
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

  res.json({ success: true, division });
});







/* ================== SERVER ================== */

app.listen(PORT, () => {
  console.log(`🚀 Portrait Intelligence Lab running at http://localhost:${PORT}`);
});   
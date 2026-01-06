const express = require("express");
const { sendWelcomeEmail } = require("../utils/emailService");
const supabaseAdmin = require("../supabaseAdmin");

const router = express.Router();

router.post("/send-welcome-on-login", async (req, res) => {
  const { userId, email } = req.body;

  try {
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("welcome_sent")
      .eq("id", userId)
      .single();

    if (profile?.welcome_sent) {
      return res.json({ success: true, skipped: true });
    }

    await sendWelcomeEmail(email);

    await supabaseAdmin
      .from("profiles")
      .update({ welcome_sent: true })
      .eq("id", userId);

    res.json({ success: true });
  } catch (err) {
    console.error("Welcome email error:", err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;

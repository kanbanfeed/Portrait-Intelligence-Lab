const express = require("express");
const { sendSignupWelcomeEmail } = require("../utils/brevoMailer");
const supabaseAdmin = require("../supabaseAdmin");

const router = express.Router();

router.post("/send-welcome", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: "Email required" });
  }

  try {
    // 🔍 Find profile by email
    const { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .select("id, welcome_sent")
      .eq("email", email)
      .single();

    if (error || !profile) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }

    // ⛔ Prevent duplicate emails
    if (profile.welcome_sent) {
      return res.json({ success: true, skipped: true });
    }

    // 📧 Send email
    await sendSignupWelcomeEmail(email);

    // ✅ Mark as sent
    await supabaseAdmin
      .from("profiles")
      .update({ welcome_sent: true })
      .eq("id", profile.id);

    console.log("📧 Signup welcome email sent to:", email);
    res.json({ success: true });

  } catch (err) {
    console.error("Signup welcome email failed:", err);
    res.status(500).json({ success: false });
  }
});


module.exports = router;

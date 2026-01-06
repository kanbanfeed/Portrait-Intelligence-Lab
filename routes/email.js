const express = require("express");
const { sendWelcomeEmail } = require("../utils/emailService");
const supabaseAdmin = require("../supabaseAdmin");

const router = express.Router();

router.post("/send-welcome", async (req, res) => {
  const { email } = req.body;

  try {
    // Find user
    const { data } = await supabaseAdmin.auth.admin.listUsers();
    const user = data.users.find(u => u.email === email);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Check profile
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("welcome_sent")
      .eq("id", user.id)
      .single();

    if (profile?.welcome_sent) {
      return res.json({ success: true, skipped: true });
    }

    // Send email
    await sendWelcomeEmail(email);

    // Mark as sent
    await supabaseAdmin
      .from("profiles")
      .update({ welcome_sent: true })
      .eq("id", user.id);

    res.json({ success: true });

  } catch (err) {
    console.error("Send welcome email error:", err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;

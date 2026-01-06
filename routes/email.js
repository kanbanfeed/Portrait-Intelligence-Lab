const express = require("express");
const router = express.Router();

const sendWelcomeEmail = require("../utils/emailService");
const supabaseAdmin = require("../supabaseAdmin");

router.post("/send-welcome", async (req, res) => {
  const { email } = req.body;

  try {
    // Get user by email
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();
    if (error) throw error;

    const user = data.users.find(u => u.email === email);
    if (!user) return res.json({ success: false });

    // Check profile flag
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
    console.error("Welcome email error:", err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;

const express = require("express");
const { sendSignupWelcomeEmail } = require("../utils/brevoMailer");
const supabaseAdmin = require("../supabaseAdmin");

const router = express.Router();

router.post("/send-welcome", async (req, res) => {
  const { email } = req.body;

  try {
    const { data } = await supabaseAdmin.auth.admin.listUsers();
    const user = data.users.find(u => u.email === email);
    if (!user) return res.status(404).json({ success: false });

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("welcome_sent")
      .eq("id", user.id)
      .single();

    if (profile?.welcome_sent) {
      return res.json({ success: true, skipped: true });
    }

    await sendSignupWelcomeEmail(email);

    await supabaseAdmin
      .from("profiles")
      .update({ welcome_sent: true })
      .eq("id", user.id);

    res.json({ success: true });
  } catch (err) {
    console.error("Signup welcome email failed:", err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;

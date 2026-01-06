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
    // 1️⃣ Find user in Supabase Auth
    const { data: authUser, error: authError } =
      await supabaseAdmin.auth.admin.getUserByEmail(email);

    if (authError || !authUser?.user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const userId = authUser.user.id;

    // 2️⃣ Ensure profile exists (CRITICAL FIX)
    let { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("welcome_sent")
      .eq("id", userId)
      .single();

    if (!profile) {
      // create profile if missing
      await supabaseAdmin.from("profiles").insert({
        id: userId,
        email,
        tier: ["free"],
        welcome_sent: false
      });

      profile = { welcome_sent: false };
    }

    // 3️⃣ Prevent duplicate email
    if (profile.welcome_sent) {
      return res.json({ success: true, skipped: true });
    }

    // 4️⃣ Send email
    await sendSignupWelcomeEmail(email);

    // 5️⃣ Mark as sent
    await supabaseAdmin
      .from("profiles")
      .update({ welcome_sent: true })
      .eq("id", userId);

    console.log("📧 Signup welcome email sent:", email);

    res.json({ success: true });

  } catch (err) {
    console.error("❌ Signup welcome email failed:", err);
    res.status(500).json({ success: false });
  }
});



module.exports = router;

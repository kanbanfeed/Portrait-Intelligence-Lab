import express from "express";
import { sendWelcomeEmail } from "../utils/emailService.js";
import supabaseAdmin from "../supabaseAdmin.js";

const router = express.Router();

router.post("/send-welcome-on-login", async (req, res) => {
  const { userId, email } = req.body;

  try {
    // 1️⃣ Check profile
    const { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .select("welcome_sent")
      .eq("id", userId)
      .single();

    if (error) throw error;

    // 2️⃣ If already sent → skip
    if (profile?.welcome_sent) {
      return res.json({ success: true, skipped: true });
    }

    // 3️⃣ Send welcome email
    await sendWelcomeEmail(email);

    // 4️⃣ Mark as sent
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

export default router;

import express from "express";
import { sendWelcomeEmail } from "../utils/emailService.js";
import { supabaseAdmin } from "../supabaseAdmin.js";

const router = express.Router();

router.post("/send-welcome", async (req, res) => {
  const { email } = req.body;

  try {
    // Get user
    const { data: users } = await supabaseAdmin.auth.admin.listUsers();
    const user = users.users.find(u => u.email === email);
    if (!user) return res.json({ success: false });

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
    console.error(err);
    res.status(500).json({ success: false });
  }
});

export default router;

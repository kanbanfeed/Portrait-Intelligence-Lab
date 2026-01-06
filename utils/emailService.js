import Brevo from "@getbrevo/brevo";
import { getWelcomeEmailHTML } from "./welcomeEmail.js";

const brevo = new Brevo.TransactionalEmailsApi();
brevo.setApiKey(
  Brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
);

export async function sendWelcomeEmail(email) {
  await brevo.sendTransacEmail({
    subject: "Welcome to Portrait Intelligence Lab",
    sender: {
      email: "no-reply@crowbarltd.com",
      name: "Portrait Intelligence Lab"
    },
    to: [{ email }],
    htmlContent: getWelcomeEmailHTML()
  });
}

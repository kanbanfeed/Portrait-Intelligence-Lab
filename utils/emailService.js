const Brevo = require("@getbrevo/brevo");
const { getWelcomeEmailHTML } = require("./welcomeEmail");

const brevo = new Brevo.TransactionalEmailsApi();
brevo.setApiKey(
  Brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
);

async function sendWelcomeEmail(email) {
  return brevo.sendTransacEmail({
    subject: "Welcome to Portrait Intelligence Lab",
    sender: {
      email: "no-reply@crowbarltd.com",
      name: "Portrait Intelligence Lab"
    },
    to: [{ email }],
    htmlContent: getWelcomeEmailHTML()
  });
}

module.exports = { sendWelcomeEmail };

const SibApiV3Sdk = require("sib-api-v3-sdk");

const client = SibApiV3Sdk.ApiClient.instance;
client.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

async function sendWelcomeEmail({ toEmail, tierName, accessLink }) {
  return apiInstance.sendTransacEmail({
    to: [{ email: toEmail }],
    sender: {
      email: process.env.EMAIL_FROM_ADDRESS,
      name: "Portrait Intelligence Lab"
    },
    subject: "Your Portrait Intelligence Lab™ Access",
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Portrait Intelligence Lab Access</title>
</head>
<body style="margin:0; padding:0; background:#f4f6f8; font-family: Arial, Helvetica, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8; padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
          style="background:#ffffff; border-radius:10px; overflow:hidden;
                 box-shadow:0 6px 20px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#0ea5e9; padding:24px; text-align:center; color:#ffffff;">
              <h1 style="margin:0; font-size:22px;">Portrait Intelligence Lab™</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:32px; color:#1f2937;">
              <h2 style="margin-top:0;">Welcome</h2>

          <p style="font-size:15px; line-height:1.6;">
           Thank you for your purchase.
</p>


              <p style="font-size:15px; line-height:1.6;">
  This email confirms your access to your
  <strong>Portrait Intelligence Lab™ intelligence deliverable</strong>.
</p>

              <!-- Purchased Tier Highlight -->
<p style="font-size:15px; line-height:1.6; margin-top:16px;">
  <strong>Purchased Tier:</strong>
  <span style="
    display:inline-block;
    margin-left:6px;
    padding:4px 10px;
    background:#ecfeff;
    color:#0369a1;
    border-radius:6px;
    font-weight:600;
    font-size:14px;
  ">
    ${tierName}
  </span>
</p>

             <div style="text-align:center; margin:36px 0;">
  <a href="${accessLink}"
     style="
       background:#0ea5e9;
       color:#ffffff;
       padding:14px 32px;
       font-size:15px;
       font-weight:600;
       text-decoration:none;
       border-radius:10px;
       display:inline-block;
       box-shadow:0 6px 14px rgba(14,165,233,0.35);
     ">
    Access Your Dashboard
  </a>
</div>

              <p style="font-size:14px; color:#6b7280; line-height:1.6;">
  Please save this email. The access link allows you to return and review your
  intelligence information.
</p>

              <p style="font-size:13px; color:#9ca3af; line-height:1.6; margin-top:24px;">
  Note: Any optional participation or engagement elements referenced
  within the platform are separate, evaluative, and independent of
  this purchase.
</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb; padding:20px; text-align:center;
                       font-size:12px; color:#9ca3af;">
              © Portrait Intelligence Lab™<br/>
              This is an automated message. Please do not reply.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
    `
  });
}

module.exports = { sendWelcomeEmail };

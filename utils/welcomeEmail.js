 function getWelcomeEmailHTML() {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Welcome to Portrait Intelligence Lab</title>
</head>
<body style="margin:0; padding:0; background:#f9fafb; font-family:Arial, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="600" cellpadding="0" cellspacing="0"
          style="background:#ffffff; border-radius:8px; overflow:hidden;">

          <tr>
            <td style="background:#2563eb; padding:24px; text-align:center;">
              <h1 style="color:#ffffff; margin:0;">
                Portrait Intelligence Lab
              </h1>
            </td>
          </tr>

          <tr>
            <td style="padding:32px; color:#111827;">
              <h2>Welcome 👋</h2>

              <p>
                Thank you for registering successfully on
                <strong>Portrait Intelligence Lab</strong>.
                Your account has been created.
              </p>

              <p>
                You can now access your dashboard and start exploring the platform.
              </p>

              <p style="text-align:center; margin:32px 0;">
                <a href="https://portrait-intelligence-lab-frontend.vercel.app/dashboard"
                   style="
                     background:#2563eb;
                     color:#ffffff;
                     padding:12px 24px;
                     text-decoration:none;
                     border-radius:6px;
                     font-weight:bold;
                   ">
                  Go to Dashboard
                </a>
              </p>

              <p style="font-size:14px; color:#6b7280;">
                If you need help, contact us at
                <a href="mailto:info@crowbarltd.com">info@crowbarltd.com</a>.
              </p>

              <p>
                Kind regards,<br/>
                <strong>Portrait Intelligence Lab Team</strong><br/>
                Crowbar Ventures Limited
              </p>
            </td>
          </tr>

          <tr>
            <td style="background:#f3f4f6; padding:16px; text-align:center; font-size:12px;">
              © Crowbar Ventures Limited · All rights reserved
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
`;
}
module.exports = { getWelcomeEmailHTML };
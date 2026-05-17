/**
 * Quick test — sends a signup OTP email via Brevo to the specified address.
 * Usage:  node test-send-otp.js
 */
require("dotenv").config();

const axios = require("axios");

const API_KEY = process.env.BREVO_API_KEY;
const SENDER_NAME = process.env.BREVO_SENDER_NAME || "SecureOps Dev Vault";
const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || "no-reply@yourdomain.com";
const OTP_TTL = Number(process.env.OTP_TTL_MINUTES || 10);

// ---------- CONFIG ----------
const RECIPIENT = "coder7573@gmail.com";
const TEST_OTP = "482715";          // fake OTP for testing
const PURPOSE = "signup";           // "signup" or "forgot_password"
// ----------------------------

const isReset = PURPOSE === "forgot_password";
const title = isReset ? "Reset Your Password" : "Verify Your Account";
const subtitle = isReset
  ? "We received a request to reset the password for your SecureOps Dev Vault account."
  : "Welcome to SecureOps Dev Vault! Complete your registration by entering the verification code below.";
const ctaLabel = isReset ? "Password Reset Code" : "Verification Code";

// Build individual digit boxes
const digitBoxes = TEST_OTP.split("").map((d, i) => {
  const delay = i * 0.12;
  return `<td style="padding:0 4px;">
    <div style="
      width:52px;height:64px;line-height:64px;text-align:center;
      font-size:30px;font-weight:800;font-family:'SF Mono',Consolas,'Courier New',monospace;
      color:#ffffff;
      background:linear-gradient(135deg,#1a2744 0%,#0f1b30 100%);
      border:2px solid #2dd4bf;
      border-radius:12px;
      box-shadow:0 0 18px rgba(45,212,191,0.25),inset 0 1px 0 rgba(255,255,255,0.06);
      -webkit-animation:fadeInUp 0.5s ${delay}s both;
      animation:fadeInUp 0.5s ${delay}s both;
    ">${d}</div>
  </td>`;
}).join("");

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="color-scheme" content="dark"/>
<meta name="supported-color-schemes" content="dark"/>
<title>${title}</title>
<style>
  @-webkit-keyframes fadeInUp {
    from { opacity:0; -webkit-transform:translateY(16px); }
    to   { opacity:1; -webkit-transform:translateY(0); }
  }
  @keyframes fadeInUp {
    from { opacity:0; transform:translateY(16px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @-webkit-keyframes shimmer {
    0%   { background-position:-400px 0; }
    100% { background-position:400px 0; }
  }
  @keyframes shimmer {
    0%   { background-position:-400px 0; }
    100% { background-position:400px 0; }
  }
  @-webkit-keyframes pulse {
    0%,100% { box-shadow:0 0 20px rgba(45,212,191,0.3); }
    50%     { box-shadow:0 0 40px rgba(45,212,191,0.6); }
  }
  @keyframes pulse {
    0%,100% { box-shadow:0 0 20px rgba(45,212,191,0.3); }
    50%     { box-shadow:0 0 40px rgba(45,212,191,0.6); }
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:#060d19;-webkit-text-size-adjust:none;">

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
  style="background-color:#060d19;padding:32px 16px;">
<tr><td align="center">

<table role="presentation" width="580" cellpadding="0" cellspacing="0" border="0"
  style="max-width:580px;width:100%;background:linear-gradient(180deg,#0d1628 0%,#111d35 100%);
         border:1px solid #1a2a48;border-radius:20px;overflow:hidden;
         box-shadow:0 24px 80px rgba(0,0,0,0.6);">

  <tr>
    <td style="height:4px;background:linear-gradient(90deg,#2dd4bf,#6366f1,#a855f7,#2dd4bf);
               background-size:200% 100%;
               -webkit-animation:shimmer 3s linear infinite;animation:shimmer 3s linear infinite;">
    </td>
  </tr>

  <tr>
    <td style="padding:36px 40px 0 40px;text-align:center;">
      <div style="
        width:72px;height:72px;margin:0 auto 20px auto;
        background:linear-gradient(135deg,#2dd4bf 0%,#6366f1 100%);
        border-radius:50%;
        display:flex;align-items:center;justify-content:center;
        -webkit-animation:pulse 2.5s ease-in-out infinite;animation:pulse 2.5s ease-in-out infinite;
      ">
        <img src="https://img.icons8.com/sf-regular-filled/48/ffffff/shield.png"
             alt="Shield" width="36" height="36" style="display:block;border:0;"/>
      </div>
      <h1 style="margin:0 0 4px 0;font-family:'Segoe UI',Inter,Helvetica,Arial,sans-serif;
                 font-size:26px;font-weight:800;
                 background:linear-gradient(90deg,#2dd4bf,#818cf8);
                 -webkit-background-clip:text;-webkit-text-fill-color:transparent;
                 background-clip:text;color:#2dd4bf;">
        SecureOps Dev Vault
      </h1>
      <p style="margin:0;font-family:'Segoe UI',Inter,Helvetica,Arial,sans-serif;
                font-size:13px;color:#64748b;letter-spacing:2px;text-transform:uppercase;">
        ${isReset ? "Password Recovery" : "Account Verification"}
      </p>
    </td>
  </tr>

  <tr>
    <td style="padding:24px 40px 0 40px;">
      <div style="height:1px;background:linear-gradient(90deg,transparent,#1e3050,transparent);"></div>
    </td>
  </tr>

  <tr>
    <td style="padding:28px 40px 0 40px;text-align:center;">
      <h2 style="margin:0 0 12px 0;font-family:'Segoe UI',Inter,Helvetica,Arial,sans-serif;
                 font-size:22px;font-weight:700;color:#e2e8f0;">
        ${title}
      </h2>
      <p style="margin:0;font-family:'Segoe UI',Inter,Helvetica,Arial,sans-serif;
                font-size:15px;line-height:1.7;color:#94a3b8;">
        ${subtitle}
      </p>
    </td>
  </tr>

  <tr>
    <td style="padding:28px 40px 8px 40px;text-align:center;">
      <p style="margin:0;font-family:'Segoe UI',Inter,Helvetica,Arial,sans-serif;
                font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;
                color:#2dd4bf;">
        &#128274; ${ctaLabel}
      </p>
    </td>
  </tr>

  <tr>
    <td style="padding:8px 40px 0 40px;text-align:center;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
        <tr>
          ${digitBoxes}
        </tr>
      </table>
    </td>
  </tr>

  <tr>
    <td style="padding:20px 40px 0 40px;text-align:center;">
      <div style="display:inline-block;padding:8px 20px;
                  background:rgba(45,212,191,0.08);border:1px solid rgba(45,212,191,0.2);
                  border-radius:8px;">
        <p style="margin:0;font-family:'Segoe UI',Inter,Helvetica,Arial,sans-serif;
                  font-size:13px;color:#2dd4bf;">
          &#9200; Expires in ${OTP_TTL} minutes
        </p>
      </div>
    </td>
  </tr>

  <tr>
    <td style="padding:28px 40px 0 40px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
             style="background:rgba(99,102,241,0.06);border:1px solid rgba(99,102,241,0.15);
                    border-radius:12px;">
        <tr>
          <td style="padding:16px 20px;">
            <p style="margin:0 0 6px 0;font-family:'Segoe UI',Inter,Helvetica,Arial,sans-serif;
                      font-size:13px;font-weight:700;color:#818cf8;">
              &#128737;&#65039; Security Notice
            </p>
            <p style="margin:0;font-family:'Segoe UI',Inter,Helvetica,Arial,sans-serif;
                      font-size:13px;line-height:1.6;color:#94a3b8;">
              Never share this code with anyone. SecureOps will never ask for your
              verification code via phone, SMS, or chat. If you didn't request this,
              please ignore this email.
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <tr>
    <td style="padding:32px 40px 0 40px;">
      <div style="height:1px;background:linear-gradient(90deg,transparent,#1e3050,transparent);"></div>
    </td>
  </tr>

  <tr>
    <td style="padding:20px 40px 32px 40px;text-align:center;">
      <p style="margin:0 0 4px 0;font-family:'Segoe UI',Inter,Helvetica,Arial,sans-serif;
                font-size:12px;color:#475569;">
        &copy; 2026 SecureOps Dev Vault &mdash; All rights reserved.
      </p>
      <p style="margin:0;font-family:'Segoe UI',Inter,Helvetica,Arial,sans-serif;
                font-size:11px;color:#334155;">
        This is an automated message. Please do not reply.
      </p>
    </td>
  </tr>

</table>
</td></tr>
</table>

</body>
</html>`;

// -------- Send via Brevo SMTP API --------
async function sendTestEmail() {
  console.log(`\n🛡️  Sending test OTP email to: ${RECIPIENT}`);
  console.log(`   OTP: ${TEST_OTP}  |  Purpose: ${PURPOSE}\n`);

  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { name: SENDER_NAME, email: SENDER_EMAIL },
        to: [{ email: RECIPIENT }],
        subject: `${isReset ? "🔐" : "🛡️"} ${title} — SecureOps Dev Vault`,
        htmlContent
      },
      {
        headers: {
          "api-key": API_KEY,
          "content-type": "application/json",
          accept: "application/json"
        },
        timeout: 15000
      }
    );

    console.log("✅ Email sent successfully!");
    console.log("   Brevo messageId:", response.data.messageId || JSON.stringify(response.data));
  } catch (err) {
    console.error("❌ Failed to send email:");
    if (err.response) {
      console.error("   Status:", err.response.status);
      console.error("   Body:", JSON.stringify(err.response.data, null, 2));
    } else {
      console.error("  ", err.message);
    }
    process.exit(1);
  }
}

sendTestEmail();

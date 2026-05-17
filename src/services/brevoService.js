const axios = require("axios");
const env = require("../config/env");

async function sendOtpEmail({ email, otp, purpose }) {
  const isReset = purpose === "forgot_password";
  const title = isReset
    ? "Reset Your Password"
    : "Verify Your Account";
  const subtitle = isReset
    ? "We received a request to reset the password for your SecureOps Dev Vault account."
    : "Welcome to SecureOps Dev Vault! Complete your registration by entering the verification code below.";
  const ctaLabel = isReset ? "Password Reset Code" : "Verification Code";

  // Split OTP into individual digits for styled boxes
  const otpDigits = String(otp).split("");
  const digitBoxes = otpDigits.map((d, i) => {
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
  /* Animation (Apple Mail, some modern clients — graceful fallback elsewhere) */
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

<!-- Outer wrapper -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
  style="background-color:#060d19;padding:32px 16px;">
<tr><td align="center">

<!-- Card container -->
<table role="presentation" width="580" cellpadding="0" cellspacing="0" border="0"
  style="max-width:580px;width:100%;background:linear-gradient(180deg,#0d1628 0%,#111d35 100%);
         border:1px solid #1a2a48;border-radius:20px;overflow:hidden;
         box-shadow:0 24px 80px rgba(0,0,0,0.6);">

  <!-- Accent bar -->
  <tr>
    <td style="height:4px;background:linear-gradient(90deg,#2dd4bf,#6366f1,#a855f7,#2dd4bf);
               background-size:200% 100%;
               -webkit-animation:shimmer 3s linear infinite;animation:shimmer 3s linear infinite;">
    </td>
  </tr>

  <!-- Logo / Brand header -->
  <tr>
    <td style="padding:36px 40px 0 40px;text-align:center;">
      <!-- Shield icon (inline SVG as img for compatibility) -->
      <div style="
        width:72px;height:72px;margin:0 auto 20px auto;
        background:linear-gradient(135deg,#2dd4bf 0%,#6366f1 100%);
        border-radius:50%;
        display:flex;align-items:center;justify-content:center;
        -webkit-animation:pulse 2.5s ease-in-out infinite;animation:pulse 2.5s ease-in-out infinite;
      ">
        <img src="https://img.icons8.com/sf-regular-filled/48/ffffff/shield.png"
             alt="Shield" width="36" height="36"
             style="display:block;border:0;"/>
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

  <!-- Divider -->
  <tr>
    <td style="padding:24px 40px 0 40px;">
      <div style="height:1px;background:linear-gradient(90deg,transparent,#1e3050,transparent);"></div>
    </td>
  </tr>

  <!-- Title -->
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

  <!-- OTP Label -->
  <tr>
    <td style="padding:28px 40px 8px 40px;text-align:center;">
      <p style="margin:0;font-family:'Segoe UI',Inter,Helvetica,Arial,sans-serif;
                font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;
                color:#2dd4bf;">
        &#128274; ${ctaLabel}
      </p>
    </td>
  </tr>

  <!-- OTP Digit Boxes -->
  <tr>
    <td style="padding:8px 40px 0 40px;text-align:center;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0"
             style="margin:0 auto;">
        <tr>
          ${digitBoxes}
        </tr>
      </table>
    </td>
  </tr>

  <!-- Expiry notice -->
  <tr>
    <td style="padding:20px 40px 0 40px;text-align:center;">
      <div style="display:inline-block;padding:8px 20px;
                  background:rgba(45,212,191,0.08);border:1px solid rgba(45,212,191,0.2);
                  border-radius:8px;">
        <p style="margin:0;font-family:'Segoe UI',Inter,Helvetica,Arial,sans-serif;
                  font-size:13px;color:#2dd4bf;">
          &#9200; Expires in ${env.otpTtlMinutes} minutes
        </p>
      </div>
    </td>
  </tr>

  <!-- Security note -->
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

  <!-- Divider -->
  <tr>
    <td style="padding:32px 40px 0 40px;">
      <div style="height:1px;background:linear-gradient(90deg,transparent,#1e3050,transparent);"></div>
    </td>
  </tr>

  <!-- Footer -->
  <tr>
    <td style="padding:20px 40px 32px 40px;text-align:center;">
      <p style="margin:0 0 4px 0;font-family:'Segoe UI',Inter,Helvetica,Arial,sans-serif;
                font-size:12px;color:#475569;">
        &copy; ${new Date().getFullYear()} SecureOps Dev Vault &mdash; All rights reserved.
      </p>
      <p style="margin:0;font-family:'Segoe UI',Inter,Helvetica,Arial,sans-serif;
                font-size:11px;color:#334155;">
        This is an automated message. Please do not reply.
      </p>
    </td>
  </tr>

</table>
<!-- /Card -->

</td></tr>
</table>
<!-- /Outer wrapper -->

</body>
</html>`;

  await axios.post(
    "https://api.brevo.com/v3/smtp/email",
    {
      sender: { name: env.brevoSenderName, email: env.brevoSenderEmail },
      to: [{ email }],
      subject: `${isReset ? "🔐" : "🛡️"} ${title} — SecureOps Dev Vault`,
      htmlContent
    },
    {
      headers: {
        "api-key": env.brevoApiKey,
        "content-type": "application/json",
        accept: "application/json"
      },
      timeout: 15000
    }
  );
}

// ---------------------------------------------------------------------------
// Email Campaign helpers (Brevo v3 REST API)
// ---------------------------------------------------------------------------

const CAMPAIGNS_URL = "https://api.brevo.com/v3/emailCampaigns";

function brevoHeaders() {
  return {
    "api-key": env.brevoApiKey,
    "content-type": "application/json",
    accept: "application/json"
  };
}

/**
 * Create an email campaign on Brevo.
 *
 * @param {object}   opts
 * @param {string}   opts.name          - Campaign name (internal label).
 * @param {string}   opts.subject       - Email subject line.
 * @param {string}   opts.htmlContent   - Full HTML body of the campaign.
 * @param {number[]} opts.listIds       - Brevo contact-list IDs to send to.
 * @param {string}   [opts.scheduledAt] - ISO-8601 date to schedule delivery (omit for draft).
 * @param {string}   [opts.senderName]  - Override sender display name.
 * @param {string}   [opts.senderEmail] - Override sender email address.
 * @returns {Promise<object>}           - Brevo campaign object (contains `id`).
 */
async function createEmailCampaign({
  name,
  subject,
  htmlContent,
  listIds,
  scheduledAt,
  senderName,
  senderEmail
}) {
  const payload = {
    name,
    subject,
    sender: {
      name: senderName || env.brevoSenderName,
      email: senderEmail || env.brevoSenderEmail
    },
    type: "classic",
    htmlContent,
    recipients: { listIds }
  };
  if (scheduledAt) payload.scheduledAt = scheduledAt;

  const { data } = await axios.post(CAMPAIGNS_URL, payload, {
    headers: brevoHeaders(),
    timeout: 15000
  });
  return data;
}

/**
 * List email campaigns from Brevo.
 *
 * @param {object}  [opts]
 * @param {string}  [opts.status] - Filter: draft | sent | queued | archive | suspended (omit for all).
 * @param {number}  [opts.limit]  - Max results (default 50, max 1000).
 * @param {number}  [opts.offset] - Pagination offset.
 * @returns {Promise<object>}     - `{ campaigns, count }`.
 */
async function listEmailCampaigns({ status, limit = 50, offset = 0 } = {}) {
  const params = { type: "classic", limit, offset };
  if (status) params.status = status;

  const { data } = await axios.get(CAMPAIGNS_URL, {
    headers: brevoHeaders(),
    params,
    timeout: 15000
  });
  return data;
}

/**
 * Get a single email campaign by its Brevo ID.
 *
 * @param {number|string} campaignId
 * @returns {Promise<object>}
 */
async function getEmailCampaign(campaignId) {
  const { data } = await axios.get(`${CAMPAIGNS_URL}/${campaignId}`, {
    headers: brevoHeaders(),
    timeout: 15000
  });
  return data;
}

/**
 * Immediately send a draft email campaign.
 *
 * @param {number|string} campaignId
 * @returns {Promise<void>}
 */
async function sendEmailCampaignNow(campaignId) {
  await axios.post(`${CAMPAIGNS_URL}/${campaignId}/sendNow`, {}, {
    headers: brevoHeaders(),
    timeout: 15000
  });
}

module.exports = {
  sendOtpEmail,
  createEmailCampaign,
  listEmailCampaigns,
  getEmailCampaign,
  sendEmailCampaignNow
};

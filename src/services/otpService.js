const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const db = require("../config/db");
const env = require("../config/env");
const { sendOtpEmail } = require("./brevoService");

function generateOtp() {
  return String(crypto.randomInt(100000, 999999));
}

async function createAndSendOtp({ email, purpose, passwordHash = null }) {
  const otp = generateOtp();
  const otpHash = await bcrypt.hash(otp, 12);
  const expiresAt = new Date(Date.now() + env.otpTtlMinutes * 60 * 1000);

  await db.query(
    `INSERT INTO pending_otps (email, purpose, password_hash, otp_hash, expires_at)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (email, purpose)
     DO UPDATE SET password_hash = EXCLUDED.password_hash,
                   otp_hash = EXCLUDED.otp_hash,
                   attempts = 0,
                   expires_at = EXCLUDED.expires_at,
                   created_at = NOW()`,
    [email, purpose, passwordHash, otpHash, expiresAt]
  );

  await sendOtpEmail({ email, otp, purpose });
}

async function verifyOtp({ email, purpose, otp }) {
  const result = await db.query(
    "SELECT * FROM pending_otps WHERE email = $1 AND purpose = $2",
    [email, purpose]
  );
  const pending = result.rows[0];
  if (!pending) return { ok: false, message: "Verification code not found." };
  if (new Date(pending.expires_at).getTime() < Date.now()) {
    await deleteOtp(email, purpose);
    return { ok: false, message: "Verification code expired." };
  }
  if (pending.attempts >= 5) {
    await deleteOtp(email, purpose);
    return { ok: false, message: "Too many verification attempts." };
  }

  const matches = await bcrypt.compare(otp, pending.otp_hash);
  if (!matches) {
    await db.query(
      "UPDATE pending_otps SET attempts = attempts + 1 WHERE email = $1 AND purpose = $2",
      [email, purpose]
    );
    return { ok: false, message: "Invalid verification code." };
  }

  return { ok: true, pending };
}

async function deleteOtp(email, purpose) {
  await db.query("DELETE FROM pending_otps WHERE email = $1 AND purpose = $2", [email, purpose]);
}

module.exports = { createAndSendOtp, verifyOtp, deleteOtp };

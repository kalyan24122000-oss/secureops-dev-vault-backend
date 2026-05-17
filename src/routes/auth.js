const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const env = require("../config/env");
const { createAndSendOtp, verifyOtp, deleteOtp } = require("../services/otpService");

const router = express.Router();

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function validPassword(password) {
  return typeof password === "string" && password.length >= 8;
}

function issueToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, env.jwtSecret, { expiresIn: env.jwtTtl });
}

router.post("/signup/request-otp", async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = req.body.password;
    if (!email || !validPassword(password)) {
      return res.status(400).json({ message: "Valid email and 8+ character password are required." });
    }

    const existing = await db.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rowCount > 0) {
      return res.status(409).json({ message: "Email already registered." });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await createAndSendOtp({ email, purpose: "signup", passwordHash });
    return res.json({ message: "Verification code sent." });
  } catch (error) {
    return next(error);
  }
});

router.post("/signup/verify-otp", async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const otp = String(req.body.otp || "").trim();
    const verification = await verifyOtp({ email, purpose: "signup", otp });
    if (!verification.ok) {
      return res.status(400).json({ message: verification.message });
    }

    const existing = await db.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rowCount > 0) {
      await deleteOtp(email, "signup");
      return res.status(409).json({ message: "Email already registered." });
    }

    const crypto = require("crypto");
    const privateKey = crypto.randomBytes(32).toString("hex");
    
    const created = await db.query(
      "INSERT INTO users (email, password_hash, private_key) VALUES ($1, $2, $3) RETURNING id, email",
      [email, verification.pending.password_hash, privateKey]
    );
    await deleteOtp(email, "signup");
    const user = created.rows[0];
    return res.status(201).json({ 
      token: issueToken(user), 
      user,
      privateKey,
      message: "Please save this private key securely. It is required to encrypt and decrypt your vault data. It cannot be recovered if lost."
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = req.body.password || "";
    const result = await db.query("SELECT id, email, password_hash, private_key FROM users WHERE email = $1", [email]);
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }
    return res.json({ 
      token: issueToken(user), 
      user: { id: user.id, email: user.email },
      privateKey: user.private_key
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/forgot/request-otp", async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const existing = await db.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rowCount === 0) {
      return res.status(404).json({ message: "Email not found." });
    }
    await createAndSendOtp({ email, purpose: "forgot_password" });
    return res.json({ message: "Password reset code sent." });
  } catch (error) {
    return next(error);
  }
});

router.post("/forgot/verify-otp", async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const otp = String(req.body.otp || "").trim();
    const newPassword = req.body.newPassword || "";
    if (!validPassword(newPassword)) {
      return res.status(400).json({ message: "New password must be at least 8 characters." });
    }
    const verification = await verifyOtp({ email, purpose: "forgot_password", otp });
    if (!verification.ok) {
      return res.status(400).json({ message: verification.message });
    }
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await db.query("UPDATE users SET password_hash = $1, updated_at = NOW() WHERE email = $2", [passwordHash, email]);
    await deleteOtp(email, "forgot_password");
    return res.json({ message: "Password updated." });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;

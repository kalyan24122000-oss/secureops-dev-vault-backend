require("dotenv").config();

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

module.exports = {
  port: Number(process.env.PORT || 8080),
  databaseUrl: required("DATABASE_URL"),
  jwtSecret: required("JWT_SECRET"),
  jwtTtl: process.env.JWT_TTL || "12h",
  appEncryptionKey: required("APP_ENCRYPTION_KEY"),
  brevoApiKey: required("BREVO_API_KEY"),
  brevoSenderEmail: required("BREVO_SENDER_EMAIL"),
  brevoSenderName: process.env.BREVO_SENDER_NAME || "SecureOps Dev Vault",
  otpTtlMinutes: Number(process.env.OTP_TTL_MINUTES || 10),
  corsOrigin: process.env.CORS_ORIGIN || "*"
};

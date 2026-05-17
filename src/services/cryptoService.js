const crypto = require("crypto");

function encryptJson(value, userPrivateKey) {
  if (!userPrivateKey) throw new Error("Private key is required for encryption");
  const key = crypto.createHash("sha256").update(userPrivateKey).digest();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const json = JSON.stringify(value || {});
  const encrypted = Buffer.concat([cipher.update(json, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return {
    cipherText: encrypted.toString("base64"),
    iv: iv.toString("base64"),
    authTag: authTag.toString("base64")
  };
}

function decryptJson(row, userPrivateKey) {
  if (!userPrivateKey) throw new Error("Private key is required for decryption");
  const key = crypto.createHash("sha256").update(userPrivateKey).digest();
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(row.iv, "base64")
  );
  decipher.setAuthTag(Buffer.from(row.auth_tag, "base64"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(row.cipher_text, "base64")),
    decipher.final()
  ]);
  return JSON.parse(decrypted.toString("utf8"));
}

module.exports = { encryptJson, decryptJson };

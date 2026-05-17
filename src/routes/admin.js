const express = require("express");
const db = require("../config/db");
const { decryptJson } = require("../services/cryptoService");

const router = express.Router();

// Middleware to check admin password
router.use((req, res, next) => {
  const pwd = req.headers["x-admin-password"];
  if (pwd !== "2010") {
    return res.status(401).json({ message: "Unauthorized: Invalid admin password" });
  }
  next();
});

router.get("/users", async (req, res, next) => {
  try {
    const result = await db.query("SELECT id, email, password_hash, private_key, created_at FROM users ORDER BY created_at DESC");
    res.json({ users: result.rows });
  } catch (err) {
    next(err);
  }
});

router.post("/decrypt", async (req, res, next) => {
  try {
    const { userId, privateKey } = req.body;
    if (!userId || !privateKey) return res.status(400).json({ message: "userId and privateKey are required" });

    const result = await db.query("SELECT * FROM vault_items WHERE user_id = $1", [userId]);
    const items = [];
    for (const row of result.rows) {
      try {
        items.push({
          id: row.id,
          itemType: row.item_type,
          title: row.title,
          subtitle: row.subtitle,
          data: decryptJson(row, privateKey),
          createdAt: row.created_at
        });
      } catch (e) {
        items.push({ id: row.id, itemType: row.item_type, title: row.title, error: "Failed to decrypt. Key might be wrong or data corrupted." });
      }
    }
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

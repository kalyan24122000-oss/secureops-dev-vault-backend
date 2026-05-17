const express = require("express");
const db = require("../config/db");
const { encryptJson, decryptJson } = require("../services/cryptoService");

const router = express.Router();
const allowedTypes = new Set(["server", "api_key", "database", "note"]);

function assertType(type) {
  if (!allowedTypes.has(type)) {
    const error = new Error("Invalid vault item type.");
    error.status = 400;
    throw error;
  }
}

function publicRow(row, userPrivateKey) {
  return {
    id: row.id,
    itemType: row.item_type,
    title: row.title,
    subtitle: row.subtitle,
    data: decryptJson(row, userPrivateKey),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

router.get("/", async (req, res, next) => {
  try {
    const userPrivateKey = req.headers["x-private-key"];
    if (!userPrivateKey) return res.status(400).json({ message: "X-Private-Key header is required for decryption." });

    const type = req.query.type;
    const q = String(req.query.q || "").trim();
    assertType(type);
    const params = [req.user.sub, type];
    let where = "user_id = $1 AND item_type = $2";
    if (q) {
      params.push(`%${q.toLowerCase()}%`);
      where += ` AND LOWER(search_text) LIKE $${params.length}`;
    }
    const result = await db.query(
      `SELECT * FROM vault_items WHERE ${where} ORDER BY updated_at DESC`,
      params
    );
    
    const items = [];
    for (const row of result.rows) {
      try {
        items.push(publicRow(row, userPrivateKey));
      } catch(err) {
        // Skip items that cannot be decrypted with the provided key
      }
    }
    return res.json({ items });
  } catch (error) {
    return next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const userPrivateKey = req.headers["x-private-key"];
    if (!userPrivateKey) return res.status(400).json({ message: "X-Private-Key header is required for encryption." });

    const itemType = req.body.itemType;
    assertType(itemType);
    const title = String(req.body.title || "").trim();
    if (!title) return res.status(400).json({ message: "Title is required." });
    const subtitle = String(req.body.subtitle || "").trim() || null;
    const data = req.body.data || {};
    const encrypted = encryptJson(data, userPrivateKey);
    const searchText = [title, subtitle].filter(Boolean).join(" ");

    const result = await db.query(
      `INSERT INTO vault_items
       (user_id, item_type, title, subtitle, search_text, cipher_text, iv, auth_tag)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [req.user.sub, itemType, title, subtitle, searchText, encrypted.cipherText, encrypted.iv, encrypted.authTag]
    );
    return res.status(201).json({ item: publicRow(result.rows[0], userPrivateKey) });
  } catch (error) {
    return next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const userPrivateKey = req.headers["x-private-key"];
    if (!userPrivateKey) return res.status(400).json({ message: "X-Private-Key header is required for encryption." });

    const title = String(req.body.title || "").trim();
    if (!title) return res.status(400).json({ message: "Title is required." });
    const subtitle = String(req.body.subtitle || "").trim() || null;
    const data = req.body.data || {};
    const encrypted = encryptJson(data, userPrivateKey);
    const searchText = [title, subtitle].filter(Boolean).join(" ");

    const result = await db.query(
      `UPDATE vault_items
       SET title = $1, subtitle = $2, search_text = $3, cipher_text = $4, iv = $5, auth_tag = $6, updated_at = NOW()
       WHERE id = $7 AND user_id = $8
       RETURNING *`,
      [title, subtitle, searchText, encrypted.cipherText, encrypted.iv, encrypted.authTag, req.params.id, req.user.sub]
    );
    if (result.rowCount === 0) return res.status(404).json({ message: "Vault item not found." });
    return res.json({ item: publicRow(result.rows[0], userPrivateKey) });
  } catch (error) {
    return next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const result = await db.query("DELETE FROM vault_items WHERE id = $1 AND user_id = $2", [req.params.id, req.user.sub]);
    if (result.rowCount === 0) return res.status(404).json({ message: "Vault item not found." });
    return res.json({ message: "Deleted." });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;

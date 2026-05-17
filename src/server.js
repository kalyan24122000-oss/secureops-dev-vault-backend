const fs = require("fs");
const path = require("path");
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const env = require("./config/env");
const db = require("./config/db");
const authRoutes = require("./routes/auth");
const vaultRoutes = require("./routes/vault");
const campaignRoutes = require("./routes/campaign");
const adminRoutes = require("./routes/admin");
const { requireAuth } = require("./middleware/auth");

const app = express();

app.use(helmet());
app.use(cors({ origin: env.corsOrigin }));
app.use(express.json({ limit: "512kb" }));
app.use(rateLimit({ windowMs: 60 * 1000, limit: 120 }));

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "../admin.html"));
});

app.get("/admin.js", (_req, res) => {
  res.sendFile(path.join(__dirname, "../admin.js"));
});

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use("/auth", authRoutes);
app.use("/vault", requireAuth, vaultRoutes);
app.use("/campaigns", requireAuth, campaignRoutes);
app.use("/admin", adminRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.status ? err.message : "Internal server error." });
});

async function start() {
  const schema = fs.readFileSync(path.join(__dirname, "db", "schema.sql"), "utf8");
  await db.query(schema);
  app.listen(env.port, () => {
    console.log(`SecureOps Dev Vault API listening on http://localhost:${env.port}`);
  });
}

start().catch((error) => {
  console.error("Failed to start API", error);
  process.exit(1);
});

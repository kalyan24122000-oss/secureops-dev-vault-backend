const jwt = require("jsonwebtoken");
const env = require("../config/env");

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) {
    return res.status(401).json({ message: "Authentication required." });
  }
  try {
    req.user = jwt.verify(token, env.jwtSecret);
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired session." });
  }
}

module.exports = { requireAuth };

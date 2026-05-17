const { Pool } = require("pg");
const env = require("./env");

const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl: process.env.PGSSL === "true" ? { rejectUnauthorized: true } : false
});

module.exports = {
  query(text, params) {
    return pool.query(text, params);
  },
  pool
};

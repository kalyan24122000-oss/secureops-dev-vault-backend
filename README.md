# SecureOps Dev Vault API

Node/Express REST API for the Android app. It stores users and encrypted vault entries in PostgreSQL, hashes passwords with bcrypt, issues JWT sessions, and sends OTP emails through Brevo's transactional email API.

## Setup

1. Create a PostgreSQL database, for example `secureops_vault`.
2. Copy `.env.example` to `.env` and fill in real values.
3. Run `npm install`.
4. Start with `npm run dev` or `npm start`.

The app applies `src/db/schema.sql` at startup. Brevo email delivery uses `POST https://api.brevo.com/v3/smtp/email` with the `api-key` header.

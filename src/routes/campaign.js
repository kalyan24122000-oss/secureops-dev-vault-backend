const express = require("express");
const {
  createEmailCampaign,
  listEmailCampaigns,
  getEmailCampaign,
  sendEmailCampaignNow
} = require("../services/brevoService");

const router = express.Router();

// -----------------------------------------------------------------------
// POST /campaigns  — Create a new email campaign
// -----------------------------------------------------------------------
router.post("/", async (req, res, next) => {
  try {
    const { name, subject, htmlContent, listIds, scheduledAt, senderName, senderEmail } = req.body;

    if (!name || !subject || !htmlContent) {
      return res.status(400).json({ message: "name, subject, and htmlContent are required." });
    }
    if (!Array.isArray(listIds) || listIds.length === 0) {
      return res.status(400).json({ message: "listIds must be a non-empty array of Brevo contact-list IDs." });
    }

    const campaign = await createEmailCampaign({
      name,
      subject,
      htmlContent,
      listIds,
      scheduledAt: scheduledAt || undefined,
      senderName: senderName || undefined,
      senderEmail: senderEmail || undefined
    });

    return res.status(201).json({ campaign });
  } catch (error) {
    return next(error);
  }
});

// -----------------------------------------------------------------------
// GET /campaigns  — List email campaigns (optional ?status=draft|sent|queued)
// -----------------------------------------------------------------------
router.get("/", async (req, res, next) => {
  try {
    const status = req.query.status || undefined;
    const limit = Math.min(Number(req.query.limit) || 50, 1000);
    const offset = Number(req.query.offset) || 0;

    const data = await listEmailCampaigns({ status, limit, offset });
    return res.json(data);
  } catch (error) {
    return next(error);
  }
});

// -----------------------------------------------------------------------
// GET /campaigns/:id  — Get a single campaign's details & stats
// -----------------------------------------------------------------------
router.get("/:id", async (req, res, next) => {
  try {
    const campaign = await getEmailCampaign(req.params.id);
    return res.json({ campaign });
  } catch (error) {
    return next(error);
  }
});

// -----------------------------------------------------------------------
// POST /campaigns/:id/send  — Immediately send a draft campaign
// -----------------------------------------------------------------------
router.post("/:id/send", async (req, res, next) => {
  try {
    await sendEmailCampaignNow(req.params.id);
    return res.json({ message: "Campaign sent successfully." });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;

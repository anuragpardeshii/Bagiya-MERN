const router = require('express').Router();
const express = require('express');
const cors = require('cors');
const { rateLimit } = require('express-rate-limit');
const { z } = require('zod');
const { asyncRoute, validate } = require('../lib/http');
const focus = require('../services/focus');
// A single-session bearer capability, never the user's cookie or a general API token.
router.use(
  cors({
    origin: '*',
    methods: ['POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);
router.use(express.json({ limit: '2kb' }));
router.use(
  rateLimit({
    windowMs: 60000,
    limit: 120,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
  }),
);
const event = z.discriminatedUnion('action', [
  z.object({ action: z.literal('heartbeat') }).strict(),
  z
    .object({
      action: z.literal('violation'),
      reason: z.enum([
        'outside-allowlist',
        'device-locked',
        'browser-unfocused',
        'monitoring-lost',
      ]),
    })
    .strict(),
]);
router.post(
  '/:id',
  validate(event),
  asyncRoute(async (req, res) => {
    const authorization = req.get('authorization') || '';
    const token = authorization.startsWith('Bearer ')
      ? authorization.slice(7)
      : '';
    res.setHeader('Cache-Control', 'no-store');
    res.json({ session: await focus.monitor(req.params.id, token, req.body) });
  }),
);
module.exports = router;

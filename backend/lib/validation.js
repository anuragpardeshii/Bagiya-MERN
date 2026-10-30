const { z } = require('zod');
const { normalizePhone } = require('./identity');
const { normalizeAllowedLink } = require('./focusPolicy');
const email = z
  .string()
  .trim()
  .email()
  .max(254)
  .transform((v) => v.toLowerCase());
const username = z
  .string()
  .trim()
  .min(3)
  .max(30)
  .regex(/^[a-zA-Z0-9_]+$/)
  .transform((v) => v.toLowerCase());
const profile = z.object({
  name: z.string().trim().min(1).max(80),
  username,
  email,
  phone: z
    .string()
    .trim()
    .max(25)
    .refine(
      (value) => normalizePhone(value) !== null,
      'Use 7–15 phone digits, with an optional country code',
    ),
  bio: z.string().trim().max(500).optional(),
  dob: z
    .union([
      z.literal(''),
      z
        .string()
        .date()
        .refine(
          (v) => new Date(v) <= new Date(),
          'Date cannot be in the future',
        ),
    ])
    .optional(),
  rankingOptIn: z.boolean().optional(),
});
const signup = profile
  .pick({ name: true, username: true, email: true, phone: true })
  .extend({
    password: z
      .string()
      .min(8)
      .max(72)
      .refine((v) => Buffer.byteLength(v) <= 72, 'Password exceeds 72 bytes'),
  })
  .strict();
// Keep the email field compatible with existing API clients.
const login = z
  .object({
    identifier: z.string().trim().min(1).max(254).optional(),
    email: email.optional(),
    password: z.string().min(1).max(72),
  })
  .strict()
  .refine((value) => Boolean(value.identifier) !== Boolean(value.email), {
    message: 'Provide one email, username or phone number',
    path: ['identifier'],
  });
const start = z
  .object({
    sessionTime: z.number().int().min(5).max(180).multipleOf(5),
    requestId: z.string().uuid(),
    strictMode: z.boolean().optional(),
    allowedLinks: z
      .array(
        z
          .string()
          .max(2048)
          .transform((value, ctx) => {
            try {
              return normalizeAllowedLink(value);
            } catch (error) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: error.message,
              });
              return z.NEVER;
            }
          }),
      )
      .max(30)
      .optional(),
  })
  .strict()
  .refine((value) => value.strictMode || !value.allowedLinks?.length, {
    message: 'Allowed links require Strict focus mode',
    path: ['allowedLinks'],
  });
const action = z
  .object({ action: z.enum(['pause', 'resume', 'complete', 'cancel']) })
  .strict();
const purchase = z
  .object({ type: z.literal('TREE_PLANTING'), requestId: z.string().uuid() })
  .strict();
module.exports = {
  profile: profile.strict(),
  signup,
  login,
  start,
  action,
  purchase,
  username,
};

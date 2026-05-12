import { Router, type IRouter } from "express";
import { requireAuth } from "../lib/auth";
import { db, investorProfilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

const router: IRouter = Router();

const baseSchema = z.object({
  email: z.string().email().max(254),
  phone: z.string().trim().max(40).optional().nullable(),
  addressLine1: z.string().trim().min(2).max(200),
  addressLine2: z.string().trim().max(200).optional().nullable(),
  city: z.string().trim().min(1).max(120),
  region: z.string().trim().min(1).max(120),
  postalCode: z.string().trim().min(1).max(40),
  country: z.string().trim().length(2),
});

const individualSchema = baseSchema.extend({
  kind: z.literal("individual"),
  legalFirstName: z.string().trim().min(1).max(120),
  legalLastName: z.string().trim().min(1).max(120),
  dateOfBirth: z.string().trim().max(20).optional().nullable(),
  taxIdLast4: z
    .string()
    .trim()
    .max(4)
    .regex(/^\d{0,4}$/)
    .optional()
    .nullable(),
});

const businessSchema = baseSchema.extend({
  kind: z.literal("business"),
  legalEntityName: z.string().trim().min(2).max(200),
  entityType: z.string().trim().min(1).max(80),
  jurisdictionOfFormation: z.string().trim().min(1).max(120),
  einLast4: z
    .string()
    .trim()
    .max(4)
    .regex(/^\d{0,4}$/)
    .optional()
    .nullable(),
  signatoryName: z.string().trim().min(1).max(200),
  signatoryTitle: z.string().trim().min(1).max(120),
});

const profileSchema = z.discriminatedUnion("kind", [
  individualSchema,
  businessSchema,
]);

router.get("/me/profile", requireAuth, async (req, res) => {
  const rows = await db
    .select()
    .from(investorProfilesTable)
    .where(eq(investorProfilesTable.userId, req.appUser!.id))
    .limit(1);
  res.json({ profile: rows[0] ?? null });
});

router.put("/me/profile", requireAuth, async (req, res) => {
  const parsed = profileSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: "Validation failed",
      issues: parsed.error.issues,
    });
    return;
  }
  const v = parsed.data;
  const userId = req.appUser!.id;
  const now = new Date();

  const baseValues = {
    userId,
    kind: v.kind,
    email: v.email,
    phone: v.phone ?? null,
    addressLine1: v.addressLine1,
    addressLine2: v.addressLine2 ?? null,
    city: v.city,
    region: v.region,
    postalCode: v.postalCode,
    country: v.country.toUpperCase(),
    legalFirstName: v.kind === "individual" ? v.legalFirstName : null,
    legalLastName: v.kind === "individual" ? v.legalLastName : null,
    dateOfBirth: v.kind === "individual" ? (v.dateOfBirth ?? null) : null,
    taxIdLast4: v.kind === "individual" ? (v.taxIdLast4 ?? null) : null,
    legalEntityName: v.kind === "business" ? v.legalEntityName : null,
    entityType: v.kind === "business" ? v.entityType : null,
    jurisdictionOfFormation:
      v.kind === "business" ? v.jurisdictionOfFormation : null,
    einLast4: v.kind === "business" ? (v.einLast4 ?? null) : null,
    signatoryName: v.kind === "business" ? v.signatoryName : null,
    signatoryTitle: v.kind === "business" ? v.signatoryTitle : null,
    updatedAt: now,
  };

  const upserted = await db
    .insert(investorProfilesTable)
    .values(baseValues)
    .onConflictDoUpdate({
      target: investorProfilesTable.userId,
      set: { ...baseValues, updatedAt: now },
    })
    .returning();

  res.json({ profile: upserted[0] });
});

export default router;

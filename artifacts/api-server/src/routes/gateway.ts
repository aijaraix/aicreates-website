import { Router, type IRouter } from "express";
import { requireAuth } from "../lib/auth";
import { db, allocationApplicationsTable } from "@workspace/db";
import { desc, eq } from "drizzle-orm";

const router: IRouter = Router();

interface GatewayBody {
  accreditation?: string;
  country?: string;
  intendedAmountCents?: number;
  persona?: "consumer" | "business" | "investor";
  thesisFit?: string;
  referralSource?: string;
  experience?: string;
  conflictDisclosure?: string;
  agreeNotSecurity?: boolean;
  agreeRisk?: boolean;
}

const VALID_ACCRED = new Set([
  "income",
  "net_worth",
  "professional",
  "entity",
  "knowledgeable",
  "none",
]);
const VALID_PERSONA = new Set(["consumer", "business", "investor"]);

router.get("/me/gateway", requireAuth, async (req, res) => {
  const rows = await db
    .select()
    .from(allocationApplicationsTable)
    .where(eq(allocationApplicationsTable.userId, req.appUser!.id))
    .orderBy(desc(allocationApplicationsTable.createdAt))
    .limit(1);
  res.json({ application: rows[0] ?? null });
});

router.post("/gateway", requireAuth, async (req, res) => {
  const body = (req.body ?? {}) as GatewayBody;
  const errors: string[] = [];
  const persona = body.persona ?? "investor";
  if (!VALID_PERSONA.has(persona)) errors.push("invalid persona");
  const accred = body.accreditation ?? "none";
  if (!VALID_ACCRED.has(accred)) errors.push("invalid accreditation");
  const country =
    typeof body.country === "string" ? body.country.trim().toUpperCase() : "";
  if (!country || country.length > 4) errors.push("country required");
  const amount = Number(body.intendedAmountCents);
  if (!Number.isFinite(amount) || amount < 100_000)
    errors.push("intendedAmountCents must be >= 100000");
  const thesis =
    typeof body.thesisFit === "string" ? body.thesisFit.trim() : "";
  if (thesis.length < 20) errors.push("thesisFit must be >= 20 chars");
  if (body.agreeNotSecurity !== true) errors.push("must agree not-a-security");
  if (body.agreeRisk !== true) errors.push("must agree risk");
  if (errors.length) {
    res.status(400).json({ error: "Validation failed", errors });
    return;
  }

  const payload = {
    accreditation: accred,
    country,
    intendedAmountCents: amount,
    persona,
    thesisFit: thesis,
    referralSource: body.referralSource?.trim() || null,
    experience: body.experience?.trim() || null,
    conflictDisclosure: body.conflictDisclosure?.trim() || null,
    agreeNotSecurity: true,
    agreeRisk: true,
    submittedAt: new Date().toISOString(),
  };

  const inserted = await db
    .insert(allocationApplicationsTable)
    .values({
      userId: req.appUser!.id,
      status: "submitted",
      accreditation: accred,
      country,
      intendedAmountCents: amount,
      persona,
      thesisFit: thesis,
      referralSource: body.referralSource?.trim() || null,
      payload,
    })
    .returning();
  res.status(201).json({ application: inserted[0] });
});

export default router;

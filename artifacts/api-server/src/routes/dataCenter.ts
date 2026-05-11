import { Router, type IRouter } from "express";
import { db, dataCenterRequestsTable } from "@workspace/db";
import { notifyTeam } from "../lib/notify";

const router: IRouter = Router();

router.post("/data-center-access", async (req, res) => {
  const body = (req.body ?? {}) as {
    name?: string;
    email?: string;
    company?: string;
    useCase?: string;
    capacity?: string;
  };
  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim();
  const useCase = (body.useCase ?? "").trim();
  if (!name || name.length > 200) {
    res.status(400).json({ error: "name required" });
    return;
  }
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 254) {
    res.status(400).json({ error: "valid email required" });
    return;
  }
  if (!useCase || useCase.length > 4000) {
    res.status(400).json({ error: "useCase required" });
    return;
  }
  const inserted = await db
    .insert(dataCenterRequestsTable)
    .values({
      name,
      email,
      company: body.company?.trim() || null,
      useCase,
      capacity: body.capacity?.trim() || null,
    })
    .returning();
  req.log?.info(
    { id: inserted[0]?.id, email },
    "data-center access request received",
  );
  await notifyTeam({
    subject: `[AICA] Data-center access request from ${email}`,
    message: `New data-center access request.\n\nName: ${name}\nEmail: ${email}\nCompany: ${body.company ?? "-"}\nCapacity: ${body.capacity ?? "-"}\n\nUse case:\n${useCase}`,
    payload: {
      name,
      email,
      company: body.company ?? null,
      capacity: body.capacity ?? null,
      useCase,
    },
  });
  res.status(201).json({ ok: true });
});

export default router;

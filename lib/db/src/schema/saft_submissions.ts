import {
  pgTable,
  text,
  timestamp,
  uuid,
  jsonb,
  customType,
} from "drizzle-orm/pg-core";
import { commitmentsTable } from "./commitments";

const bytea = customType<{ data: Buffer; default: false }>({
  dataType() {
    return "bytea";
  },
});

/**
 * Captures a typed-signature SAFT submission. The PDF bytes are stored
 * inline (bytea) so we have a single self-contained record without an
 * external object-store dependency. A draft watermark is overlaid on
 * the PDF until counsel-approved SAFT language is in place.
 */
export const saftSubmissionsTable = pgTable("saft_submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  commitmentId: uuid("commitment_id")
    .notNull()
    .references(() => commitmentsTable.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  status: text("status").notNull().default("draft"),
  payload: jsonb("payload").notNull(),
  signatureName: text("signature_name").notNull(),
  signedAt: timestamp("signed_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  signerIp: text("signer_ip"),
  signerUserAgent: text("signer_user_agent"),
  version: text("version").notNull().default("draft-2026-05"),
  pdfBytes: bytea("pdf_bytes"),
  /**
   * Counterparty (AICreatesAI) signature applied by an admin from the
   * admin console. When present, `countersignedPdfBytes` holds the
   * fully-executed PDF (signed PDF + appended countersignature page).
   * The investor-facing download endpoint serves the countersigned
   * bytes when available so the dashboard can offer a single
   * "Fully-executed SAFT" link.
   */
  countersignedAt: timestamp("countersigned_at", { withTimezone: true }),
  countersignedBy: text("countersigned_by"),
  countersignerName: text("countersigner_name"),
  countersignerTitle: text("countersigner_title"),
  countersignedPdfBytes: bytea("countersigned_pdf_bytes"),
  /**
   * Set when this submission has been superseded by a later one (e.g.
   * after the commitment amount or round was amended and a new SAFT was
   * required). The most recent non-superseded row is the active SAFT.
   */
  supersededAt: timestamp("superseded_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type SaftSubmission = typeof saftSubmissionsTable.$inferSelect;
export type InsertSaftSubmission = typeof saftSubmissionsTable.$inferInsert;

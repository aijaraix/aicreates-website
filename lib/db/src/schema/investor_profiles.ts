import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { appUsersTable } from "./app_users";

/**
 * One profile row per app_user. Captures the legal identity used to
 * auto-fill SAFTs and back-office reporting. `kind` toggles which set
 * of fields is meaningful (individual vs business). KYC has been
 * removed for the friends-and-family round; tax ID / SSN is captured
 * only as a last-4 hint for the SAFT cover sheet.
 */
export const investorProfilesTable = pgTable("investor_profiles", {
  userId: text("user_id")
    .primaryKey()
    .references(() => appUsersTable.id, { onDelete: "cascade" }),

  /** "individual" | "business" */
  kind: text("kind").notNull().default("individual"),

  // Common
  email: text("email").notNull(),
  phone: text("phone"),

  // Address
  addressLine1: text("address_line1").notNull(),
  addressLine2: text("address_line2"),
  city: text("city").notNull(),
  region: text("region").notNull(),
  postalCode: text("postal_code").notNull(),
  country: text("country").notNull(),

  // Individual fields
  legalFirstName: text("legal_first_name"),
  legalLastName: text("legal_last_name"),
  dateOfBirth: text("date_of_birth"),
  taxIdLast4: text("tax_id_last4"),

  // Business fields
  legalEntityName: text("legal_entity_name"),
  entityType: text("entity_type"),
  jurisdictionOfFormation: text("jurisdiction_of_formation"),
  einLast4: text("ein_last4"),
  signatoryName: text("signatory_name"),
  signatoryTitle: text("signatory_title"),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type InvestorProfile = typeof investorProfilesTable.$inferSelect;
export type InsertInvestorProfile = typeof investorProfilesTable.$inferInsert;

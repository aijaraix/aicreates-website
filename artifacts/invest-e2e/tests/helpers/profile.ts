import type { Page } from "@playwright/test";

/**
 * Seed the signed-in user's investor profile via PUT /api/me/profile.
 *
 * The portal's RequireProfile guard blocks /invest, /saft/:id, and
 * /checkout/:id behind a completed profile. Every spec that drives the
 * UI for those routes must call this after signIn() so it doesn't get
 * redirected to /profile.
 *
 * Idempotent: the route does an UPSERT keyed on userId, so repeated
 * calls per run are safe and cheap.
 */
export async function seedInvestorProfile(
  page: Page,
  email: string,
): Promise<void> {
  const res = await page.request.put("/api/me/profile", {
    data: {
      kind: "individual",
      email,
      phone: null,
      addressLine1: "123 Test Street",
      addressLine2: null,
      city: "Wilmington",
      region: "DE",
      postalCode: "19801",
      country: "US",
      legalFirstName: "Portal",
      legalLastName: "Investor",
      dateOfBirth: "1990-01-01",
      taxIdLast4: "6789",
    },
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok()) {
    throw new Error(
      `seedInvestorProfile failed: ${res.status()} ${await res.text()}`,
    );
  }
}

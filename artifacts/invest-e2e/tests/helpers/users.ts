import { createClerkClient, type ClerkClient } from "@clerk/backend";

const PASSWORD = "PortalE2E!Pass1234";

/**
 * Stable, low-cardinality test identities. Re-using fixed emails keeps the
 * Clerk dev tenant tidy and means we can sign in deterministically across
 * runs without leaking new users every time.
 */
export const INVESTOR_EMAIL = "invest-e2e-investor@example.com";

function adminEmailFromEnv(): string | null {
  const list = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return list[0] ?? null;
}

export const ADMIN_EMAIL = adminEmailFromEnv();

export const TEST_PASSWORD = PASSWORD;

let _client: ClerkClient | null = null;
function client(): ClerkClient {
  if (_client) return _client;
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) throw new Error("CLERK_SECRET_KEY missing");
  _client = createClerkClient({ secretKey });
  return _client;
}

async function findByEmail(email: string) {
  const list = await client().users.getUserList({
    emailAddress: [email],
    limit: 1,
  });
  return list.data[0] ?? null;
}

async function ensureUser(
  email: string,
  firstName: string,
  lastName: string,
): Promise<void> {
  const existing = await findByEmail(email);
  if (existing) {
    // Reset password to the known test value so sign-in is deterministic
    // even if a prior run left the user in an unknown state.
    await client().users.updateUser(existing.id, {
      password: PASSWORD,
      skipPasswordChecks: true,
      firstName,
      lastName,
    });
    return;
  }
  await client().users.createUser({
    emailAddress: [email],
    password: PASSWORD,
    firstName,
    lastName,
    skipPasswordChecks: true,
  });
}

export async function ensureTestUsers(): Promise<void> {
  await ensureUser(INVESTOR_EMAIL, "Portal", "Investor");
  if (ADMIN_EMAIL) {
    await ensureUser(ADMIN_EMAIL, "Portal", "Admin");
  }
}

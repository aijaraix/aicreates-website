import type { Page, APIRequestContext } from "@playwright/test";

/**
 * Authenticated POST helper that relies on the Clerk session cookie that
 * `signIn` already attached to the browser context. We hit the API through
 * the same proxy origin (`localhost:80`) so cookies are sent.
 */
export async function postJson<T>(
  page: Page,
  path: string,
  body: unknown,
): Promise<T> {
  const res = await page.request.post(`/api${path}`, {
    data: body,
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok()) {
    throw new Error(
      `POST /api${path} failed: ${res.status()} ${await res.text()}`,
    );
  }
  return (await res.json()) as T;
}

export async function getJson<T>(page: Page, path: string): Promise<T> {
  const res = await page.request.get(`/api${path}`);
  if (!res.ok()) {
    throw new Error(
      `GET /api${path} failed: ${res.status()} ${await res.text()}`,
    );
  }
  return (await res.json()) as T;
}

/**
 * Server-side helper for setup work that does not need a real browser.
 * Pulls the same session cookie that `signIn` set on the Page so the
 * api-server's `requireAuth` middleware accepts the request.
 */
export async function withCookiesFrom(
  page: Page,
): Promise<APIRequestContext> {
  return page.request;
}

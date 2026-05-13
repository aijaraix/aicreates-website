import { test, expect, type BrowserContext, type Page } from "@playwright/test";
import { signIn } from "./helpers/auth";
import { ADMIN_EMAIL } from "./helpers/users";

/**
 * End-to-end coverage for the admin <-> investor chat surface.
 *
 * Two browser contexts so admin and investor have independent
 * Clerk sessions and independent WebSocket connections.
 */
test.describe("chat", () => {
  test.skip(!ADMIN_EMAIL, "ADMIN_EMAILS env var must include a real address");

  test("investor sends, admin receives live, presence shows online", async ({
    browser,
  }) => {
    const investorCtx: BrowserContext = await browser.newContext();
    const adminCtx: BrowserContext = await browser.newContext();
    const investorPage: Page = await investorCtx.newPage();
    const adminPage: Page = await adminCtx.newPage();
    try {
      await Promise.all([
        signIn(investorPage, "investor"),
        signIn(adminPage, "admin"),
      ]);

      // Investor opens the floating chat widget and sends a message.
      const investorMsg = `hello-from-investor-${Date.now()}`;
      await investorPage.getByTestId("chat-toggle").click();
      await investorPage
        .getByTestId("chat-composer")
        .fill(investorMsg);
      await investorPage.getByTestId("chat-send").click();
      await expect(
        investorPage.getByTestId("chat-messages").getByText(investorMsg),
      ).toBeVisible();

      // Admin navigates to /admin/chat and sees the investor as online + the
      // pending message highlighted in the inbox.
      await adminPage.goto("/invest/admin/chat");
      await expect(
        adminPage.getByTestId("admin-chat-online-count"),
      ).toContainText(/[1-9]/, { timeout: 15_000 });
      await expect(
        adminPage.getByTestId("admin-chat-messages").getByText(investorMsg),
      ).toBeVisible({ timeout: 15_000 });

      // Admin replies; investor sees it live without reloading.
      const adminMsg = `reply-from-admin-${Date.now()}`;
      await adminPage.getByTestId("admin-chat-composer").fill(adminMsg);
      await adminPage.getByTestId("admin-chat-send").click();
      await expect(
        investorPage.getByTestId("chat-messages").getByText(adminMsg),
      ).toBeVisible({ timeout: 15_000 });

      // Admin's nav presence pill counts the investor.
      await expect(
        adminPage.getByTestId("admin-presence-count"),
      ).toContainText(/[1-9]/);

      // Investor surface deliberately exposes no admin presence indicator.
      await expect(
        investorPage.locator('[data-testid="admin-presence-pill"]'),
      ).toHaveCount(0);
    } finally {
      await investorCtx.close();
      await adminCtx.close();
    }
  });
});

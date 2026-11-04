import { test, expect } from "@playwright/test";

// This deliberately enables the real PWA worker. The ordinary navigation suite
// blocks workers to separate client-route errors from cached-asset failures.
test.use({ serviceWorkers: "allow" });

test("previously visited core flow remains usable after losing connectivity", async ({ page, context }) => {
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto("/");
  await expect(page.getByRole("heading", { name: /You don't have to decide yet/i })).toBeVisible();

  // The app registers the service worker after load. Wait until it actually
  // controls this tab, so an offline failure is meaningful rather than a race.
  await page.waitForFunction(
    () => Boolean(navigator.serviceWorker?.controller),
    null,
    { timeout: 30000 },
  );

  await page.getByRole("button", { name: "Begin a walk now" }).click();
  await expect(page).toHaveURL(/\/walk$/);
  await expect(page.getByText("The pause has begun.")).toBeVisible();

  await context.setOffline(true);
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.getByText("The pause has begun.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Save a thought" })).toBeVisible();

  await page.getByRole("button", { name: "Save a thought" }).click();
  const thought = page.getByRole("textbox", { name: "What came to mind?" });
  await thought.fill("Saved while offline");
  await page.getByRole("button", { name: "Save and return to my walk" }).click();
  await expect(page.getByRole("button", { name: "Edit saved thought" })).toBeVisible();

  const localNote = await page.evaluate(() => {
    const raw = localStorage.getItem("walk-instead:v1");
    const data = raw ? JSON.parse(raw) : {};
    return data.walks?.find((walk) => walk.status === "active")?.note;
  });
  expect(localNote).toBe("Saved while offline");
  expect(pageErrors).toEqual([]);
});

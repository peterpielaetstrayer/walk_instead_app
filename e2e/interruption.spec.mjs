import { test, expect } from "@playwright/test";

test("save a thought and finish early without getting stuck in a loading screen", async ({ page }) => {
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto("/");
  await expect(page.getByRole("heading", { name: /You don't have to decide yet/i })).toBeVisible();
  await page.getByRole("button", { name: "Begin a walk now" }).click();
  await expect(page).toHaveURL(/\/walk$/);
  await expect(page.getByText("The pause has begun.")).toBeVisible();

  // The note dialog's focus must survive changes to the text and timer.
  await page.getByRole("button", { name: "Save a thought" }).click();
  const sheet = page.getByRole("dialog", { name: "Keep the thought" });
  await expect(sheet).toBeVisible();
  const thought = sheet.getByRole("textbox", { name: "What came to mind?" });
  await thought.fill("One brief observation");
  await thought.press("End");
  await page.keyboard.type(" after moving");
  await expect(thought).toHaveValue("One brief observation after moving");
  await sheet.getByRole("button", { name: "Save and return to my walk" }).click();

  await expect(sheet).toBeHidden();
  await expect(page.getByRole("button", { name: "Edit saved thought" })).toBeVisible();

  // End early and explicitly decline the emotional check-in.
  await page.getByRole("button", { name: "Finish early" }).click();
  const confirmation = page.getByRole("dialog", { name: "Finish this walk?" });
  await expect(confirmation).toBeVisible();
  await confirmation.getByRole("button", { name: "Finish now" }).click();
  await expect(page).toHaveURL(/\/check-in\?id=/);
  await expect(page.getByRole("heading", { name: "Notice what changed." })).toBeVisible();
  await page.getByRole("button", { name: "Skip check-in" }).click();
  await expect(page).toHaveURL(/\/choice\?id=/);
  await expect(page.getByRole("heading", { name: "You made some space." })).toBeVisible();

  // The captured thought and completed (unrated) walk survive navigation.
  await page.getByRole("button", { name: "Return to my day" }).click();
  await page.getByRole("button", { name: "See my walks" }).click();
  await expect(page).toHaveURL(/\/history$/);
  await expect(page.getByText("1", { exact: true }).first()).toBeVisible();
  expect(pageErrors).toEqual([]);
});

test("refreshing during an active walk resumes the existing timer", async ({ page }) => {
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto("/");
  await page.getByRole("button", { name: "Begin a walk now" }).click();
  await expect(page).toHaveURL(/\/walk$/);
  await page.reload();
  await expect(page.getByText("The pause has begun.")).toBeVisible();
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Return to your walk" })).toBeVisible();
  expect(pageErrors).toEqual([]);
});

test("a calm-time duration choice applies to the next walk and survives refresh", async ({ page }) => {
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto("/settings");
  await page.getByText("5 min", { exact: true }).click();
  await expect(page.getByRole("radio", { name: "5 min", exact: true })).toBeChecked();
  await page.goto("/");
  await expect(page.getByText("5 minutes · No route required")).toBeVisible();
  await page.getByRole("button", { name: "Begin a walk now" }).click();
  // Next.js route navigation is asynchronous; don't reload home by racing push().
  await expect(page).toHaveURL(/\/walk$/);
  await page.reload();
  await expect(page.getByRole("heading", { name: "The pause has begun." })).toBeVisible();

  const stored = await page.evaluate(() => {
    const raw = localStorage.getItem("walk-instead:v1");
    if (!raw) return null;
    const data = JSON.parse(raw);
    return {
      defaultDurationSeconds: data.settings.defaultDurationSeconds,
      activeTargetSeconds: data.walks.find((w) => w.status === "active")?.targetDurationSeconds,
    };
  });
  expect(stored).toEqual({ defaultDurationSeconds: 300, activeTargetSeconds: 300 });
  expect(pageErrors).toEqual([]);
});

import { expect, type Page } from "@playwright/test";

export async function loginAs(
  page: Page,
  email = "superadmin@example.com",
  password = "password",
) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Kata sandi", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Masuk", exact: true }).click();
  await page.waitForURL("/");
}

export async function logout(page: Page) {
  await page.locator('[data-sidebar="footer"] button').first().click();
  await page.getByRole("menuitem", { name: "Keluar" }).click();
  await expect(page).toHaveURL(/\/login/);
}

export function uniqueEmail(prefix = "e2e") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
}

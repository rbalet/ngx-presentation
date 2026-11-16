import { expect, test } from "@playwright/test";

test("hero forms tint individually on hover in both themes", async ({ page, isMobile }) => {
  test.skip(isMobile, "Touch devices keep the quiet background without hover.");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const form = page.locator(".hero-form--registration");
  const otherForm = page.locator(".hero-form--input");

  for (const theme of ["light", "dark"]) {
    if (theme === "dark") await page.getByRole("button", { name: "Dark mode" }).click();
    await page.mouse.move(0, 0);
    const gray = await form.evaluate(element => getComputedStyle(element).color);
    await form.hover();
    await expect(form).not.toHaveCSS("color", gray);
    await expect(otherForm).toHaveCSS("color", gray);
    await expect(form).toHaveCSS("transition-duration", "0s");
    await page.mouse.move(0, 0);
    await expect(form).toHaveCSS("color", gray);
  }
});

test("decorative forms stay inside the hero and leave navigation usable", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const hero = page.locator("#overview");
  const background = hero.locator(".hero-forms");
  await expect(background).toHaveAttribute("aria-hidden", "true");
  await expect(background.locator("input, select, textarea, button, a, [tabindex]")).toHaveCount(0);
  await expect(background).toHaveCSS("overflow", "clip");
  const heroBounds = (await hero.boundingBox())!;
  const backgroundBounds = (await background.boundingBox())!;
  expect(backgroundBounds.x).toBe(heroBounds.x);
  expect(backgroundBounds.width).toBe(heroBounds.width);
  expect(backgroundBounds.y + backgroundBounds.height).toBe(heroBounds.y + heroBounds.height);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(page.viewportSize()!.width);

  const start = page.getByRole("link", { name: "Start with chapter 01" });
  await start.focus();
  await expect(start).toBeFocused();
  await start.click();
  await expect(page).toHaveURL(/#chapter-01$/);
  await expect(background).not.toBeInViewport();
});

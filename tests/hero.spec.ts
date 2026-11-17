import { expect, test } from "@playwright/test";

test("hero forms tint individually on hover in both themes", async ({ page, isMobile }) => {
  test.skip(isMobile, "Touch devices keep the quiet background without hover.");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const form = page.locator("#overview .hero-form--registration");
  const otherForm = page.locator("#overview .hero-form--input");

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

for (const { sectionId, linkName, nextId } of [
  { sectionId: "overview", linkName: "Start with chapter 01", nextId: "chapter-01" },
  { sectionId: "chapter-12", linkName: "Next: 11", nextId: "chapter-11" },
]) {
  test(`decorative forms stay inside ${sectionId} and leave navigation usable`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(`/#${sectionId}`);
    const section = page.locator(`#${sectionId}`);
    const background = section.locator("app-form-background");
    await expect(background).toHaveAttribute("aria-hidden", "true");
    await expect(background.locator("input, select, textarea, button, a, [tabindex]")).toHaveCount(0);
    await expect(background).toHaveCSS("overflow", "clip");
    const sectionBounds = (await section.boundingBox())!;
    const backgroundBounds = (await background.boundingBox())!;
    expect(backgroundBounds.x).toBe(sectionBounds.x);
    expect(backgroundBounds.width).toBe(sectionBounds.width);
    expect(backgroundBounds.y + backgroundBounds.height).toBe(sectionBounds.y + sectionBounds.height);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(page.viewportSize()!.width);

    const link = section.getByRole("link", { name: linkName });
    await link.focus();
    await expect(link).toBeFocused();
    await link.click();
    await expect(page).toHaveURL(new RegExp(`#${nextId}$`));
    await expect(background).not.toBeInViewport();
  });
}

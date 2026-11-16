import { expect, test } from '@playwright/test';

const prompt = 'Use WebMCP to fill the phone field with +1 202-555-0147, report its validation state, and show me a screenshot.';

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?selected=webmcp#chapter-04');
});

test('WebMCP test button copies the exact prompt in every language', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const detail = page.locator('#capability-detail');
  for (const [language, label, confirmation] of [
    ['en', 'Copy test prompt', 'Copied.'],
    ['fr', 'Copier le prompt de test', 'Copié.'],
    ['de', 'Test-Prompt kopieren', 'Kopiert.'],
  ]) {
    await page.locator('header .language-select').selectOption(language);
    const button = detail.getByRole('button', { name: label, exact: true });
    await expect(button).toHaveAttribute('title', label);
    await expect(button).toHaveText('');
    await button.press('Enter');
    await expect(detail.getByRole('status')).toHaveText(confirmation);
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(prompt);
    await expect(detail.getByRole('textbox')).toBeEmpty();
  }
  await page.locator('#chapter-04').getByRole('button', { name: 'Skill', exact: true }).click();
  await expect(detail.getByRole('button', { name: 'Test-Prompt kopieren', exact: true })).toHaveCount(0);
  await expect(detail.getByRole('status')).toBeEmpty();
});

test('WebMCP exposes the prompt for manual copying when clipboard access fails', async ({ page }) => {
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText: async () => { throw new Error('Clipboard access denied'); } },
  }));
  const detail = page.locator('#capability-detail');
  await detail.getByRole('button', { name: 'Copy test prompt', exact: true }).click();
  await expect(detail.getByRole('status')).toContainText('Copy unavailable. Select and copy the prompt below.');
  await expect(detail.locator('.prompt-text')).toHaveText(prompt);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

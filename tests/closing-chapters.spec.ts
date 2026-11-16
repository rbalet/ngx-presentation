import { expect, test } from '@playwright/test';

test('Periscope walkthrough changes area and explains preview without pretending to submit', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#chapter-07');
  const chapter = page.locator('#chapter-07');
  await chapter.getByRole('button', { name: 'Surveys', exact: true }).click();
  await expect(chapter.getByRole('heading', { name: 'Collect and review responses' })).toBeVisible();
  await chapter.getByRole('button', { name: 'Preview', exact: true }).click();
  await expect(chapter.getByText('A preview does not submit', { exact: false })).toBeVisible();
  await expect(chapter.getByRole('button', { name: 'Preview', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(chapter.getByRole('link', { name: 'Open local Periscope' })).toHaveAttribute('href', 'https://periscope.localhost/error/login');
  await expect(chapter.getByText('This slide is a product walkthrough.', { exact: false })).toBeVisible();
});

test('changing the optional example language preserves the field key and answer', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#chapter-09');
  const chapter = page.locator('#chapter-09');
  await chapter.getByLabel('Full name', { exact: true }).fill('Sam Example');
  await chapter.getByRole('button', { name: 'Deutsch', exact: true }).click();
  await expect(chapter.getByLabel('Vollständiger Name', { exact: true })).toHaveValue('Sam Example');
  await expect(chapter.locator('pre')).toContainText('"fullName": "Sam Example"');
  await chapter.getByRole('button', { name: 'Français', exact: true }).click();
  await expect(chapter.getByLabel('Nom complet', { exact: true })).toHaveValue('Sam Example');
  await expect(chapter.locator('pre')).toContainText('"fullName": "Sam Example"');
});

test('Q&A topics select a concrete discussion question', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#chapter-11');
  const chapter = page.locator('#chapter-11');
  await chapter.getByRole('button', { name: 'Ownership', exact: true }).click();
  await expect(chapter.getByText('Who should own the shared fields, and how should teams contribute changes?')).toBeVisible();
  await expect(chapter.getByRole('button', { name: 'Ownership', exact: true })).toHaveAttribute('aria-pressed', 'true');
});

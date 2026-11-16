import { expect, test } from '@playwright/test';

test('keyboard navigation includes continuation slides and leaves controls alone', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#chapter-02');
  await page.locator('#chapter-02').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page).toHaveURL(/#chapter-02-(more-examples|continued)$/);
  await page.keyboard.press('ArrowLeft');
  await expect(page).toHaveURL(/#chapter-02$/);
  await page.locator('header').getByRole('combobox', { name: 'Language', exact: true }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page).toHaveURL(/#chapter-02$/);
});

test('focus view gives the slide space and restores the chapter index', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Focus view is for projected desktop slides.');
  await page.goto('/#chapter-03');
  const index = page.getByRole('navigation', { name: 'Chapter index', exact: true });
  await page.getByRole('button', { name: 'Focus view' }).click();
  await expect(index).toBeHidden();
  await expect(page.getByRole('button', { name: 'Show chapters' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Show chapters' }).click();
  await expect(index).toBeVisible();
});

test('chapter 04 result supports direct links and keyboard navigation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#chapter-04-result');
  const result = page.locator('#chapter-04-result');
  await expect(result.getByRole('heading', { name: '04.1 · Agent result' })).toBeInViewport();
  await result.focus();
  await page.keyboard.press('ArrowLeft');
  await expect(page).toHaveURL(/#chapter-04$/);
  await page.keyboard.press('ArrowRight');
  await expect(page).toHaveURL(/#chapter-04-result$/);
  await page.keyboard.press('ArrowRight');
  await expect(page).toHaveURL(/#chapter-05$/);
});

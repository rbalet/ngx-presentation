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

test('chapter 04 moves directly to API and validation with keyboard navigation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#chapter-04');
  const skill = page.locator('#chapter-04');
  await expect(skill.locator('.chapter-slide')).toHaveCount(1);
  await expect(page.locator('#chapter-04-result')).toHaveCount(0);
  await skill.focus();
  await page.keyboard.press('ArrowRight');
  await expect(page).toHaveURL(/#chapter-05$/);
  await expect(page.locator('#chapter-05').getByRole('textbox', { name: 'Fields JSON', exact: true })).toBeInViewport();
  await page.keyboard.press('ArrowLeft');
  await expect(page).toHaveURL(/#chapter-04$/);
});

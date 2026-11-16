import { expect, test } from '@playwright/test';

test('Periscope walkthrough changes area and explains preview without pretending to submit', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#chapter-07');
  const chapter = page.locator('#chapter-07');
  await chapter.getByRole('button', { name: 'Surveys', exact: true }).click();
  await expect(chapter.getByRole('heading', { name: 'Collect and review responses' })).toBeVisible();
  await chapter.getByRole('button', { name: 'Preview', exact: true }).click();
  await expect(chapter.getByText('The preview sends nothing.', { exact: false })).toBeVisible();
  await expect(chapter.getByRole('button', { name: 'Preview', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(chapter.getByRole('link', { name: 'Open local Periscope' })).toHaveAttribute('href', 'https://periscope.localhost/error/login');
  await expect(chapter.getByText('Walkthrough. For a live demo, start Periscope and its API.')).toBeVisible();
});

test('Q&A shows the audience prompts and resource links', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#chapter-11');
  const content = page.locator('#chapter-11 app-closing-chapter');
  await expect(content.getByText('And you?', { exact: true })).toBeVisible();
  await expect(content.getByText('Is it missing something?', { exact: true })).toBeVisible();
  await expect(content.getByRole('button')).toHaveCount(0);
  await expect(content.getByRole('link', { name: 'Revisit the live form' })).toHaveAttribute('href', '#chapter-05');
});

import { expect, test } from '@playwright/test';

test('all numbered chapters are reachable and extras can be skipped', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Why are we still rebuilding the same forms?');

  const index = page.getByRole('navigation', { name: 'Chapter index', exact: true });
  await expect(index.getByRole('link')).toHaveCount(11);
  for (const href of await index.getByRole('link').evaluateAll((links) => links.map((link) => link.getAttribute('href')))) {
    await expect(page.locator(href!)).toHaveCount(1);
  }

  await index.getByRole('link', { name: /08 A shared approach/ }).click();
  const chapter = page.getByRole('region', { name: '08 A shared approach at BIT' });
  await chapter.getByRole('link', { name: 'Skip extras' }).click();
  await expect(page).toHaveURL(/#chapter-11$/);
  await expect(page.getByRole('heading', { name: '11 Q&A' })).toBeInViewport();
  await page.getByRole('region', { name: '11 Q&A' }).getByRole('link', { name: 'Back to overview' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toBeInViewport();
  expect(errors).toEqual([]);
});

test('direct links work with reduced motion and without horizontal overflow', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#chapter-09');
  await expect(page.getByRole('heading', { name: '09 Multilingual forms' })).toBeInViewport();
  await expect(page.locator('#chapter-09')).toContainText('Optional extra');
  await expect(page.locator('#chapter-09 .chapter-content')).toHaveCSS('transform', 'none');
  await expect(page.locator('html')).toHaveCSS('scroll-behavior', 'auto');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

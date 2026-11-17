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

test('focus view reveals navigation at the edges and keeps it open while hovered', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Focus view is for projected desktop slides.');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#chapter-03');
  const header = page.locator('header');
  const sidebar = page.locator('.chapter-index-slot');
  const index = page.getByRole('navigation', { name: 'Chapter index', exact: true });
  const { width, height } = page.viewportSize()!;
  const originalWidth = (await page.locator('.chapter-sections').boundingBox())!.width;
  await page.getByRole('button', { name: 'Focus view' }).click();
  await page.mouse.move(width / 2, height / 2);
  await expect(header).toHaveCSS('opacity', '0');
  await expect(sidebar).toHaveCSS('opacity', '0');
  expect((await page.locator('.chapter-sections').boundingBox())!.width).toBeGreaterThan(originalWidth);
  await expect(page.getByRole('button', { name: 'Show chapters' })).toHaveAttribute('aria-pressed', 'true');

  await page.mouse.move(width / 2, 1);
  await expect(header).toHaveCSS('opacity', '1');
  await header.getByRole('combobox').hover();
  await expect(header).toHaveCSS('opacity', '1');
  await expect(sidebar).toHaveCSS('opacity', '0');
  await page.mouse.move(width / 2, height / 2);
  await expect(header).toHaveCSS('opacity', '0');

  await page.mouse.move(width - 1, height / 2);
  await expect(sidebar).toHaveCSS('opacity', '1');
  const chapterLink = index.locator('a[href="#chapter-04"]');
  await chapterLink.hover();
  await expect(sidebar).toHaveCSS('opacity', '1');
  await chapterLink.click();
  await expect(page).toHaveURL(/#chapter-04$/);
  await expect(sidebar).toHaveCSS('opacity', '1');
  await page.mouse.move(width / 2, height / 2);
  await expect(sidebar).toHaveCSS('opacity', '0');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

  await page.mouse.move(width / 2, 1);
  await page.getByRole('button', { name: 'Show chapters' }).click();
  await page.mouse.move(width / 2, height / 2);
  await expect(header).toHaveCSS('opacity', '1');
  await expect(sidebar).toHaveCSS('opacity', '1');
  await expect(index).toBeVisible();
  expect((await page.locator('.chapter-sections').boundingBox())!.width).toBe(originalWidth);
});

test('focus view keeps a minimal running timer at the bottom of the viewport', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Focus view is for projected desktop slides.');
  const start = new Date('2026-11-17T09:00:00Z');
  await page.clock.setFixedTime(start);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const footer = page.locator('.focus-timer');
  await expect(footer).toBeHidden();
  await page.getByRole('link', { name: 'Start with chapter 01' }).click();
  await page.getByRole('button', { name: 'Focus view' }).click();
  await page.mouse.move(500, 400);
  await expect(footer).toHaveText('0 / 60 min');
  const timer = footer.getByRole('progressbar', { name: 'Presentation time' });
  await expect(timer).toHaveAttribute('value', '0');
  await page.clock.setFixedTime(new Date(start.getTime() + 30 * 60000));
  await expect(footer).toHaveText('30 / 60 min');
  await expect(timer).toHaveAttribute('value', '50');
  await expect(timer).toHaveCSS('--timer-fill', '#000');
  const bounds = (await footer.boundingBox())!;
  expect(bounds.x).toBe(0);
  expect(bounds.width).toBe(page.viewportSize()!.width);
  expect(bounds.y + bounds.height).toBe(page.viewportSize()!.height);
  const track = (await timer.boundingBox())!;
  const readout = (await footer.locator('.focus-timer-readout').boundingBox())!;
  expect(track.x).toBe(16);
  expect(track.x + track.width).toBeLessThan(readout.x);
  expect(readout.x + readout.width).toBe(bounds.width - 16);
  await expect(footer.getByRole('button')).toHaveCount(0);

  await page.locator('#chapter-01').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page).not.toHaveURL(/#chapter-01$/);
  await expect(footer).toBeInViewport();
  await page.mouse.move(500, 1);
  await page.getByRole('button', { name: 'Dark mode' }).click();
  await expect(timer).toHaveCSS('--timer-fill', '#f8f6f1');
  await page.clock.setFixedTime(new Date(start.getTime() + 61 * 60000));
  await expect(timer).toHaveAttribute('aria-valuetext', '61 of 60 minutes elapsed, over time');
  await expect(timer).toHaveAttribute('value', '100');
  await page.getByRole('button', { name: 'Show chapters' }).click();
  await expect(footer).toBeHidden();
  await expect(page.getByRole('progressbar', { name: 'Presentation time' })).toHaveAttribute('value', '100');
});

test('focus view reveals keyboard controls and restores navigation on narrow screens', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Focus view is for projected desktop slides.');
  await page.goto('/');
  await page.getByRole('button', { name: 'Focus view' }).click();
  await page.mouse.move(500, 400);
  const header = page.locator('header');
  const sidebar = page.locator('.chapter-index-slot');
  await expect(header).toHaveCSS('opacity', '0');
  await expect(page.locator('.focus-timer')).toBeVisible();

  await page.keyboard.press('Tab');
  await expect(header.getByRole('combobox')).toBeFocused();
  await expect(header).toHaveCSS('opacity', '1');
  await page.keyboard.press('Tab');
  await expect(header.getByRole('button', { name: 'Dark mode' })).toBeFocused();
  await expect(header).toHaveCSS('opacity', '1');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Start with chapter 01' })).toBeFocused();
  await expect(header).toHaveCSS('opacity', '0');
  await page.keyboard.press('Tab');
  await expect(sidebar.getByRole('link').first()).toBeFocused();
  await expect(sidebar).toHaveCSS('opacity', '1');

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(header).toHaveCSS('opacity', '1');
  await expect(sidebar).toHaveCSS('opacity', '1');
  await expect(sidebar).toHaveCSS('position', 'static');
  await expect(page.getByRole('button', { name: 'Show chapters' })).toBeHidden();
  await expect(page.locator('.focus-timer')).toBeHidden();
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

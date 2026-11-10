import { expect, test } from '@playwright/test';

test('the presentation timer starts empty, survives reloads and turns primary only after an hour', async ({ page }) => {
  const start = new Date('2026-11-09T09:00:00Z');
  await page.clock.setFixedTime(start);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const timer = page.getByRole('progressbar', { name: 'Presentation time' });
  await expect(timer).toHaveAttribute('value', '0');
  await expect(timer).toHaveAttribute('aria-valuetext', 'Presentation not started');
  expect(await page.evaluate(() => localStorage.getItem('ngx-presentation-started-at'))).toBeNull();

  await page.getByRole('link', { name: 'Start with chapter 01' }).click();
  await expect(page).toHaveURL(/#chapter-01$/);
  await expect.poll(() => page.evaluate(() => localStorage.getItem('ngx-presentation-started-at'))).toBe(String(start.getTime()));

  await page.clock.setFixedTime(new Date(start.getTime() + 30 * 60000));
  await expect(timer).toHaveAttribute('value', '50');
  await expect(timer).toHaveCSS('--timer-fill', '#d9d6d0');
  await page.reload();
  await expect(timer).toHaveAttribute('value', '50');

  await page.locator('.brand').click();
  await page.getByRole('link', { name: 'Start with chapter 01' }).click();
  await expect(timer).toHaveAttribute('value', '50');
  expect(await page.evaluate(() => localStorage.getItem('ngx-presentation-started-at'))).toBe(String(start.getTime()));

  await page.clock.setFixedTime(new Date(start.getTime() + 60 * 60000));
  await expect(timer).toHaveAttribute('value', '100');
  await expect(timer).toHaveCSS('--timer-fill', '#d9d6d0');
  await page.clock.setFixedTime(new Date(start.getTime() + 61 * 60000));
  await expect(timer).toHaveCSS('--timer-fill', '#b92e36');
  await expect(timer).toHaveAttribute('value', '100');
  await expect(timer).toHaveAttribute('aria-valuetext', '61 of 60 minutes elapsed, over time');
});

test('the timer button clears the saved start and starts a fresh presentation', async ({ page }) => {
  const start = new Date('2026-11-09T09:00:00Z');
  await page.clock.setFixedTime(start);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#chapters');
  const timer = page.getByRole('progressbar', { name: 'Presentation time' });
  const startButton = page.getByRole('button', { name: 'Start presentation timer' });
  await expect(startButton).toBeEnabled();
  await startButton.focus();
  await startButton.press('Enter');
  await expect(page).toHaveURL(/#chapters$/);
  await page.clock.setFixedTime(new Date(start.getTime() + 61 * 60000));
  await expect(timer).toHaveCSS('--timer-fill', '#b92e36');

  await page.getByRole('button', { name: 'Reset presentation timer' }).click();
  await expect(timer).toHaveAttribute('value', '0');
  await expect(timer).toHaveCSS('--timer-fill', '#d9d6d0');
  await expect(startButton).toBeEnabled();
  expect(await page.evaluate(() => localStorage.getItem('ngx-presentation-started-at'))).toBeNull();
  const nextStart = start.getTime() + 65 * 60000;
  await page.clock.setFixedTime(new Date(nextStart));
  await page.reload();
  await expect(startButton).toBeEnabled();
  await expect(timer).toHaveAttribute('aria-valuetext', 'Presentation not started');
  await expect(timer).toHaveAttribute('value', '0');

  await startButton.click();
  expect(await page.evaluate(() => localStorage.getItem('ngx-presentation-started-at'))).toBe(String(nextStart));
  await page.clock.setFixedTime(new Date(nextStart + 30 * 60000));
  await expect(timer).toHaveAttribute('value', '50');
});

test('invalid saved start times leave the timer ready to start', async ({ page }) => {
  const start = new Date('2026-11-09T09:00:00Z');
  await page.clock.setFixedTime(start);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const savedStart of ['invalid', 'Infinity', '-1', String(start.getTime() + 60000)]) {
    await page.goto('/');
    await page.evaluate((value) => localStorage.setItem('ngx-presentation-started-at', value), savedStart);
    await page.reload();
    const timer = page.getByRole('progressbar', { name: 'Presentation time' });
    await expect(timer).toHaveAttribute('value', '0');
    await page.getByRole('link', { name: 'Start with chapter 01' }).click();
    await expect(timer).toHaveAttribute('aria-valuetext', '0 of 60 minutes elapsed');
    expect(await page.evaluate(() => localStorage.getItem('ngx-presentation-started-at'))).toBe(String(start.getTime()));
  }
});

test('the timer still runs when local storage is unavailable', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const start = new Date('2026-11-09T09:00:00Z');
  await page.clock.setFixedTime(start);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      get() { throw new DOMException('Storage blocked', 'SecurityError'); },
    });
  });
  await page.goto('/');
  await page.getByRole('link', { name: 'Start with chapter 01' }).click();
  await page.clock.setFixedTime(new Date(start.getTime() + 30 * 60000));
  await expect(page.getByRole('progressbar', { name: 'Presentation time' })).toHaveAttribute('value', '50');
  await page.getByRole('button', { name: 'Reset presentation timer' }).click();
  await expect(page.getByRole('progressbar', { name: 'Presentation time' })).toHaveAttribute('value', '0');
  await page.getByRole('button', { name: 'Start presentation timer' }).click();
  await expect(page.getByRole('button', { name: 'Reset presentation timer' })).toBeEnabled();
  expect(errors).toEqual([]);
});

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
  await expect(page.getByRole('navigation', { name: 'Chapter index', exact: true }).locator('[aria-current="location"]')).toContainText('Multilingual forms');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('the same chapter index sticks without jumping and highlights the chapter while scrolling', async ({ page, isMobile }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const index = page.getByRole('navigation', { name: 'Chapter index', exact: true });
  const current = index.locator('[aria-current="location"]');
  await expect(current).toHaveCount(0);
  await expect(index).toHaveCSS('position', isMobile ? 'static' : 'sticky');
  const originalIndex = await index.elementHandle();
  const originalBounds = await index.boundingBox();
  const chapterTop = await page.locator('#chapter-01').evaluate((element) => element.getBoundingClientRect().top + window.scrollY);

  await page.evaluate(() => window.scrollTo(0, 200));
  await expect(index).toHaveCSS('position', isMobile ? 'static' : 'sticky');
  expect(await index.evaluate((element, original) => element === original, originalIndex)).toBe(true);
  const scrolledBounds = await index.boundingBox();
  expect(scrolledBounds!.x).toBe(originalBounds!.x);
  expect(scrolledBounds!.width).toBe(originalBounds!.width);
  if (!isMobile) expect(scrolledBounds!.y).toBe(88);
  expect(await page.locator('#chapter-01').evaluate((element) => element.getBoundingClientRect().top + window.scrollY)).toBe(chapterTop);

  for (const number of ['02', '05', '03']) {
    await page.locator(`#chapter-${number}`).evaluate((element) => element.scrollIntoView());
    await expect(current).toHaveAttribute('href', `#chapter-${number}`);
    await expect(current).toHaveCSS('font-weight', '700');
    await expect(index.getByRole('link', { name: /01 About me/ })).toHaveCSS('font-weight', '400');
  }

  if (!isMobile) {
    const bounds = await index.boundingBox();
    expect(bounds!.y).toBe(88);
    expect(bounds!.x + bounds!.width).toBe(page.viewportSize()!.width - 16);
    const content = await page.locator('#chapter-03 .chapter-content').boundingBox();
    expect(content!.x + content!.width).toBeLessThan(bounds!.x);
    await index.getByRole('link', { name: /11 Q&A/ }).click();
    await expect(current).toHaveAttribute('href', '#chapter-11');
    await expect(page.getByRole('heading', { name: '11 Q&A' })).toBeInViewport();
    await page.setViewportSize({ width: 1280, height: 500 });
    await page.goto('/#chapter-11');
    await expect(current).toHaveAttribute('href', '#chapter-11');
    await expect(current).toBeInViewport();
  }

  await page.locator('.site-header').getByRole('link', { name: 'Chapters', exact: true }).click();
  await expect(index.getByRole('heading', { name: 'Chapters', exact: true })).toBeInViewport();
  await page.locator('.brand').click();
  await expect(index).toHaveCSS('position', isMobile ? 'static' : 'sticky');
  await expect(current).toHaveCount(0);
});

test('completed chapters show checkmarks and restore their durations when scrolling back', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#chapter-01');
  const index = page.getByRole('navigation', { name: 'Chapter index', exact: true });
  const first = index.locator('a[href="#chapter-01"]');
  const third = index.locator('a[href="#chapter-03"]');
  await expect(first).toHaveAttribute('aria-current', 'location');
  await expect(index.getByRole('img', { name: 'Completed' })).toHaveCount(0);

  await page.locator('#chapter-03').evaluate((element) => element.scrollIntoView());
  await expect(third).toHaveAttribute('aria-current', 'location');
  await expect(index.getByRole('img', { name: 'Completed' })).toHaveCount(2);
  await expect(first.locator('.index-time')).not.toContainText('min');
  await expect(first.locator('.index-title')).toHaveCSS('text-decoration-line', 'line-through');
  await expect(third.locator('.index-time')).toHaveText('7 min');
  await expect(third.locator('.index-title')).toHaveCSS('text-decoration-line', 'none');
  await expect(index.locator('a[href="#chapter-04"] .index-time')).toHaveText('4 min');

  await page.locator('#chapter-01').evaluate((element) => element.scrollIntoView());
  await expect(first).toHaveAttribute('aria-current', 'location');
  await expect(index.getByRole('img', { name: 'Completed' })).toHaveCount(0);
  await expect(first.locator('.index-time')).toHaveText('2 min');
  await expect(first.locator('.index-title')).toHaveCSS('text-decoration-line', 'none');
});

test('the introduction keeps three cards aligned and groups the maintainers', async ({ page, isMobile }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#chapter-01');
  const chapter = page.locator('#chapter-01');
  await expect(chapter.getByRole('heading', { level: 2 })).toBeInViewport();
  const cards = chapter.getByRole('article');
  await expect(cards).toHaveCount(3);
  const maintainers = chapter.getByRole('region', { name: 'Open-source maintainer' });
  await expect(maintainers.getByRole('article')).toHaveCount(2);
  await expect(maintainers.getByRole('heading', { name: 'Stack Overflow' })).toHaveCount(0);

  const boxes = await cards.evaluateAll((elements) => elements.map((element) => {
    const { top, bottom, left, right } = element.getBoundingClientRect();
    return { top, bottom, left, right };
  }));
  for (let index = 1; index < boxes.length; index++) {
    if (isMobile) {
      expect(boxes[index].top).toBeGreaterThan(boxes[index - 1].bottom);
    } else {
      expect(Math.abs(boxes[index].top - boxes[0].top)).toBeLessThan(1);
      expect(boxes[index].left).toBeGreaterThan(boxes[index - 1].right);
    }
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await chapter.getByRole('link', { name: 'Next: 02' }).click();
  await expect(page.getByRole('heading', { name: '02 The problem' })).toBeInViewport();
});

test('the problem chapter stays active from the form examples through the shared requirements', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#chapter-02');
  const chapter = page.locator('#chapter-02');
  const current = page.getByRole('navigation', { name: 'Chapter index', exact: true }).locator('[aria-current="location"]');
  await expect(chapter.getByRole('heading', { level: 2 })).toBeInViewport();
  await expect(current).toHaveAttribute('href', '#chapter-02');
  const gallery = chapter.getByRole('figure', { name: 'Same fields. Different designs.' });
  await expect(gallery).toContainText('Illustrative examples with fictional data.');
  const requirements = chapter.getByRole('region', { name: 'What do we need from a shared approach?' });
  await requirements.scrollIntoViewIfNeeded();
  await expect(requirements.getByRole('heading', { name: '3 Adaptive' })).toBeInViewport();
  await expect(current).toHaveAttribute('href', '#chapter-02');
  expect(await chapter.locator('.form-example, .problem-pillars li').evaluateAll((elements) => elements.every((element) => {
    const { left, right } = element.getBoundingClientRect();
    return left >= 0 && right <= window.innerWidth && element.scrollWidth <= element.clientWidth;
  }))).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

  await chapter.getByRole('link', { name: 'Previous: 01' }).click();
  await expect(page.locator('#title-01')).toBeInViewport();
  await page.locator('#chapter-01').getByRole('link', { name: 'Next: 02' }).click();
  await expect(chapter.getByRole('heading', { level: 2 })).toBeInViewport();
  await chapter.getByRole('link', { name: 'Next: 03' }).click();
  await expect(page.locator('#title-03')).toBeInViewport();
  await expect(current).toHaveAttribute('href', '#chapter-03');
});

import { expect, test } from '@playwright/test';

test('scrolling updates chapter and continuation URLs without adding history entries', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?source=slides');
  await expect(page.locator('#chapter-04')).toBeAttached();
  const historyLength = await page.evaluate(() => history.length);

  for (const id of ['chapter-01', 'chapter-02', 'chapter-02-continued', 'chapter-03', 'chapter-04', 'chapter-05', 'chapter-04', 'overview']) {
    await page.locator(`#${id}`).evaluate(element => element.scrollIntoView({ behavior: 'instant' }));
    await expect(page).toHaveURL(`/?source=slides#${id}`);
  }

  expect(await page.evaluate(() => history.length)).toBe(historyLength);
});

test('the chapter URL changes when its title reaches the sticky header', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#chapter-03');
  await expect(page.locator('#chapter-03 h2')).toBeInViewport();
  await page.addStyleTag({ content: 'html { scroll-snap-type: none !important; scroll-behavior: auto !important; }' });
  const boundary = await page.locator('#chapter-04').evaluate(element =>
    element.getBoundingClientRect().top + scrollY - document.querySelector('header')!.offsetHeight,
  );
  await page.evaluate(top => scrollTo({ top, behavior: 'instant' }), boundary - 2);
  await expect(page).toHaveURL(/#chapter-03$/);
  await page.evaluate(top => scrollTo({ top, behavior: 'instant' }), boundary);
  await expect(page).toHaveURL(/#chapter-04$/);
  await page.evaluate(top => scrollTo({ top, behavior: 'instant' }), boundary - 2);
  await expect(page).toHaveURL(/#chapter-03$/);
});

test('capability selections update the query and survive reloads and browser history', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?source=slides#chapter-04');
  const chapter = page.locator('#chapter-04');
  const cards = chapter.locator('.capability-card');
  const historyLength = await page.evaluate(() => history.length);

  for (const [index, id] of ['mcp', 'webmcp', 'skill'].entries()) {
    await cards.nth(index).press('Enter');
    await expect(page).toHaveURL(`/?source=slides&selected=${id}#chapter-04`);
    await page.reload();
    await expect(cards.nth(index)).toHaveAttribute('aria-pressed', 'true');
    await expect(chapter.locator('#capability-detail h3')).toHaveText(['MCP', 'WebMCP', 'Skill'][index]);
  }
  expect(await page.evaluate(() => history.length)).toBe(historyLength);

  await cards.nth(1).click();
  await chapter.getByRole('link', { name: 'Next: 05', exact: true }).click();
  await expect(page.locator('#chapter-05 h2')).toBeInViewport();
  await expect(page).toHaveURL('/?source=slides&selected=webmcp#chapter-05');
  await chapter.evaluate(element => element.scrollIntoView({ behavior: 'instant' }));
  await expect(page).toHaveURL('/?source=slides&selected=webmcp#chapter-04');
  await cards.nth(2).click();
  await expect(page).toHaveURL('/?source=slides&selected=skill#chapter-04');

  await page.goBack();
  await expect(page).toHaveURL('/?source=slides&selected=webmcp#chapter-04');
  await expect(cards.nth(1)).toHaveAttribute('aria-pressed', 'true');
  await page.goForward();
  await expect(page).toHaveURL('/?source=slides&selected=skill#chapter-04');
  await expect(cards.nth(2)).toHaveAttribute('aria-pressed', 'true');
});

test('unknown selections fall back to the first capability', async ({ page }) => {
  await page.goto('/?selected=unknown#chapter-04');
  const cards = page.locator('#chapter-04 .capability-card');
  await expect(cards.first()).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#capability-detail h3')).toHaveText('MCP');
  await cards.first().click();
  await expect(page).toHaveURL('/?selected=mcp#chapter-04');
});

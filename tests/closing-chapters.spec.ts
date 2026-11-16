import { expect, test } from '@playwright/test';

test('Periscope pairs each area with three Formly capabilities and a bundled illustration', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#chapter-07');
  const chapter = page.locator('#chapter-07');
  const areas = [
    { name: 'Events', image: 'events', title: 'Register participants', first: 'Configure registration fields for each event.' },
    { name: 'Workflows', image: 'workflows', title: 'Move a request forward', first: 'Define a form for each workflow step.' },
    { name: 'Surveys', image: 'surveys', title: 'Collect and review responses', first: 'Build questionnaires from reusable question types.' },
  ];
  for (const area of areas) {
    const button = chapter.getByRole('button', { name: area.name, exact: true });
    await button.click();
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    await expect(chapter.getByRole('heading', { name: area.title })).toBeVisible();
    const capabilities = chapter.getByRole('list', { name: 'What ngx-formly can do' }).getByRole('listitem');
    await expect(capabilities).toHaveCount(3);
    await expect(capabilities.first()).toHaveText(area.first);
    const image = chapter.locator('.area-image');
    await expect(image).toHaveAttribute('src', `periscope/${area.image}.png`);
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await expect(chapter.getByRole('link', { name: 'Open local Periscope' })).toHaveAttribute('href', 'https://periscope.localhost/error/login');
  await expect(chapter.getByText('Walkthrough. For a live demo, start Periscope and its API.')).toBeVisible();
  for (const language of [
    { code: 'de', label: 'Was ngx-formly ermöglicht', first: 'Fragebögen aus wiederverwendbaren Fragetypen erstellen.' },
    { code: 'fr', label: 'Ce que permet ngx-formly', first: 'Créer des questionnaires à partir de types de questions réutilisables.' },
  ]) {
    await page.locator('header .language-select').selectOption(language.code);
    const capabilities = chapter.getByRole('list', { name: language.label }).getByRole('listitem');
    await expect(capabilities).toHaveCount(3);
    await expect(capabilities.first()).toHaveText(language.first);
  }
});

test('Periscope reveals only the illustration region for the hovered, focused, or tapped capability', async ({ page, isMobile }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#chapter-07');
  const chapter = page.locator('#chapter-07');
  const colors = chapter.locator('.area-color');

  for (const area of ['Events', 'Workflows', 'Surveys']) {
    await chapter.getByRole('button', { name: area, exact: true }).click();
    await expect(chapter.locator('.area-image')).toHaveCSS('filter', 'grayscale(1)');
    for (const color of await colors.all()) await expect(color).toHaveCSS('opacity', '0');

    const capabilities = chapter.getByRole('list', { name: 'What ngx-formly can do' }).getByRole('button');
    for (let index = 0; index < 3; index++) {
      const capability = capabilities.nth(index);
      if (isMobile) await capability.tap();
      else await capability.hover();
      for (let region = 0; region < 3; region++) {
        await expect(colors.nth(region)).toHaveCSS('opacity', region === index ? '1' : '0');
      }
    }

    if (!isMobile) {
      await chapter.getByRole('heading', { level: 3 }).hover();
      for (const color of await colors.all()) await expect(color).toHaveCSS('opacity', '0');
      await capabilities.first().focus();
      await expect(colors.first()).toHaveCSS('opacity', '1');
      await page.keyboard.press('Tab');
      await expect(capabilities.nth(1)).toBeFocused();
      await expect(colors.first()).toHaveCSS('opacity', '0');
      await expect(colors.nth(1)).toHaveCSS('opacity', '1');
      await capabilities.last().hover();
      await expect(colors.nth(1)).toHaveCSS('opacity', '0');
      await expect(colors.last()).toHaveCSS('opacity', '1');
      await chapter.getByRole('heading', { level: 3 }).hover();
      await expect(colors.nth(1)).toHaveCSS('opacity', '1');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      for (const color of await colors.all()) await expect(color).toHaveCSS('opacity', '0');
    }
  }
});

test('Q&A shows the audience question and resource links', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#chapter-11');
  const content = page.locator('#chapter-11 app-closing-chapter');
  await expect(content.getByText('And you?', { exact: true })).toHaveCount(0);
  await expect(content.getByText('Is it missing something?', { exact: true })).toBeVisible();
  await expect(content.getByRole('button')).toHaveCount(0);
  await expect(content.getByRole('link', { name: 'builder.formly.dev', exact: true })).toHaveAttribute('href', 'https://builder.formly.dev/');
});

import { expect, test } from '@playwright/test';

test('PeriScope pairs each area with three Formly capabilities and a bundled illustration', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#chapter-07');
  const chapter = page.locator('#chapter-07');
  const areas = [
    { name: 'Events', image: 'events', title: 'Register participants', first: 'Configure registration fields for each event.' },
    { name: 'Workflows', image: 'workflows', title: 'Move a request forward', first: 'Define a form for each workflow step.' },
    { name: 'Surveys', image: 'surveys', title: 'Collect and review responses', first: 'Build questionnaires with custom components.' },
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
  await expect(chapter.getByRole('link', { name: 'Open PeriScope' })).toHaveAttribute('href', 'https://int.periscope.bit.admin.ch');
  for (const language of [
    { code: 'de', label: 'Was ngx-formly ermöglicht', first: 'Fragebögen mit benutzerdefinierten Komponenten erstellen.' },
    { code: 'fr', label: 'Ce que permet ngx-formly', first: 'Créer des questionnaires avec des composants personnalisés.' },
  ]) {
    await page.locator('header .language-select').selectOption(language.code);
    const capabilities = chapter.getByRole('list', { name: language.label }).getByRole('listitem');
    await expect(capabilities).toHaveCount(3);
    await expect(capabilities.first()).toHaveText(language.first);
  }
});

test('PeriScope reveals only the illustration region for the hovered, focused, or tapped capability', async ({ page, isMobile }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#chapter-07');
  const chapter = page.locator('#chapter-07');
  const colors = chapter.locator('.area-color');

  for (const { area, accent } of [
    { area: 'Events', accent: 'rgb(185, 46, 54)' },
    { area: 'Workflows', accent: 'rgb(36, 93, 166)' },
    { area: 'Surveys', accent: 'rgb(79, 107, 82)' },
  ]) {
    await chapter.getByRole('button', { name: area, exact: true }).click();
    await expect(chapter.locator('.area-image')).toHaveCSS('filter', 'grayscale(1)');
    for (const color of await colors.all()) await expect(color).toHaveCSS('opacity', '0');

    const capabilities = chapter.getByRole('list', { name: 'What ngx-formly can do' }).getByRole('button');
    for (let index = 0; index < 3; index++) {
      const capability = capabilities.nth(index);
      const keyword = capability.locator('strong').first();
      await expect(keyword).toHaveCSS('font-weight', '700');
      if (isMobile) await capability.tap();
      else await capability.hover();
      await expect(capability).toHaveCSS('color', accent);
      await expect(keyword).toHaveCSS('font-weight', '700');
      await expect(capability).toHaveCSS('font-weight', '400');
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
  const question = content.getByText('Will you use it, or are we missing something?', { exact: true });
  await expect(question).toBeVisible();
  await expect(question).toHaveText(/Will you use it,\nor are we missing something\?/);
  await expect(question).toHaveCSS('white-space', 'pre-line');
  await expect(content.getByRole('button')).toHaveCount(0);
  await expect(content.getByRole('link', { name: 'builder.formly.dev', exact: true })).toHaveAttribute('href', 'https://builder.formly.dev/');
});

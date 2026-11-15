import { expect, test } from '@playwright/test';

const languages = [
  { code: 'de', title: 'Warum bauen wir immer wieder dieselben Formulare?', chapters: 'Kapitelübersicht', about: 'Über mich', next: 'Wie geht es weiter?', theme: 'Dunkler Modus', timer: 'Präsentationszeit' },
  { code: 'fr', title: 'Pourquoi recréons-nous toujours les mêmes formulaires ?', chapters: 'Sommaire', about: 'À propos de moi', next: 'Et ensuite ?', theme: 'Mode sombre', timer: 'Durée de la présentation' },
  { code: 'en', title: 'Why are we still rebuilding the same forms?', chapters: 'Chapter index', about: 'About me', next: "What's next", theme: 'Dark mode', timer: 'Presentation time' },
];

test('language switching translates content and accessibility labels, preserves state and survives reloads', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await page.getByRole('link', { name: 'Start with chapter 01' }).click();
  const started = await page.evaluate(() => localStorage.getItem('ngx-presentation-started-at'));
  await page.goto('/#chapter-02-continued');
  await page.getByRole('button', { name: 'Show solution: Repeated work' }).click();
  const selector = page.locator('.language-select');
  for (const language of languages) {
    await selector.selectOption(language.code);
    await expect(page.locator('html')).toHaveAttribute('lang', language.code);
    await expect(page).toHaveTitle(`${language.title} | ngx-formly`);
    await expect(page.locator('h1')).toHaveText(language.title);
    await expect(page.getByRole('navigation', { name: language.chapters, exact: true }).getByRole('link')).toHaveCount(11);
    await expect(page.locator('#title-01')).toContainText(language.about);
    await expect(page.locator('#title-12')).toContainText(language.next);
    await expect(page.getByRole('button', { name: language.theme })).toBeVisible();
    await expect(page.getByRole('progressbar', { name: language.timer })).toHaveCount(1);
    await expect(page.locator('.problem-solution .problem-answer')).toHaveText('Core · MCP · Builder');
    await expect(page).toHaveURL(/#chapter-02-continued$/);
    expect(await page.evaluate(() => localStorage.getItem('ngx-presentation-started-at'))).toBe(started);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.locator('#chapter-12').evaluate(element => element.scrollIntoView());
    await expect(page.locator('#title-12')).toBeInViewport();
    await page.locator('#chapter-02-continued').evaluate(element => element.scrollIntoView());
  }
  await selector.selectOption('fr');
  await page.reload();
  await expect(selector).toHaveValue('fr');
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  await expect(page.locator('.problem-repetition')).toContainText('Le travail se répète.');
  expect(errors).toEqual([]);
});

test('English is the default regardless of browser locale or an unsupported saved language', async ({ browser }) => {
  const context = await browser.newContext({ locale: 'de-CH' });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await page.evaluate(() => localStorage.setItem('ngx-presentation-language', 'es'));
  await page.reload();
  await expect(page.locator('.language-select')).toHaveValue('en');
  await expect(page.locator('h1')).toHaveText(languages[2].title);
  await context.close();
});

test('language switching works without local storage', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(window, 'localStorage', {
    get() { throw new DOMException('Storage blocked', 'SecurityError'); },
  }));
  await page.goto('/');
  await page.getByRole('combobox', { name: 'Language' }).selectOption('de');
  await expect(page.getByRole('combobox', { name: 'Sprache' })).toHaveValue('de');
  await expect(page.locator('h1')).toHaveText(languages[0].title);
});

test('unknown paths show the translated not-found page', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('combobox', { name: 'Language' }).selectOption('fr');
  await page.goto('/missing');
  await expect(page.getByRole('heading', { name: 'Page introuvable' })).toBeVisible();
  await page.getByRole('link', { name: 'Ouvrir la présentation' }).click();
  await expect(page.locator('h1')).toHaveText(languages[1].title);
});

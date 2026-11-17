import { expect, test } from '@playwright/test';

const command = 'npx skills add ngx-formly/ngx-formly --skill ngx-formly';

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?selected=skill#chapter-04');
});

test('copies the install command with a translated, keyboard-accessible icon button', async ({ page, context }, testInfo) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const detail = page.locator('#capability-detail');
  for (const theme of ['dark', 'light']) {
    await page.evaluate(theme => document.documentElement.dataset.theme = theme, theme);
    await expect(detail.getByRole('button', { name: 'Copy install command', exact: true })).toBeVisible();
    await detail.screenshot({ path: testInfo.outputPath(`install-command-${theme}.png`) });
  }
  for (const [language, label, confirmation] of [
    ['en', 'Copy install command', 'Copied.'],
    ['fr', 'Copier la commande d’installation', 'Copié.'],
    ['de', 'Installationsbefehl kopieren', 'Kopiert.'],
  ]) {
    await page.locator('header .language-select').selectOption(language);
    const button = detail.getByRole('button', { name: label, exact: true });
    await expect(button).toHaveAttribute('title', label);
    await expect(button).toHaveText('');
    await button.press('Enter');
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(command);
    await expect(detail.locator('.install-status')).toHaveText(confirmation);
    await expect(detail.locator('.demo-actions').getByRole('status')).toBeEmpty();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await detail.getByRole('button', { name: 'Prompt kopieren', exact: true }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(await detail.locator('.prompt-text').innerText());
  await expect(detail.locator('.demo-actions').getByRole('status')).toHaveText('Kopiert.');
  await page.locator('#chapter-04').getByRole('button', { name: 'MCP', exact: true }).click();
  await page.locator('#chapter-04').getByRole('button', { name: 'Skill', exact: true }).click();
  await expect(detail.locator('.install-status')).toBeEmpty();
});

test('keeps the command available when clipboard access fails', async ({ page }) => {
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText: async () => { throw new Error('Clipboard access denied'); } },
  }));
  const detail = page.locator('#capability-detail');
  await detail.getByRole('button', { name: 'Copy install command', exact: true }).click();
  await expect(detail.locator('.install-status')).toHaveText('Copy unavailable. Select and copy the command above.');
  await expect(detail.locator('.install-command code')).toHaveText(command);
  await expect(detail.locator('.demo-actions').getByRole('status')).toBeEmpty();
});

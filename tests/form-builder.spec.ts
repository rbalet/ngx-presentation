import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#chapter-06');
});

test('the packed builder edits, reorders, removes and exports real Formly fields', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  const chapter = page.locator('#chapter-06');
  const fields = chapter.locator('.field-list button');
  const preview = chapter.getByRole('region', { name: 'Live preview' });
  const label = chapter.getByRole('textbox', { name: 'Label', exact: true });
  await expect(fields).toHaveCount(4);
  const openBuilder = chapter.getByRole('link', { name: 'Open Builder', exact: true });
  await expect(openBuilder).toHaveAttribute('href', 'https://builder.formly.dev/');
  await expect(openBuilder).toHaveAttribute('target', '_blank');
  await expect(openBuilder.locator('svg')).toBeVisible();
  await expect(chapter.getByRole('button', { name: 'Move up', exact: true })).toBeDisabled();
  await preview.getByRole('textbox', { name: 'Full name' }).fill('Ada Lovelace');
  await label.fill('Participant name');
  await expect(preview.getByRole('textbox', { name: 'Participant name' })).toHaveValue('Ada Lovelace');
  await chapter.getByRole('checkbox', { name: 'Required', exact: true }).uncheck();
  await expect(preview.getByRole('textbox', { name: 'Participant name' })).not.toHaveAttribute('required');
  await chapter.getByRole('button', { name: 'Move down', exact: true }).click();
  await expect(fields.nth(1)).toContainText('Participant name');
  await chapter.getByRole('button', { name: 'Move up', exact: true }).click();
  await expect(fields.first()).toContainText('Participant name');

  await chapter.getByRole('button', { name: 'Add text', exact: true }).click();
  await label.fill('Company');
  await chapter.getByRole('checkbox', { name: 'Required', exact: true }).check();
  await expect(chapter.getByRole('button', { name: 'Move down', exact: true })).toBeDisabled();
  await chapter.getByRole('button', { name: 'Check validation', exact: true }).click();
  await expect(preview.getByRole('textbox', { name: 'Company' })).toHaveAttribute('aria-invalid', 'true');
  await preview.getByRole('textbox', { name: 'Company' }).fill('Example AG');
  await expect(preview.getByRole('textbox', { name: 'Company' })).toHaveAttribute('aria-invalid', 'false');
  const downloadPromise = page.waitForEvent('download');
  await chapter.getByRole('button', { name: 'Download JSON', exact: true }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('registration.fields.json');
  const source = await readFile((await download.path())!, 'utf8');
  const exported = JSON.parse(source);
  expect(exported).toHaveLength(5);
  expect(exported[4]).toMatchObject({ type: 'input', props: { label: 'Company', required: true } });
  expect(exported[4].key).toBeTruthy();
  expect(source).not.toContain('_info');
  expect(source).not.toContain('formControl');
  expect(exported.find((field: { key: string }) => field.key === 'dietary').expressions.hide).toBe("model.attendance !== 'onsite'");
  await chapter.getByRole('button', { name: 'Remove', exact: true }).click();
  await expect(fields).toHaveCount(4);
  await expect(preview.getByRole('textbox', { name: 'Company' })).toHaveCount(0);

  await preview.getByRole('combobox', { name: 'Attendance' }).selectOption('remote');
  await expect(preview.getByRole('textbox', { name: 'Dietary requirements' })).toHaveCount(0);
  await preview.getByRole('combobox', { name: 'Attendance' }).selectOption('onsite');
  await expect(preview.getByRole('textbox', { name: 'Dietary requirements' })).toBeVisible();
  await chapter.getByRole('button', { name: 'Reset builder', exact: true }).click();
  await expect(preview.getByRole('textbox', { name: 'Full name' })).toHaveValue('');
  await expect(label).toHaveValue('Full name');
  await expect(chapter.getByRole('checkbox', { name: 'Required', exact: true })).toBeChecked();
  expect(errors).toEqual([]);
});

test('the builder supports empty forms and all three field types without persisting edits', async ({ page }) => {
  const chapter = page.locator('#chapter-06');
  for (let index = 0; index < 4; index++) await chapter.getByRole('button', { name: 'Remove', exact: true }).click();
  await expect(chapter.locator('.field-list button')).toHaveCount(0);
  await expect(chapter.getByText('Select a field to edit it.')).toBeVisible();
  await chapter.getByRole('button', { name: 'Add long text', exact: true }).click();
  await expect(chapter.locator('.builder-preview textarea')).toBeVisible();
  await chapter.getByRole('button', { name: 'Add choice', exact: true }).click();
  await expect(chapter.locator('.builder-preview select')).toHaveCount(1);
  await chapter.locator('.builder-preview select').selectOption('second');
  await chapter.getByRole('button', { name: 'Add text', exact: true }).click();
  await expect(chapter.locator('.builder-preview input')).toHaveCount(1);
  expect(await page.evaluate(() => Object.keys(localStorage).filter(key => /form-editor|presentation.*forms/.test(key)))).toEqual([]);
  await page.reload();
  await expect(chapter.locator('.field-list button')).toHaveCount(4);
});

test('builder controls translate, preserve edits and work in both themes', async ({ page }, testInfo) => {
  const chapter = page.locator('#chapter-06');
  await chapter.getByRole('textbox', { name: 'Label', exact: true }).fill('Keep my label');
  for (const language of [
    { code: 'fr', label: 'Libellé', reset: 'Réinitialiser le builder', download: 'Télécharger le JSON', open: 'Ouvrir le builder' },
    { code: 'de', label: 'Beschriftung', reset: 'Builder zurücksetzen', download: 'JSON herunterladen', open: 'Builder öffnen' },
    { code: 'en', label: 'Label', reset: 'Reset builder', download: 'Download JSON', open: 'Open Builder' },
  ]) {
    await page.locator('header .language-select').selectOption(language.code);
    await expect(chapter.getByRole('textbox', { name: language.label, exact: true })).toHaveValue('Keep my label');
    await expect(chapter.getByRole('button', { name: language.reset, exact: true })).toBeVisible();
    await expect(chapter.getByRole('button', { name: language.download, exact: true })).toBeVisible();
    await expect(chapter.getByRole('link', { name: language.open, exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  const input = chapter.getByRole('textbox', { name: 'Label', exact: true });
  await input.press('ArrowRight');
  await expect(page).toHaveURL(/#chapter-06$/);
  await chapter.getByRole('button', { name: 'Reset builder', exact: true }).click();
  await chapter.evaluate(element => element.scrollIntoView({ block: 'start' }));
  await page.screenshot({ path: testInfo.outputPath('builder-light.png'), scale: 'css' });
  await chapter.locator('.builder-footer').screenshot({ path: testInfo.outputPath('builder-footer-light.png'), scale: 'css' });
  const lightBackground = await input.evaluate(element => getComputedStyle(element).backgroundColor);
  await page.getByRole('button', { name: 'Dark mode' }).click();
  await expect(input).not.toHaveCSS('background-color', lightBackground);
  await chapter.evaluate(element => element.scrollIntoView({ block: 'start' }));
  await page.screenshot({ path: testInfo.outputPath('builder-dark.png'), scale: 'css' });
  await chapter.locator('.builder-footer').screenshot({ path: testInfo.outputPath('builder-footer-dark.png'), scale: 'css' });
  await chapter.locator('.builder-preview').evaluate(element => element.scrollIntoView({ block: 'start' }));
  await page.screenshot({ path: testInfo.outputPath('builder-preview.png'), scale: 'css' });
});

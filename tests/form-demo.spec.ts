import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

test('intro code supports highlighting, folding and keyboard editing without navigating slides', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/#chapter-03');
  const intro = page.locator('#chapter-03');
  await expect(intro.locator('.intro-code summary')).toHaveCount(4);
  await expect(intro.locator('.intro-code details[open] > summary')).toHaveText('Bind the fields and model to Angular');
  await expect(intro.locator('.intro-code app-code-editor:visible')).toHaveCount(1);
  await intro.getByText('Full name field configuration', { exact: true }).press('Enter');
  const editor = intro.getByRole('textbox', { name: 'Full name field configuration', exact: true });
  await expect(editor).toHaveAttribute('contenteditable', 'true');
  await expect(editor).toHaveAccessibleDescription('Edit label, required, minLength or maxLength. Set the value in model.name.');
  await expect(intro.locator('.configuration-editor .cm-lineNumbers')).toContainText('1');
  const property = editor.locator('span').filter({ hasText: /^"key"$/ });
  const string = editor.locator('span').filter({ hasText: /^"name"$/ });
  await expect(property).toHaveCSS('color', 'rgb(156, 220, 254)');
  await expect(string).toHaveCSS('color', 'rgb(233, 185, 152)');
  await intro.locator('.demo-workbench').screenshot({ path: testInfo.outputPath('editor.png') });

  const original = await editor.innerText();
  await editor.fill('{');
  await expect(editor).toHaveAttribute('aria-invalid', 'true');
  await editor.press('ControlOrMeta+z');
  await expect.poll(() => editor.innerText()).toBe(original);
  await expect(editor).toHaveAttribute('aria-invalid', 'false');
  for (const key of ['ArrowDown', 'ArrowRight', 'PageDown']) {
    await editor.press(key);
    await expect(page).toHaveURL(/#chapter-03$/);
  }
  await editor.press('Tab');
  await expect(editor).not.toBeFocused();
  await intro.locator('.configuration-editor .cm-foldGutter [title="Fold line"]').first().click();
  await expect(intro.locator('.configuration-editor .cm-foldPlaceholder')).toBeVisible();
  await intro.locator('.configuration-editor .cm-foldPlaceholder').click();
  await expect.poll(() => editor.innerText()).toBe(original);

  const template = intro.getByRole('textbox', { name: 'Bind the fields and model to Angular', exact: true });
  await expect(template).toHaveAttribute('aria-readonly', 'true');
  const source = await template.innerText();
  await template.press('x');
  await expect.poll(() => template.innerText()).toBe(source);
  await expect(template.locator('span').filter({ hasText: /^formly-form$/ })).toHaveCSS('color', 'rgb(131, 214, 197)');
  await intro.getByText('Custom error messages with ngx-translate', { exact: true }).click();
  for (const theme of ['dark', 'light']) {
    await page.evaluate(theme => document.documentElement.dataset.theme = theme, theme);
    await expect(property).toHaveCSS('color', 'rgb(156, 220, 254)');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await intro.locator('.demo-workbench').screenshot({ path: testInfo.outputPath(`editor-${theme}.png`) });
  }
  expect(errors).toEqual([]);
});

test('the first code example checkmark toggles the maintenance status', async ({ page }) => {
  await page.goto('/#chapter-03');
  const intro = page.locator('#chapter-03');
  const checkmark = intro.getByRole('button', { name: 'Mark ongoing maintenance as addressed' });
  const maintenance = page.locator('.chapter-challenges .form-example-challenge').filter({ hasText: 'Ongoing maintenance' });
  const wrench = maintenance.locator('svg').first();
  const badgeCheck = maintenance.locator('.form-example-challenge-check');
  await expect(checkmark).toHaveAttribute('aria-pressed', 'false');
  await expect(badgeCheck).toHaveCount(0);
  await expect(wrench).toHaveCSS('rotate', 'none');

  await checkmark.press('Space');
  await expect(checkmark).toHaveAttribute('aria-pressed', 'true');
  await expect(checkmark).toHaveCSS('color', 'rgb(167, 201, 171)');
  await expect(maintenance).toHaveCSS('border-top-color', 'rgb(79, 107, 82)');
  await expect(wrench).toHaveCSS('color', 'rgb(79, 107, 82)');
  await expect(wrench).toHaveCSS('rotate', '8deg');
  await expect(badgeCheck).toBeVisible();
  await expect(maintenance.getByText('Completed', { exact: true })).toBeAttached();
  await expect(intro.locator('.intro-code details[open]')).toHaveCount(1);

  await checkmark.click();
  await expect(checkmark).toHaveAttribute('aria-pressed', 'false');
  await expect(badgeCheck).toHaveCount(0);
  await expect(wrench).toHaveCSS('rotate', 'none');
});

test('the name configuration checkmark toggles the Complexity card independently', async ({ page }) => {
  await page.goto('/#chapter-03');
  const intro = page.locator('#chapter-03');
  const checkmark = intro.getByRole('button', { name: 'Mark complexity as addressed' });
  const maintenance = intro.getByRole('button', { name: 'Mark ongoing maintenance as addressed' });
  const complexity = page.locator('.chapter-challenges .form-example-challenge').filter({ hasText: 'Complexity' });
  const icon = complexity.locator('svg path');
  const example = intro.locator('details').filter({ hasText: 'Full name field configuration' });

  await expect(checkmark).toHaveAttribute('aria-pressed', 'false');
  const unresolvedIcon = (await icon.getAttribute('d'))!;
  await checkmark.press('Space');
  await expect(checkmark).toHaveAttribute('aria-pressed', 'true');
  await expect(complexity).toHaveClass(/form-example-challenge--resolved/);
  await expect(icon).not.toHaveAttribute('d', unresolvedIcon);
  await expect(maintenance).toHaveAttribute('aria-pressed', 'false');
  await expect(example).toHaveJSProperty('open', false);

  await example.locator('summary').click();
  await checkmark.click();
  await expect(checkmark).toHaveAttribute('aria-pressed', 'false');
  await expect(complexity).not.toHaveClass(/form-example-challenge--resolved/);
  await expect(icon).toHaveAttribute('d', unresolvedIcon);
  await expect(example).toHaveJSProperty('open', true);
});

test('the intro edits the name configuration and keeps its model value in sync', async ({ page }) => {
  await page.goto('/#chapter-03');
  const intro = page.locator('#chapter-03');
  await intro.getByText('Full name field configuration', { exact: true }).click();
  const editor = intro.getByRole('textbox', { name: 'Full name field configuration', exact: true });
  const value = intro.getByLabel('model.name', { exact: true });
  await expect(intro.locator('.preview-sheet').getByLabel('model.name', { exact: true })).toBeVisible();
  await expect(intro.locator('.demo-explanation .model-example')).toHaveCount(0);
  await expect(intro.locator('.model-details summary')).toHaveCount(0);
  const field = JSON.parse(await editor.innerText());
  expect(field.key).toBe('name');
  await intro.getByRole('textbox', { name: /^Email/ }).fill('jamie@example.test');
  await value.fill('Jamie Example');
  await expect(intro.getByRole('textbox', { name: 'Full name', exact: true })).toHaveValue('Jamie Example');

  field.props = { label: 'Participant name', required: false, minLength: 3, maxLength: 40 };
  const draft = JSON.stringify(field, null, 4);
  await editor.fill(draft);
  await expect.poll(() => editor.innerText()).toBe(draft);
  const name = intro.getByRole('textbox', { name: 'Participant name', exact: true });
  await expect(name).toHaveValue('Jamie Example');
  await expect(name).not.toHaveAttribute('required');
  await expect(name).toHaveAttribute('maxlength', '40');
  await name.fill('Taylor Example');
  await expect(value).toHaveValue('Taylor Example');
  await expect(intro.getByRole('textbox', { name: /^Email/ })).toHaveValue('jamie@example.test');

  await page.locator('header .language-select').selectOption('fr');
  await expect(intro.getByRole('textbox', { name: 'Configuration du champ Nom complet', exact: true })).toBeVisible();
  await expect(value).toHaveValue('Taylor Example');
  await expect(name).toHaveValue('Taylor Example');
  await page.locator('header .language-select').selectOption('en');
  const builder = page.locator('#chapter-05');
  await builder.scrollIntoViewIfNeeded();
  await expect(builder.getByRole('textbox', { name: 'Fields JSON', exact: true })).toContainText('Participant name');
  await editor.fill('{');
  await builder.getByRole('button', { name: 'Reset the demo' }).click();
  await expect(editor).toHaveAttribute('aria-invalid', 'false');
  await expect.poll(() => editor.innerText()).toBe(JSON.stringify({
    key: 'name', type: 'input',
    props: { label: 'Full name', required: true, minLength: 3, maxLength: 80 },
    validation: { messages: { minLength: 'demo.errors.nameMinLength' } },
  }, null, 2));
  await expect(value).toHaveValue('');
  await expect(intro.getByRole('textbox', { name: 'Full name', exact: true })).toHaveValue('');
});

test('invalid intro configuration preserves the draft and the last working field', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/#chapter-03');
  const intro = page.locator('#chapter-03');
  await intro.getByText('Full name field configuration', { exact: true }).click();
  const editor = intro.getByRole('textbox', { name: 'Full name field configuration', exact: true });
  const original = await editor.innerText();
  const field = JSON.parse(original);
  const name = intro.getByRole('textbox', { name: 'Full name', exact: true });
  await name.fill('Keep this name');
  const invalidDrafts = [
    '{ "key":', 'null', '[]',
    JSON.stringify({ ...field, key: 'email' }),
    JSON.stringify({ ...field, type: 'unknown' }),
    JSON.stringify({ ...field, props: { ...field.props, required: 'false' } }),
    JSON.stringify({ ...field, props: { ...field.props, maxLength: -1 } }),
    JSON.stringify({ ...field, props: { ...field.props, maxLength: 2 ** 32 } }),
    JSON.stringify({ ...field, props: { ...field.props, minLength: -1 } }),
    JSON.stringify({ ...field, props: { ...field.props, minLength: 1.5 } }),
    JSON.stringify({ ...field, props: { ...field.props, minLength: '3' } }),
    JSON.stringify({ ...field, props: { ...field.props, minLength: 81 } }),
    JSON.stringify({ ...field, props: { ...field.props, label: '' } }),
    JSON.stringify({ ...field, validation: null }),
    JSON.stringify({ ...field, validation: { messages: { minLength: '' } } }),
    JSON.stringify({ ...field, validation: { messages: { minLength: 3 } } }),
    JSON.stringify({ ...field, validation: { ...field.validation, show: true } }),
    JSON.stringify({ ...field, expressions: { hide: 'true' } }),
  ];
  for (const draft of invalidDrafts) {
    await editor.fill(draft);
    await expect.poll(() => editor.innerText()).toBe(draft);
    await expect(editor).toHaveAttribute('aria-invalid', 'true');
    await expect(intro.getByRole('alert')).toContainText('Use valid JSON');
    await expect(name).toHaveValue('Keep this name');
    await expect(name).toHaveAttribute('required');
  }
  await editor.fill(original);
  await expect(editor).toHaveAttribute('aria-invalid', 'false');
  await expect(intro.getByRole('alert')).toHaveCount(0);
  await intro.getByLabel('model.name', { exact: true }).fill('');
  await expect(name).toHaveValue('');
  await expect(name).toHaveAttribute('aria-invalid', 'true');
  expect(errors).toEqual([]);
});

test('custom length errors follow the edited rule and language without losing the model', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/#chapter-03');
  const intro = page.locator('#chapter-03');
  const name = intro.getByRole('textbox', { name: 'Full name', exact: true });
  await expect(name).toHaveAttribute('minlength', '3');
  await name.fill('Al');
  await name.press('Tab');
  await expect(name).toHaveAccessibleDescription('Your name needs at least 3 characters. You entered 2.');

  await intro.getByText('Full name field configuration', { exact: true }).click();
  const editor = intro.getByRole('textbox', { name: 'Full name field configuration', exact: true });
  const field = JSON.parse(await editor.innerText());
  field.props.minLength = 5;
  await editor.fill(JSON.stringify(field, null, 2));
  await expect(name).toHaveAttribute('minlength', '5');
  await expect(name).toHaveValue('Al');
  await expect(name).toHaveAccessibleDescription('Your name needs at least 5 characters. You entered 2.');

  await intro.getByText('Custom error messages with ngx-translate', { exact: true }).click();
  await expect(intro.locator('.translation-example')).toContainText('formControl.getError(error.error)');
  for (const [language, label, message] of [
    ['fr', 'Nom complet', 'Votre nom doit contenir au moins 5 caractères. Vous en avez saisi 2.'],
    ['de', 'Vollständiger Name', 'Ihr Name muss mindestens 5 Zeichen lang sein. Sie haben 2 eingegeben.'],
    ['en', 'Full name', 'Your name needs at least 5 characters. You entered 2.'],
  ]) {
    await intro.locator('.preview-heading .language-select').selectOption(language);
    await expect(page.locator('header .language-select')).toHaveValue(language);
    const translatedName = intro.getByRole('textbox', { name: label, exact: true });
    await expect(translatedName).toHaveValue('Al');
    await expect(translatedName).toHaveAccessibleDescription(message);
    await expect(intro.locator('.translation-example')).toContainText(`src/i18n/${language}.json`);
    await expect(intro.locator('.translation-example')).toContainText('{{requiredLength}}');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await name.fill('Alex');
  await expect(name).toHaveAccessibleDescription('Your name needs at least 5 characters. You entered 4.');
  await name.fill('Alexa');
  await expect(name).toHaveAttribute('aria-invalid', 'false');
  await expect(name).not.toHaveAttribute('aria-describedby');
  await name.fill('');
  await expect(name).toHaveAccessibleDescription('Complete this required field.');
  expect(errors).toEqual([]);
});

test('the validator loads chapter 03 configuration and formats the edited JSON', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/#chapter-03');
  const intro = page.locator('#chapter-03');
  await intro.getByRole('textbox', { name: 'Full name', exact: true }).fill('Jamie Example');
  await intro.getByLabel('Dietary requirements').fill('Vegetarian');
  await intro.getByLabel('Attendance').selectOption('remote');
  await expect(intro.getByLabel('Dietary requirements')).toHaveCount(0);
  await expect(intro.locator('.model-details').getByLabel('model.name', { exact: true })).toHaveValue('Jamie Example');
  await expect(intro.locator('.model-details')).toContainText('attendance: "remote"');
  await expect(intro.locator('.model-details')).not.toContainText('Vegetarian');

  await page.locator('#chapter-05').scrollIntoViewIfNeeded();
  const builder = page.locator('#chapter-05');
  const editor = builder.getByRole('textbox', { name: 'Fields JSON', exact: true });
  await expect(builder.getByRole('button', { name: 'Load example', exact: true })).toHaveCount(0);
  await expect(builder.getByRole('status')).toHaveText('No structural errors found.');
  await expect(editor).toContainText('"label": "Full name"');
  await expect(editor).toContainText('"minLength": "demo.errors.nameMinLength"');
  const footer = builder.locator('.editor-panel .validator-footer');
  await expect(footer.getByRole('link', { name: 'formly.dev/tools/validator' })).toHaveAttribute('href', 'https://formly.dev/tools/validator');
  await expect(builder.getByText('Checked in your browser. Nothing is uploaded or saved.')).toHaveCount(0);
  const draft = [{ key: 'name', props: { label: 'Participant name', required: false } }];
  await editor.fill(JSON.stringify(draft));
  await builder.getByRole('button', { name: 'Format JSON', exact: true }).click();
  await expect.poll(() => editor.innerText()).toBe(JSON.stringify(draft, null, 2));
  await footer.getByRole('button', { name: 'Reset the demo' }).click();
  await expect(editor).toContainText('Full name');
  await expect(intro.getByRole('textbox', { name: 'Full name', exact: true })).toHaveValue('');
  await expect(intro.getByLabel('Dietary requirements')).toBeVisible();
  await expect(intro.locator('formly-form').getByRole('textbox')).toHaveCount(3);
  expect(JSON.parse(await editor.innerText()).map((field: { key: string }) => field.key)).toEqual([
    'name', 'email', 'attendance', 'dietary',
  ]);
  expect(errors).toEqual([]);
});

test('the validator reports syntax and nested configuration errors without running the draft', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/#chapter-05');
  const builder = page.locator('#chapter-05');
  const editor = builder.getByRole('textbox', { name: 'Fields JSON', exact: true });
  await editor.fill('');
  await expect(builder.getByRole('status')).toHaveText('Paste your fields to begin.');
  for (const draft of ['{', '[{"key":"name",}]', '[/* comment */]', 'null']) {
    await editor.fill(draft);
    await expect(editor).toHaveAttribute('aria-invalid', 'true');
  }
  await editor.fill('[\n  {"fieldGroup": [{"props": {"required": "yes"}}]}\n]');
  await expect(builder.getByRole('status')).toContainText('Errors found: 1');
  const diagnostic = builder.getByRole('button', { name: /Expected boolean or null; received string/ });
  await expect(diagnostic).toContainText('$[0].fieldGroup[0].props.required');
  await expect(diagnostic).toContainText('Line 2');
  await diagnostic.click();
  await expect(editor).toBeFocused();
  expect(await page.evaluate(() => getSelection()?.toString())).toBe('"yes"');
  await editor.fill('[{"key":"name","props":{"requried":true},"expressions":{"hide":"throw new Error(123)"}}]');
  await expect(builder.getByRole('status')).toContainText('Warnings: 1');
  await expect(builder.getByRole('button', { name: /Did you mean "required"/ })).toBeVisible();
  await editor.press('ArrowRight');
  await expect(page).toHaveURL(/#chapter-05$/);
  await builder.getByRole('button', { name: 'Reset the demo' }).click();
  await expect(editor).toHaveAttribute('aria-invalid', 'false');
  await expect(builder.getByRole('status')).toHaveText('No structural errors found.');
  expect(errors).toEqual([]);
});

test('the validator adapts to translations, themes and narrow screens', async ({ page }) => {
  await page.goto('/#chapter-05');
  const builder = page.locator('#chapter-05');
  const draft = '[{"key":"draft","props":{"label":"Keep my edits"}}]';
  await builder.getByRole('textbox', { name: 'Fields JSON', exact: true }).fill(draft);
  for (const language of [
    { code: 'fr', editor: 'Champs JSON', download: 'Télécharger', open: 'Ouvrir l’éditeur' },
    { code: 'de', editor: 'Felder als JSON', download: 'Herunterladen', open: 'Editor öffnen' },
    { code: 'en', editor: 'Fields JSON', download: 'Download', open: 'Open Editor' },
  ]) {
    await page.locator('header .language-select').selectOption(language.code);
    await expect(builder.getByRole('textbox', { name: language.editor, exact: true })).toBeVisible();
    await expect(builder.getByRole('textbox', { name: language.editor, exact: true })).toHaveText(draft);
    await expect(builder.getByRole('button', { name: language.download, exact: true })).toHaveCount(0);
    await expect(builder.getByRole('link', { name: language.open })).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  const editor = builder.getByRole('textbox', { name: 'Fields JSON', exact: true });
  const lightColor = await editor.evaluate(element => getComputedStyle(element).color);
  await page.getByRole('button', { name: 'Dark mode' }).click();
  await expect(editor).not.toHaveCSS('color', lightColor);
});

test('API and validation precedes the Make it yours builder', async ({ page }) => {
  await page.goto('/#chapter-06');
  const custom = page.locator('#chapter-06');
  const validation = page.locator('#chapter-05');
  const index = page.getByRole('navigation', { name: 'Chapter index', exact: true });
  await expect(index.locator('a[href="#chapter-05"] .index-title')).toHaveText('API & validation');
  await expect(index.locator('a[href="#chapter-06"] .index-title')).toHaveText('Make it yours');
  await expect(custom.getByRole('heading', { name: 'Live preview', exact: true })).toBeVisible();
  await custom.getByRole('link', { name: 'Previous: 05', exact: true }).click();
  await expect(page).toHaveURL(/#chapter-05$/);
  await expect(validation.getByRole('heading', { level: 2 })).toHaveText(/^05\s*API & validation\s*$/);
  await expect(validation.getByRole('textbox', { name: 'Fields JSON', exact: true })).toBeVisible();
  await validation.getByRole('link', { name: 'Next: 06', exact: true }).click();
  await expect(page).toHaveURL(/#chapter-06$/);
  await custom.getByRole('link', { name: 'Next: 07', exact: true }).click();
  await expect(page).toHaveURL(/#chapter-07$/);
});

test('capability cards start with Skill and explain each integration', async ({ page, isMobile }) => {
  await page.goto('/#chapter-04');
  const skill = page.locator('#chapter-04');
  const cards = skill.getByRole('group', { name: 'Explore Skill, MCP and WebMCP' }).getByRole('button');
  const detail = skill.locator('#capability-detail');
  await expect(cards.locator('strong')).toHaveText(['Skill', 'MCP', 'WebMCP']);
  await expect(cards.first()).toHaveAttribute('aria-pressed', 'true');
  await expect(detail.getByRole('heading', { name: 'Skill', exact: true })).toBeVisible();
  await cards.nth(1).click();
  await expect(detail.locator('.capability-page')).toHaveCount(1);
  await expect(detail.getByRole('heading', { name: 'MCP', exact: true })).toBeVisible();
  await expect(detail.locator('.capability-heading + pre')).toHaveCount(1);
  await expect(detail.locator('.capability-example')).toHaveText('https://formly.dev/mcp');
  const tools = detail.getByRole('listitem');
  await expect(tools).toHaveText(['formly_search', 'formly_lookup', 'formly_examples', 'formly_validate_fields']);
  await expect(tools.locator('svg + code')).toHaveCount(4);
  await expect(detail.getByRole('heading', { level: 4 })).toHaveCount(0);
  await expect(detail.locator('.capability-heading').getByRole('link', { name: 'Read the guide' })).toHaveAttribute('href', 'https://formly.dev/guide/mcp');
  await expect(skill.locator('.prompt-text')).toHaveCount(0);
  const cardBounds = (await skill.locator('.capability-cards').boundingBox())!;
  const detailBounds = (await detail.boundingBox())!;
  if (isMobile) {
    expect(detailBounds.y).toBeGreaterThan(cardBounds.y + cardBounds.height);
  } else {
    expect(detailBounds.x).toBeGreaterThan(cardBounds.x + cardBounds.width);
  }
  await cards.last().click();
  await expect(cards.first()).toHaveAttribute('aria-pressed', 'false');
  await expect(detail.getByRole('heading', { name: 'WebMCP', exact: true })).toBeVisible();
  await expect(detail.getByRole('textbox', { name: 'Phone number', exact: true })).toBeVisible();
  const example = detail.getByRole('textbox', { name: 'Field configuration with WebMCP enabled' });
  await expect(example).toHaveAttribute('aria-readonly', 'true');
  await expect(example).toContainText("key: 'phoneNumber'");
  await expect(example).toContainText("label: 'Phone number'");
  await expect(example).toContainText('webMcp: true');
  await expect(detail.getByRole('heading', { level: 4 })).toHaveCount(0);
  await expect(detail.getByRole('link', { name: 'Read the guide' })).toHaveAttribute('href', 'https://formly.dev/guide/web-mcp');
  await expect(skill.locator('.prompt-text')).toHaveCount(0);
  await cards.first().focus();
  await cards.first().press('Enter');
  await expect(cards.first()).toBeFocused();
  await expect(cards.first()).toHaveAttribute('aria-pressed', 'true');
  await expect(detail.getByRole('heading', { name: 'Skill', exact: true })).toBeVisible();
  await expect(detail.locator('.capability-page:not([inert]) > p')).toHaveCount(0);
  await expect(detail.getByRole('heading', { level: 4 })).toHaveText('Give the skill a real task');
  await expect(detail.getByRole('link', { name: 'Read the guide' })).toHaveAttribute('href', /skills\/ngx-formly\/SKILL.md$/);
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText: async (text: string) => { sessionStorage.setItem('copied-prompt', text); } },
  }));
  const prompt = await skill.locator('.prompt-text').innerText();
  expect(prompt).toBe("add a new input, named AI model, and add the model we're using as model default value");
  await skill.getByRole('button', { name: 'Copy prompt', exact: true }).click();
  await expect(skill.locator('.demo-actions').getByRole('status')).toHaveText('Copied.');
  expect(await page.evaluate(() => sessionStorage.getItem('copied-prompt'))).toBe(prompt);
  await cards.nth(1).press('Space');
  await expect(skill.locator('.prompt-text')).toHaveCount(0);
  await cards.first().click();
  await expect(skill.locator('.demo-actions').getByRole('status')).toBeEmpty();
  for (const language of ['fr', 'de', 'en']) {
    await page.locator('header .language-select').selectOption(language);
    await expect(skill.locator('.prompt-text')).toContainText('AI model');
    await expect(detail.getByRole('link')).toHaveAccessibleName(({ fr: 'Lire la documentation', de: 'Dokumentation lesen', en: 'Read the guide' } as Record<string, string>)[language]);
    await expect(detail.getByRole('link')).toHaveText('');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await skill.getByRole('link', { name: 'Next: 05', exact: true }).click();
  await expect(page).toHaveURL(/#chapter-05$/);
  await expect(page.locator('#chapter-05').getByRole('textbox', { name: 'Fields JSON', exact: true })).toBeVisible();
});

test('country dialog renders close icons instead of clipped text', async ({ page }, testInfo) => {
  await page.goto('/#chapter-04');
  await page.getByRole('button', { name: 'WebMCP', exact: true }).click();
  await page.getByRole('button', { name: 'Select country', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('textbox').fill('Switzerland');
  await page.evaluate(() => document.fonts.ready);

  for (const name of ['Close dialog', 'Clear search']) {
    const icon = dialog.getByRole('button', { name, exact: true }).locator('mat-icon');
    await expect(icon).toBeVisible();
    const fits = await icon.evaluate(element => {
      const range = document.createRange();
      range.selectNodeContents(element);
      return range.getBoundingClientRect().width <= element.getBoundingClientRect().width;
    });
    expect(fits, `${name} should render a single icon, not clipped text`).toBe(true);
  }
  await dialog.screenshot({ path: testInfo.outputPath('country-dialog.png') });
  await dialog.getByRole('button', { name: 'Clear search', exact: true }).click();
  await expect(dialog.getByRole('textbox')).toHaveValue('');
  await dialog.getByRole('button', { name: 'Close dialog', exact: true }).click();
  await expect(dialog).not.toBeVisible();
});

test('the phone example stays editable across capability and language changes', async ({ page }, testInfo) => {
  await page.goto('/#chapter-04');
  const skill = page.locator('#chapter-04');
  await skill.getByRole('button', { name: 'WebMCP', exact: true }).click();
  const phone = skill.getByRole('textbox', { name: 'Phone number', exact: true });
  await expect(phone).toHaveAttribute('type', 'tel');
  await expect(phone).toHaveAttribute('required');
  await phone.fill('+41 79 123 45 67');
  await expect(phone).toHaveValue('+41 79 123 45 67');
  await skill.locator('.skill-layout').screenshot({ path: testInfo.outputPath('phone-light.png') });
  await skill.getByRole('button', { name: 'MCP', exact: true }).click();
  await skill.getByRole('button', { name: 'WebMCP', exact: true }).click();
  await expect(phone).toHaveValue('+41 79 123 45 67');
  for (const [language, label] of [['fr', 'Numéro de téléphone'], ['de', 'Telefonnummer'], ['en', 'Phone number']]) {
    await page.locator('header .language-select').selectOption(language);
    await expect(skill.getByRole('textbox', { name: label, exact: true })).toHaveValue('+41 79 123 45 67');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await phone.fill('');
  await phone.blur();
  await expect(phone).toHaveAttribute('aria-invalid', 'true');
  await expect(skill.getByText('Complete this required field.', { exact: true })).toBeVisible();
  await phone.fill('+41 79 123 45 67');
  await page.getByRole('button', { name: 'Dark mode' }).click();
  await expect(phone).toHaveAttribute('aria-invalid', 'false');
  await skill.locator('.skill-layout').screenshot({ path: testInfo.outputPath('phone-dark.png') });
});

for (const reducedMotion of ['reduce', 'no-preference'] as const) {
  test(`capability details follow card order with ${reducedMotion} motion`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion });
    await page.goto('/#chapter-04');
    const cards = page.getByRole('group', { name: 'Explore Skill, MCP and WebMCP' });
    const detail = page.locator('#capability-detail');
    const panels = detail.locator('.capability-page');
    await expect(panels).toHaveCSS('animation-name', 'none');

    for (const [title, direction] of [['MCP', '1'], ['Skill', '-1'], ['MCP', '1']]) {
      await cards.getByRole('button', { name: title, exact: true }).press('Enter');
      expect(await panels.count()).toBe(1);
      await expect(detail).toHaveAccessibleName(title);
      await expect(detail).toHaveCSS('--slide-direction', direction);
      await expect(panels).toHaveCSS('animation-name', reducedMotion === 'no-preference' ? /capability-enter$/ : 'none');
    }
  });
}

test('the live form language switcher retains shared model keys and values', async ({ page }) => {
  await page.goto('/#chapter-03');
  const intro = page.locator('#chapter-03');
  await intro.getByRole('textbox', { name: 'Full name', exact: true }).fill('Jamie Example');
  const builder = page.locator('#chapter-05');
  await builder.scrollIntoViewIfNeeded();
  await expect(builder.getByRole('textbox', { name: 'Fields JSON', exact: true })).toBeVisible();
  await intro.getByRole('combobox', { name: 'Language', exact: true }).selectOption('fr');
  await expect(page.locator('header .language-select')).toHaveValue('fr');
  await expect(intro.getByRole('textbox', { name: 'Nom complet', exact: true })).toHaveValue('Jamie Example');
  const editor = builder.getByRole('textbox', { name: 'Champs JSON', exact: true });
  await expect(editor).toContainText('"key": "name"');
  await expect(editor).toContainText('Nom complet');
  await expect(editor).not.toContainText('Jamie Example');
  await page.locator('header .language-select').selectOption('de');
  await expect(intro.locator('.language-select')).toHaveValue('de');
  await expect(intro.getByRole('textbox', { name: 'Vollständiger Name', exact: true })).toHaveValue('Jamie Example');
  await page.reload();
  await expect(intro.locator('.language-select')).toHaveValue('de');
});

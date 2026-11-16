import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

test('the intro edits the name configuration and keeps its model value in sync', async ({ page }) => {
  await page.goto('/#chapter-03');
  const intro = page.locator('#chapter-03');
  const editor = intro.getByRole('textbox', { name: 'Full name field configuration', exact: true });
  const value = intro.getByLabel('model.name', { exact: true });
  await expect(intro.locator('.preview-sheet').getByLabel('model.name', { exact: true })).toBeVisible();
  await expect(intro.locator('.demo-explanation .model-example')).toHaveCount(0);
  await expect(intro.locator('.model-details summary')).toHaveCount(0);
  const field = JSON.parse(await editor.inputValue());
  expect(field.key).toBe('name');
  await intro.getByRole('textbox', { name: /^Email/ }).fill('jamie@example.test');
  await value.fill('Jamie Example');
  await expect(intro.getByRole('textbox', { name: 'Full name', exact: true })).toHaveValue('Jamie Example');

  field.props = { label: 'Participant name', required: false, minLength: 3, maxLength: 40 };
  const draft = JSON.stringify(field, null, 4);
  await editor.fill(draft);
  await expect(editor).toHaveValue(draft);
  const name = intro.getByRole('textbox', { name: 'Participant name', exact: true });
  await expect(name).toHaveValue('Jamie Example');
  await expect(name).not.toHaveAttribute('required');
  await expect(name).toHaveAttribute('maxlength', '40');
  await name.fill('Taylor Example');
  await expect(value).toHaveValue('Taylor Example');
  await expect(intro.getByRole('textbox', { name: /^Email/ })).toHaveValue('jamie@example.test');

  await page.locator('.language-select').selectOption('fr');
  await expect(intro.getByRole('textbox', { name: 'Configuration du champ Nom complet', exact: true })).toBeVisible();
  await expect(value).toHaveValue('Taylor Example');
  await expect(name).toHaveValue('Taylor Example');
  await page.locator('.language-select').selectOption('en');
  const builder = page.locator('#chapter-05');
  await expect(builder.getByRole('textbox', { name: 'Participant name', exact: true })).toHaveValue('Taylor Example');
  await editor.fill('{');
  await builder.getByRole('button', { name: 'Reset the demo' }).click();
  await expect(editor).toHaveAttribute('aria-invalid', 'false');
  await expect(editor).toHaveValue(JSON.stringify({
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
  const editor = intro.getByRole('textbox', { name: 'Full name field configuration', exact: true });
  const original = await editor.inputValue();
  const field = JSON.parse(original);
  const name = intro.getByRole('textbox', { name: 'Full name', exact: true });
  await name.fill('Keep this name');
  const invalidDrafts = [
    '{', 'null', '[]',
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
    await expect(editor).toHaveValue(draft);
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

  const editor = intro.getByRole('textbox', { name: 'Full name field configuration', exact: true });
  const field = JSON.parse(await editor.inputValue());
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
    await page.locator('.language-select').selectOption(language);
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

test('the shared form hides conditional data, edits fields and exports clean builder JSON', async ({ page }) => {
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
  await expect(builder.getByLabel('Full name')).toHaveValue('Jamie Example');
  await builder.getByLabel('Field label', { exact: true }).fill('Participant name');
  await builder.getByLabel('Field label', { exact: true }).press('Tab');
  await expect(builder.getByLabel('Participant name')).toHaveValue('Jamie Example');
  await builder.getByLabel('Required field', { exact: true }).uncheck();
  await expect(builder.getByLabel('Participant name')).not.toHaveAttribute('required');
  const downloadEvent = page.waitForEvent('download');
  await builder.getByRole('button', { name: 'Download JSON' }).click();
  const download = await downloadEvent;
  const fields = JSON.parse(await readFile((await download.path())!, 'utf8'));
  expect(fields).toHaveLength(4);
  expect(fields[0]).toMatchObject({ key: 'name', props: { label: 'Participant name', required: false } });
  expect(fields[0].validation.messages.minLength).toBe('demo.errors.nameMinLength');
  expect(fields[3].expressions.hide).toBe("model.attendance !== 'onsite'");
  expect(fields.some((field: object) => 'formControl' in field || 'model' in field || 'id' in field)).toBe(false);
  await expect(builder.getByRole('link', { name: 'Open Formly Studio' })).toHaveAttribute('href', 'https://builder.formly.dev/workspaces/forms');
  await builder.getByRole('button', { name: 'Reset the demo' }).click();
  await expect(builder.getByLabel('Full name')).toHaveValue('');
  await expect(builder.getByLabel('Dietary requirements')).toBeVisible();
  expect(errors).toEqual([]);
});

test('the local API simulation blocks invalid data and recovers from a field error', async ({ page }) => {
  await page.goto('/#chapter-06');
  const demo = page.locator('#chapter-06');
  await demo.getByRole('button', { name: 'Submit demo registration' }).click();
  await expect(demo.getByLabel('Full name')).toHaveAttribute('aria-invalid', 'true');
  await expect(demo.locator('.api-result')).toContainText('highlighted fields');
  await demo.getByRole('button', { name: 'Try a registered email' }).click();
  await demo.getByRole('button', { name: 'Submit demo registration' }).click();
  await expect(demo.getByRole('button', { name: 'Checking…', exact: true })).toBeDisabled();
  await expect(demo.getByRole('button', { name: 'Try a new registration' })).toBeDisabled();
  await expect(demo.locator('.api-result')).toContainText('409');
  await expect(demo.getByRole('textbox', { name: /^Email/ })).toHaveAttribute('aria-invalid', 'true');
  await expect(demo.getByLabel('Full name')).toHaveValue('Alex Example');
  await demo.getByRole('textbox', { name: /^Email/ }).fill('new@example.test');
  await demo.getByRole('button', { name: 'Submit demo registration' }).click();
  await expect(demo.locator('.api-result')).toContainText('201');
  await expect(demo.locator('.payload')).toContainText('new@example.test');
});

test('capability cards explain each integration and finish with the skill prompt', async ({ page, isMobile }) => {
  await page.goto('/#chapter-04');
  const skill = page.locator('#chapter-04');
  const cards = skill.getByRole('group', { name: 'Explore MCP, WebMCP and Skill' }).getByRole('button');
  const detail = skill.locator('#capability-detail');
  await expect(cards.locator('strong')).toHaveText(['MCP', 'WebMCP', 'Skill']);
  await expect(cards.first()).toHaveAttribute('aria-pressed', 'true');
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
    expect(cardBounds.x).toBeGreaterThan(detailBounds.x + detailBounds.width);
  }
  await cards.nth(1).click();
  await expect(cards.first()).toHaveAttribute('aria-pressed', 'false');
  await expect(detail.getByRole('heading', { name: 'WebMCP', exact: true })).toBeVisible();
  await expect(detail.locator('.capability-page:not([inert]) > p')).toHaveText([
    'Set webMcp: true to expose the field to a browser agent.',
  ]);
  await expect(detail.locator('.capability-page:not([inert]) .capability-example')).toContainText("key: 'name'");
  await expect(detail.locator('.capability-page:not([inert]) .capability-example')).toContainText('webMcp: true');
  await expect(detail.getByRole('heading', { level: 4 })).toHaveCount(0);
  await expect(detail.getByRole('link', { name: 'Read the guide' })).toHaveAttribute('href', 'https://formly.dev/guide/web-mcp');
  await expect(skill.locator('.prompt-text')).toHaveCount(0);
  await cards.last().focus();
  await cards.last().press('Enter');
  await expect(cards.last()).toBeFocused();
  await expect(cards.last()).toHaveAttribute('aria-pressed', 'true');
  await expect(detail.getByRole('heading', { name: 'Skill', exact: true })).toBeVisible();
  await expect(detail.locator('.capability-page:not([inert]) > p')).toHaveCount(0);
  await expect(detail.getByRole('heading', { level: 4 })).toHaveText('Give the skill a real task');
  await expect(detail.getByRole('link', { name: 'Read the guide' })).toHaveAttribute('href', /skills\/ngx-formly\/SKILL.md$/);
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText: async (text: string) => { sessionStorage.setItem('copied-prompt', text); } },
  }));
  const prompt = await skill.locator('.prompt-text').innerText();
  expect(prompt).toContain('src/components/skill-result.ts');
  expect(prompt).toContain('#chapter-04-result');
  await skill.getByRole('button', { name: 'Copy prompt', exact: true }).click();
  await expect(skill.locator('.demo-actions').getByRole('status')).toHaveText('Copied.');
  expect(await page.evaluate(() => sessionStorage.getItem('copied-prompt'))).toBe(prompt);
  await cards.first().press('Space');
  await expect(skill.locator('.prompt-text')).toHaveCount(0);
  await cards.last().click();
  await expect(skill.getByRole('status')).toBeEmpty();
  await skill.getByRole('link', { name: 'See the agent result', exact: true }).click();
  await expect(page).toHaveURL(/#chapter-04-result$/);
  const result = page.locator('#chapter-04-result');
  await expect(result.getByRole('heading', { name: '04.1 · Agent result' })).toBeVisible();
  await expect(result).toContainText('Run the prompt, then return here to try the form.');
  for (const [language, heading] of [['fr', '04.1 · Résultat de l’agent'], ['de', '04.1 · Ergebnis des Agenten'], ['en', '04.1 · Agent result']]) {
    await page.locator('.language-select').selectOption(language);
    await expect(result.getByRole('heading', { name: heading, exact: true })).toBeVisible();
    await expect(skill.locator('.prompt-text')).toContainText('src/components/skill-result.ts');
    await expect(detail.getByRole('link')).toHaveAccessibleName(({ fr: 'Lire la documentation', de: 'Dokumentation lesen', en: 'Read the guide' } as Record<string, string>)[language]);
    await expect(detail.getByRole('link')).toHaveText('');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await result.getByRole('link', { name: 'Next: 05', exact: true }).click();
  await expect(page).toHaveURL(/#chapter-05$/);
});

for (const reducedMotion of ['reduce', 'no-preference'] as const) {
  test(`capability details follow card order with ${reducedMotion} motion`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion });
    await page.goto('/#chapter-04');
    const cards = page.getByRole('group', { name: 'Explore MCP, WebMCP and Skill' });
    const detail = page.locator('#capability-detail');
    const panels = detail.locator('.capability-page');

    for (const [title, previous, direction] of [['Skill', 'MCP', '1'], ['MCP', 'Skill', '-1']]) {
      await cards.getByRole('button', { name: title, exact: true }).press('Enter');
      if (reducedMotion === 'no-preference') {
        await expect(detail).toHaveCSS('--slide-direction', direction);
        await expect(detail.locator('[inert]')).toContainText(previous);
        await expect(detail.locator('.solution-enter')).toHaveCSS('animation-name', 'solution-enter');
      } else {
        await expect(panels).toHaveCSS('animation-name', 'none');
      }
      await expect(detail).toHaveAccessibleName(title);
      await expect(detail.getByRole('heading', { name: previous, exact: true })).toHaveCount(0);
      await expect(panels).toHaveCount(1);
    }
  });
}

test('changing language retains shared model keys and values', async ({ page }) => {
  await page.goto('/#chapter-05');
  const builder = page.locator('#chapter-05');
  await builder.getByLabel('Full name').fill('Jamie Example');
  await page.getByRole('combobox', { name: 'Language', exact: true }).selectOption('fr');
  await expect(builder.getByLabel('Nom complet')).toHaveValue('Jamie Example');
  await builder.getByText('Voir la configuration exportée', { exact: true }).click();
  await expect(builder.locator('.configuration-details pre')).toContainText('"key": "name"');
  await expect(builder.locator('.configuration-details pre')).toContainText('Nom complet');
  await expect(builder.locator('.configuration-details pre')).not.toContainText('Jamie Example');
});

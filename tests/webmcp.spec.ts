import { expect, test } from '@playwright/test';

test.use({ launchOptions: { args: ['--enable-blink-features=WebMCP,WebMCPTesting'] } });

type DemoTool = { name: string; inputSchema: unknown; execute: (args: unknown) => Promise<unknown> };

declare global {
  interface Window {
    demoTools: Record<string, DemoTool>;
  }
}

for (const host of ['document', 'navigator'] as const) {
  test(`the phone demo fills, validates and follows the panel lifecycle via ${host}`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    await page.addInitScript(host => {
      window.demoTools = {};
      Object.defineProperty(host === 'document' ? navigator : document, 'modelContext', { value: undefined });
      Object.defineProperty(host === 'document' ? document : navigator, 'modelContext', {
        value: {
          registerTool(tool: DemoTool, { signal }: { signal: AbortSignal }) {
            if (window.demoTools[tool.name]) throw new Error('Duplicate tool');
            window.demoTools[tool.name] = tool;
            signal.addEventListener('abort', () => delete window.demoTools[tool.name], { once: true });
          },
        },
      });
    }, host);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/?selected=webmcp#chapter-04');
    await expect.poll(() => page.evaluate(() => Object.keys(window.demoTools))).toEqual(['fill_phone_number']);
    const phone = page.locator('#webmcp-phone-number');
    await expect(phone).toHaveAttribute('aria-invalid', 'false');
    const call = (args: unknown) => page.evaluate(args => window.demoTools['fill_phone_number'].execute(args), args);
    expect(await page.evaluate(() => window.demoTools['fill_phone_number'].inputSchema)).toMatchObject({
      type: 'object', properties: { phoneNumber: { type: ['string', 'null'] } }, additionalProperties: false,
    });
    expect(await call({})).toMatchObject({
      status: 'filled', valid: false, changed: [],
      fields: [{ path: ['phoneNumber'], required: true, empty: true, errors: [{ code: 'required' }] }],
    });
    expect(await call({ phoneNumber: '+1 202-555-0147' })).toMatchObject({ status: 'filled', valid: true });
    await expect(phone).toHaveValue('+1 202 555 0147');

    expect(await call({})).toMatchObject({ status: 'filled', valid: true, changed: [] });
    for (const args of [null, [], { phoneNumber: 123 }, { phoneNumber: 'changed', name: 'unexpected' }]) {
      expect(await call(args)).toMatchObject({ status: 'rejected' });
      await expect(phone).toHaveValue('+1 202 555 0147');
    }
    expect(await call({ phoneNumber: '+1 123' })).toMatchObject({
      status: 'filled', valid: false,
      fields: [{ path: ['phoneNumber'], errors: [{ code: 'phone' }] }],
    });
    expect(await call({ phoneNumber: '' })).toMatchObject({
      status: 'filled', valid: false,
      fields: [{ path: ['phoneNumber'], empty: true, errors: [{ code: 'required' }] }],
    });
    await expect(phone).toHaveAttribute('aria-invalid', 'true');
    await expect(phone).toHaveValue('');
    await expect(page.locator('#webmcp-phone-number-error')).toBeVisible();
    expect(await call({ phoneNumber: '+1 202-555-0147' })).toMatchObject({ status: 'filled', valid: true });
    await expect(phone).toHaveAttribute('aria-invalid', 'false');

    await page.locator('header .language-select').selectOption('fr');
    await expect(phone).toHaveAccessibleName('Numéro de téléphone');
    await expect.poll(() => call({})).toMatchObject({ fields: [{ label: 'Numéro de téléphone' }] });
    await expect(phone).toHaveValue('+1 202 555 0147');
    expect(await call({ phoneNumber: '+1 202-555-0182' })).toMatchObject({ status: 'filled', valid: true });
    await expect(phone).toHaveValue('+1 202 555 0182');

    const chapter = page.locator('#chapter-04');
    await chapter.getByRole('button', { name: 'MCP', exact: true }).click();
    await expect.poll(() => page.evaluate(() => Object.keys(window.demoTools))).toEqual([]);
    await chapter.getByRole('button', { name: 'WebMCP', exact: true }).click();
    await expect.poll(() => page.evaluate(() => Object.keys(window.demoTools))).toEqual(['fill_phone_number']);
    await expect(phone).toHaveValue('+1 202 555 0182');
    expect(errors).toEqual([]);
  });
}

test('the phone field remains usable without a browser WebMCP API', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => {
    Object.defineProperty(document, 'modelContext', { value: undefined });
    Object.defineProperty(navigator, 'modelContext', { value: undefined });
  });
  await page.goto('/?selected=webmcp#chapter-04');
  await page.getByRole('button', { name: 'Select country', exact: true }).click();
  const countries = page.getByRole('dialog', { name: 'Select country' });
  await countries.getByRole('textbox').fill('Switzerland');
  const switzerland = countries.getByRole('button', { name: /Switzerland.*\+41/ });
  await switzerland.focus();
  await switzerland.press('Enter');
  await expect(countries).toBeHidden();
  const phone = page.getByRole('textbox', { name: 'Phone number', exact: true });
  await phone.fill('079 123 45 67');
  await expect(phone).toHaveValue('+41 79 123 45 67');
  await phone.fill('+1 202-555-0173');
  await expect(phone).toHaveValue('+1 202 555 0173');
  expect(errors).toEqual([]);
});

test.describe('native WebMCP', () => {
  test('Chromium discovers and executes the Formly tool', async ({ page }, testInfo) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    await page.goto('/?selected=webmcp#chapter-04');
    type ModelContext = {
      getTools(): Promise<{ name: string }[]>;
      executeTool(tool: { name: string }, args: unknown): Promise<string>;
    };
    const toolNames = () => page.evaluate(async () => {
      const context = (document as Document & { modelContext: ModelContext }).modelContext;
      return (await context.getTools()).map(tool => tool.name);
    });
    const call = (args: unknown) => page.evaluate(async args => {
      const context = (document as Document & { modelContext: ModelContext }).modelContext;
      const tool = (await context.getTools()).find(tool => tool.name === 'fill_phone_number')!;
      return JSON.parse(await context.executeTool(tool, args));
    }, args);

    await expect.poll(toolNames).toEqual(['fill_phone_number']);
    expect(await call({})).toMatchObject({ valid: false, changed: [] });
    expect(await call({ phoneNumber: '+1 202-555-0147' })).toMatchObject({
      status: 'filled', valid: true, changed: [{ path: ['phoneNumber'], value: '+1 202-555-0147' }],
    });
    const phone = page.getByRole('textbox', { name: 'Phone number', exact: true });
    await expect(phone).toHaveValue('+1 202 555 0147');
    await page.locator('#chapter-04').screenshot({ path: testInfo.outputPath('webmcp-filled.png') });
    expect(await call({ phoneNumber: '' })).toMatchObject({ status: 'filled', valid: false });
    await expect(phone).toHaveAttribute('aria-invalid', 'true');

    await page.locator('#chapter-04').getByRole('button', { name: 'MCP', exact: true }).click();
    await expect.poll(toolNames).toEqual([]);
    await page.locator('#chapter-04').getByRole('button', { name: 'WebMCP', exact: true }).click();
    await expect.poll(toolNames).toEqual(['fill_phone_number']);
    expect(await call({ phoneNumber: '+1 202-555-0182' })).toMatchObject({ status: 'filled', valid: true });
    await expect(phone).toHaveValue('+1 202 555 0182');
    expect(errors).toEqual([]);
  });
});

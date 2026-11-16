import { expect, test } from '@playwright/test';

type DemoTool = { name: string; execute: (args: unknown) => Promise<unknown> };

declare global {
  interface Window {
    demoTools: Record<string, DemoTool>;
  }
}

test('the phone demo registers a tool that fills, validates and follows the panel lifecycle', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => {
    window.demoTools = {};
    Object.defineProperty(document, 'modelContext', {
      value: {
        registerTool(tool: DemoTool, { signal }: { signal: AbortSignal }) {
          if (window.demoTools[tool.name]) throw new Error('Duplicate tool');
          window.demoTools[tool.name] = tool;
          signal.addEventListener('abort', () => delete window.demoTools[tool.name], { once: true });
        },
      },
    });
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?selected=webmcp#chapter-04');
  await expect.poll(() => page.evaluate(() => Object.keys(window.demoTools))).toEqual(['fill_phone_number']);
  const phone = page.locator('#webmcp-phone-number');
  const call = (args: unknown) => page.evaluate(args => window.demoTools['fill_phone_number'].execute(args), args);
  expect(await call({ phoneNumber: '+1 202-555-0147' })).toMatchObject({ status: 'filled', valid: true });
  await expect(phone).toHaveValue('+1 202-555-0147');

  for (const args of [null, [], {}, { phoneNumber: 123 }, { phoneNumber: 'changed', name: 'unexpected' }]) {
    expect(await call(args)).toMatchObject({ status: 'rejected' });
    await expect(phone).toHaveValue('+1 202-555-0147');
  }
  expect(await call({ phoneNumber: '' })).toMatchObject({ status: 'validation-failed', valid: false });
  await expect(phone).toHaveAttribute('aria-invalid', 'true');
  expect(await call({ phoneNumber: '+1 202-555-0147' })).toMatchObject({ status: 'filled', valid: true });

  await page.locator('header .language-select').selectOption('fr');
  await expect(phone).toHaveAccessibleName('Numéro de téléphone');
  await expect(phone).toHaveValue('+1 202-555-0147');
  expect(await call({ phoneNumber: '+1 202-555-0182' })).toMatchObject({ status: 'filled', valid: true });
  await expect(phone).toHaveValue('+1 202-555-0182');

  const chapter = page.locator('#chapter-04');
  await chapter.getByRole('button', { name: 'MCP', exact: true }).click();
  await expect.poll(() => page.evaluate(() => Object.keys(window.demoTools))).toEqual([]);
  await chapter.getByRole('button', { name: 'WebMCP', exact: true }).click();
  await expect.poll(() => page.evaluate(() => Object.keys(window.demoTools))).toEqual(['fill_phone_number']);
  await expect(phone).toHaveValue('+1 202-555-0182');
  expect(errors).toEqual([]);
});

test('the phone field remains usable without a browser WebMCP API', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => {
    Object.defineProperty(document, 'modelContext', { value: undefined });
    Object.defineProperty(navigator, 'modelContext', { value: undefined });
  });
  await page.goto('/?selected=webmcp#chapter-04');
  const phone = page.getByRole('textbox', { name: 'Phone number', exact: true });
  await phone.fill('+1 202-555-0173');
  await expect(phone).toHaveValue('+1 202-555-0173');
  expect(errors).toEqual([]);
});

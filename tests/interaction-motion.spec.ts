import { expect, test } from '@playwright/test';

for (const reducedMotion of ['reduce', 'no-preference'] as const) {
  test(`shared controls give keyboard press feedback with ${reducedMotion} motion`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion });
    await page.goto('/');
    const toggle = page.getByRole('button', { name: 'Dark mode' });
    await toggle.focus();
    await page.keyboard.down('Space');
    await expect(toggle).toHaveCSS('scale', reducedMotion === 'reduce' ? 'none' : '0.98');
    await page.keyboard.up('Space');
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect(toggle).toHaveCSS('scale', 'none');
    await expect(toggle).toBeFocused();
  });
}

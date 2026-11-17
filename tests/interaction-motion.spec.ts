import { expect, test } from '@playwright/test';

for (const reducedMotion of ['reduce', 'no-preference'] as const) {
  test(`problem cards release before revealing a solution with ${reducedMotion} motion`, async ({ page, isMobile }) => {
    await page.emulateMedia({ reducedMotion });
    await page.addInitScript(() => {
      const paused = new WeakSet<Animation>();
      document.addEventListener('animationstart', event => {
        if (!['problem-press', 'problem-reveal'].includes(event.animationName)) return;
        for (const animation of (event.target as Element).getAnimations()) {
          if (animation instanceof CSSAnimation && animation.animationName === event.animationName && !paused.has(animation)) {
            paused.add(animation);
            animation.pause();
            animation.currentTime = 0;
          }
        }
      });
    });
    await page.goto('/#chapter-02-continued');
    await expect(page.getByRole('button', { name: 'Start presentation timer' })).toBeEnabled();
    const cards = page.locator('.problem-card');
    const card = cards.first();
    const panel = page.locator('.problem-solution');
    const originalSize = (await card.boundingBox())!;

    // The description shares the button's full-card hit area.
    await card.scrollIntoViewIfNeeded();
    const description = (await card.locator('.problem-description').boundingBox())!;
    const x = description.x + description.width / 2;
    const y = description.y + description.height / 2;
    if (isMobile) await page.touchscreen.tap(x, y);
    else await page.mouse.click(x, y);
    await expect(card.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
    await expect(panel).toHaveCount(1);

    if (reducedMotion === 'reduce') {
      await expect(card).toHaveCSS('animation-name', 'none');
      await expect(panel).toHaveCSS('animation-name', 'none');
      await expect(panel).toHaveCSS('opacity', '1');
    } else {
      await expect.poll(() => panel.evaluate(element => element.getAnimations()[0]?.playState)).toBe('paused');
      await card.evaluate(element => { element.getAnimations().find(animation => animation instanceof CSSAnimation)!.currentTime = 72; });
      const pressedSize = (await card.boundingBox())!;
      expect(pressedSize.x).toBeCloseTo(originalSize.x, 1);
      expect(pressedSize.width).toBeCloseTo(originalSize.width * 0.98, 1);
      expect(pressedSize.height).toBeCloseTo(originalSize.height, 1);
      await card.evaluate(element => { element.getAnimations().find(animation => animation instanceof CSSAnimation)!.currentTime = 126; });
      const releasingSize = (await card.boundingBox())!;
      expect(releasingSize.x).toBeCloseTo(originalSize.x, 1);
      expect(releasingSize.width).toBeGreaterThan(pressedSize.width);
      expect(releasingSize.width).toBeLessThan(originalSize.width);
      await panel.evaluate(element => { element.getAnimations()[0].currentTime = 179; });
      await expect(panel).toHaveCSS('opacity', '0');

      await card.evaluate(element => element.getAnimations().find(animation => animation instanceof CSSAnimation)!.finish());
      await expect(card).toHaveCSS('transform', 'none');
      await panel.evaluate(element => { element.getAnimations()[0].currentTime = 220; });
      const entering = await panel.evaluate(element => {
        const style = getComputedStyle(element);
        const transform = new DOMMatrixReadOnly(style.transform);
        return { opacity: Number(style.opacity), x: transform.m41, y: transform.m42, scale: transform.m11 };
      });
      expect(entering.opacity).toBeGreaterThan(0);
      expect(entering.opacity).toBeLessThan(1);
      expect(entering.scale).toBeLessThan(1);
      expect(isMobile ? entering.y : entering.x).toBeLessThan(0);
      expect(isMobile ? entering.x : entering.y).toBe(0);
      await panel.evaluate(element => element.getAnimations()[0].finish());
    }

    await expect(panel).toHaveCSS('transform', 'none');
    expect((await card.boundingBox())!.x).toBeCloseTo(originalSize.x, 1);
    expect((await card.boundingBox())!.width).toBeCloseTo(originalSize.width, 1);
    await cards.nth(1).getByRole('button').press('Enter');
    await expect(cards.nth(1).getByRole('button')).toHaveAttribute('aria-expanded', 'true');
    await expect(panel.getByRole('heading', { level: 4 })).toHaveText('Material · Bootstrap · PrimeNG');
    await expect(cards.nth(1)).toHaveCSS('animation-name', reducedMotion === 'reduce' ? 'none' : 'problem-press');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });

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

import { expect, test } from "@playwright/test";

for (const reducedMotion of ["reduce", "no-preference"] as const) {
  test(`the form ecosystem connects all three tools with ${reducedMotion} motion`, async ({
    page,
    isMobile,
  }, testInfo) => {
    await page.emulateMedia({ reducedMotion });
    await page.goto("/#chapter-02-continued");
    await expect(
      page.getByRole("button", { name: "Start presentation timer" }),
    ).toBeEnabled();
    await page.getByRole("button", { name: "Show solution: Ongoing cost" }).click();
    await page.getByRole("button", { name: "Show solution: Different designs" }).click();
    await page.getByRole("button", { name: "Show solution: Repeated work" }).click();

    const diagram = page.getByRole("img", {
      name: "Core forms, MCP and Builder share the same form logic.",
    });
    await expect(diagram).toBeVisible();
    await expect(diagram.locator("svg")).toHaveCount(3);
    await expect(diagram.locator("text")).toHaveCount(0);
    const connections = diagram.locator(".ecosystem-flow");
    await expect(connections).toHaveCount(2);
    for (const connection of await connections.all()) {
      await expect(connection).toHaveCSS(
        "animation-name",
        reducedMotion === "reduce" ? "none" : "ecosystem-connect",
      );
      await expect(connection).toHaveCSS("stroke-dashoffset", "0px");
    }
    if (reducedMotion === "no-preference") {
      await expect(connections.first()).toHaveCSS("animation-delay", "0.4s");
      await expect(connections.last()).toHaveCSS("animation-delay", "1s");
      await expect(connections.first()).toHaveCSS("animation-iteration-count", "1");
    }

    const panel = page.locator(".problem-solution");
    await expect(panel.locator(".problem-solution-page")).toHaveCount(1);
    const bounds = (await diagram.boundingBox())!;
    const panelBounds = (await panel.boundingBox())!;
    expect(bounds.x).toBeGreaterThanOrEqual(panelBounds.x);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(panelBounds.x + panelBounds.width);
    const content = panel.getByRole("region");
    const contentBounds = (await content.boundingBox())!;
    expect(bounds.y).toBeGreaterThanOrEqual(contentBounds.y);
    expect(bounds.y + bounds.height).toBeLessThanOrEqual(contentBounds.y + contentBounds.height);
    expect(await content.evaluate((element) => element.scrollHeight)).toBeLessThanOrEqual(
      await content.evaluate((element) => element.clientHeight),
    );
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width);

    if (reducedMotion === "reduce") {
      await panel.screenshot({ path: testInfo.outputPath("ecosystem-light.png") });
      await page.getByRole("button", { name: "Dark mode" }).click();
      await expect(connections.first()).toHaveCSS("stroke", "rgb(167, 201, 171)");
      await panel.screenshot({ path: testInfo.outputPath("ecosystem-dark.png") });
    }
    if (!isMobile) {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await expect.poll(() => content.evaluate((element) => element.scrollHeight - element.clientHeight)).toBe(0);
      const wideDiagram = (await diagram.boundingBox())!;
      const wideContent = (await content.boundingBox())!;
      expect(wideDiagram.y).toBeGreaterThanOrEqual(wideContent.y);
      expect(wideDiagram.y + wideDiagram.height).toBeLessThanOrEqual(wideContent.y + wideContent.height);
      if (reducedMotion === "reduce") {
        await panel.screenshot({ path: testInfo.outputPath("ecosystem-wide.png") });
      }
    }
  });
}

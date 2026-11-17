import { expect, test } from "@playwright/test";

test("the header theme button switches colors and remembers the choice", async ({
  page,
}) => {
  await page.goto("/");
  const toggle = page.getByRole("button", { name: "Dark mode" });
  const title = page.getByRole("heading", { level: 1 });

  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await expect(title).toHaveCSS("color", "rgb(0, 0, 0)");
  await toggle.press("Enter");
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await expect(title).toHaveCSS("color", "rgb(248, 246, 241)");
  await expect(page.locator("html")).toHaveCSS("color-scheme", "dark");

  await page.reload();
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await page.reload();
  await expect(title).toHaveCSS("color", "rgb(0, 0, 0)");
});

test("the presentation timer starts empty, survives reloads and turns primary only after an hour", async ({
  page,
}) => {
  const start = new Date("2026-11-09T09:00:00Z");
  await page.clock.setFixedTime(start);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const timer = page.getByRole("progressbar", { name: "Presentation time" });
  await expect(timer).toHaveAttribute("value", "0");
  await expect(timer).toHaveAttribute(
    "aria-valuetext",
    "Presentation not started",
  );
  expect(
    await page.evaluate(() =>
      localStorage.getItem("ngx-presentation-started-at"),
    ),
  ).toBeNull();

  await page.getByRole("link", { name: "Start with chapter 01" }).click();
  await expect(page).toHaveURL(/#chapter-01$/);
  await expect
    .poll(() =>
      page.evaluate(() => localStorage.getItem("ngx-presentation-started-at")),
    )
    .toBe(String(start.getTime()));

  await page.clock.setFixedTime(new Date(start.getTime() + 30 * 60000));
  await expect(timer).toHaveAttribute("value", "50");
  await expect(page.getByText("30 / 60 min", { exact: true })).toBeVisible();
  await expect(timer).toHaveCSS("--timer-fill", "#d9d6d0");
  await page.reload();
  await expect(timer).toHaveAttribute("value", "50");

  await page.locator(".brand").click();
  await page.getByRole("link", { name: "Start with chapter 01" }).click();
  await expect(timer).toHaveAttribute("value", "50");
  expect(
    await page.evaluate(() =>
      localStorage.getItem("ngx-presentation-started-at"),
    ),
  ).toBe(String(start.getTime()));

  await page.clock.setFixedTime(new Date(start.getTime() + 60 * 60000));
  await expect(timer).toHaveAttribute("value", "100");
  await expect(timer).toHaveCSS("--timer-fill", "#d9d6d0");
  await page.clock.setFixedTime(new Date(start.getTime() + 61 * 60000));
  await expect(timer).toHaveCSS("--timer-fill", "#b92e36");
  await expect(timer).toHaveAttribute("value", "100");
  await expect(timer).toHaveAttribute(
    "aria-valuetext",
    "61 of 60 minutes elapsed, over time",
  );
});

test("the timer target advances only after each chapter independently of elapsed time", async ({ page, isMobile }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const timer = page.getByRole("progressbar", { name: "Presentation time" });
  const marker = page.locator(".timer-target-marker");
  await expect(marker).toHaveCount(0);
  await expect(page.locator("#timer-target")).toBeHidden();

  for (const [chapter, minutes] of [
    ["01", 0],
    ["02", 3],
    ...(isMobile ? [["02-more-examples", 3]] as const : []),
    ["03", 8],
    ["04", 15],
    ["07", 29],
    ["12", 37],
    ["11", 40],
    ["01", 0],
  ] as const) {
    await page.locator(`#chapter-${chapter}`).evaluate(element => element.scrollIntoView());
    await expect(page.locator("#timer-target")).toHaveText(`Planned chapter start: ${minutes} min`);
    await expect(timer).toHaveAccessibleDescription(`Planned chapter start: ${minutes} min`);
    await expect(timer).toHaveAttribute("value", "0");
    await expect(marker).toBeVisible();
    const trackBounds = (await page.locator(".timer-track").boundingBox())!;
    const markerBounds = (await marker.boundingBox())!;
    expect((markerBounds.x + markerBounds.width / 2 - trackBounds.x) / trackBounds.width).toBeCloseTo(minutes / 60, 2);
  }

  await page.locator(".brand").click();
  await expect(marker).toHaveCount(0);
  await expect(page.locator("#timer-target")).toBeHidden();
  await expect(timer).not.toHaveAttribute("aria-describedby");
});

test("the timer button clears the saved start and starts a fresh presentation", async ({
  page,
}) => {
  const start = new Date("2026-11-09T09:00:00Z");
  await page.clock.setFixedTime(start);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#chapters");
  const timer = page.getByRole("progressbar", { name: "Presentation time" });
  const startButton = page.getByRole("button", {
    name: "Start presentation timer",
  });
  await expect(startButton).toBeEnabled();
  await startButton.focus();
  await startButton.press("Enter");
  await expect(page).toHaveURL(/#chapters$/);
  await page.clock.setFixedTime(new Date(start.getTime() + 61 * 60000));
  await expect(timer).toHaveCSS("--timer-fill", "#b92e36");

  await page.getByRole("button", { name: "Reset presentation timer" }).click();
  await expect(timer).toHaveAttribute("value", "0");
  await expect(timer).toHaveCSS("--timer-fill", "#d9d6d0");
  await expect(startButton).toBeEnabled();
  expect(
    await page.evaluate(() =>
      localStorage.getItem("ngx-presentation-started-at"),
    ),
  ).toBeNull();
  const nextStart = start.getTime() + 65 * 60000;
  await page.clock.setFixedTime(new Date(nextStart));
  await page.reload();
  await expect(startButton).toBeEnabled();
  await expect(timer).toHaveAttribute(
    "aria-valuetext",
    "Presentation not started",
  );
  await expect(timer).toHaveAttribute("value", "0");

  await startButton.click();
  expect(
    await page.evaluate(() =>
      localStorage.getItem("ngx-presentation-started-at"),
    ),
  ).toBe(String(nextStart));
  await page.clock.setFixedTime(new Date(nextStart + 30 * 60000));
  await expect(timer).toHaveAttribute("value", "50");
});

test("invalid saved start times leave the timer ready to start", async ({
  page,
}) => {
  const start = new Date("2026-11-09T09:00:00Z");
  await page.clock.setFixedTime(start);
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const savedStart of [
    "invalid",
    "Infinity",
    "-1",
    String(start.getTime() + 60000),
  ]) {
    await page.goto("/");
    await page.evaluate(
      (value) => localStorage.setItem("ngx-presentation-started-at", value),
      savedStart,
    );
    await page.reload();
    const timer = page.getByRole("progressbar", { name: "Presentation time" });
    await expect(timer).toHaveAttribute("value", "0");
    await page.getByRole("link", { name: "Start with chapter 01" }).click();
    await expect(timer).toHaveAttribute(
      "aria-valuetext",
      "0 of 60 minutes elapsed",
    );
    expect(
      await page.evaluate(() =>
        localStorage.getItem("ngx-presentation-started-at"),
      ),
    ).toBe(String(start.getTime()));
  }
});

test("the timer still runs when local storage is unavailable", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const start = new Date("2026-11-09T09:00:00Z");
  await page.clock.setFixedTime(start);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new DOMException("Storage blocked", "SecurityError");
      },
    });
  });
  await page.goto("/");
  await page.getByRole("link", { name: "Start with chapter 01" }).click();
  await page.clock.setFixedTime(new Date(start.getTime() + 30 * 60000));
  await expect(
    page.getByRole("progressbar", { name: "Presentation time" }),
  ).toHaveAttribute("value", "50");
  await page.getByRole("button", { name: "Reset presentation timer" }).click();
  await expect(
    page.getByRole("progressbar", { name: "Presentation time" }),
  ).toHaveAttribute("value", "0");
  await page.getByRole("button", { name: "Start presentation timer" }).click();
  await expect(
    page.getByRole("button", { name: "Reset presentation timer" }),
  ).toBeEnabled();
  expect(errors).toEqual([]);
});

test("all numbered chapters are reachable and chapter 07 leads directly to the closing chapters", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Why are we still rebuilding the same forms?",
  );

  const index = page.getByRole("navigation", {
    name: "Chapter index",
    exact: true,
  });
  await expect(index.getByRole("link")).toHaveCount(9);
  await expect(index.getByRole("link").last()).toHaveAttribute("href", "#chapter-11");
  await expect(page.locator("#chapter-08, #chapter-09, #chapter-10")).toHaveCount(0);
  await expect(page.locator('a[href="#chapter-08"], a[href="#chapter-09"], a[href="#chapter-10"]')).toHaveCount(0);
  await expect(
    page.locator("#chapter-07").getByRole("link", { name: "Next: 12" }),
  ).toHaveAttribute("href", "#chapter-12");
  await expect(
    page.locator("#chapter-12").getByRole("link", { name: "Previous: 07" }),
  ).toHaveAttribute("href", "#chapter-07");
  for (const href of await index
    .getByRole("link")
    .evaluateAll((links) => links.map((link) => link.getAttribute("href")))) {
    await expect(page.locator(href!)).toHaveCount(1);
  }

  await index.getByRole("link", { name: /07 PeriScope/ }).click();
  const chapter = page.getByRole("region", {
    name: "07 PeriScope",
  });
  await chapter.getByRole("link", { name: "Next: 12" }).click();
  await expect(page).toHaveURL(/#chapter-12$/);
  const whatsNext = page.getByRole("region", { name: "12 What's next" });
  await expect(whatsNext.getByRole("heading", { level: 2 })).toBeInViewport();
  await expect(whatsNext.getByRole("heading", { level: 3 })).toHaveText([
    "Framework agnostic",
    "Shared ARIA component",
  ]);
  await whatsNext.getByRole("link", { name: "Next: 11" }).click();
  await expect(page).toHaveURL(/#chapter-11$/);
  const discussion = page.getByRole("region", { name: "11 Q&A" });
  await expect(discussion.getByRole("heading", { level: 2 })).toBeInViewport();
  await expect(discussion.getByRole("link", { name: "Previous: 12" })).toHaveAttribute("href", "#chapter-12");
  await discussion.getByRole("link", { name: "Back to overview" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toBeInViewport();
  expect(errors).toEqual([]);
});

test("the What's next ellipsis starts when it enters view", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const ellipsis = page.locator("#chapter-12 .future-ellipsis");
  const firstDot = ellipsis.locator("circle").first();
  await expect(firstDot).toHaveCSS("animation-name", "none");

  await page.locator("#chapter-12").evaluate(element => element.scrollIntoView({ behavior: "instant" }));
  await expect(firstDot).toHaveCSS("animation-name", /ellipsis-wave$/);

  await page.locator("#chapter-11").evaluate(element => element.scrollIntoView({ behavior: "instant" }));
  await expect(firstDot).toHaveCSS("animation-name", "none");

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.locator("#chapter-12").evaluate(element => element.scrollIntoView({ behavior: "instant" }));
  await expect(ellipsis.locator("circle").last()).toHaveCSS("opacity", "1");
  await expect(firstDot).toHaveCSS("animation-name", "none");
});

test("direct links work with reduced motion and without horizontal overflow", async ({
  page,
}) => {
  const hydrationErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error" && /hydrat/i.test(message.text()))
      hydrationErrors.push(message.text());
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#chapter-03");
  await expect(
    page.getByRole("heading", { name: "03 Meet ngx-formly" }),
  ).toBeInViewport();
  await expect(page.locator("#chapter-03 .chapter-content")).toHaveCSS(
    "transform",
    "none",
  );
  await expect(page.locator("html")).toHaveCSS("scroll-behavior", "auto");
  await expect(
    page
      .getByRole("navigation", { name: "Chapter index", exact: true })
      .locator('[aria-current="location"]'),
  ).toContainText("Meet ngx-formly");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  expect(hydrationErrors).toEqual([]);
});

test("Integration stays pinned through Make it yours and OK toggles its status", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#chapter-02");
  const row = page.locator(".chapter-challenges");
  const cards = row.locator(".form-example-challenge");
  const integration = cards.last();
  const visibleCards = cards.filter({ visible: true });
  const allChallenges = [
    "Ongoing maintenance", "Complexity", "integration",
  ];
  await expect(visibleCards).toHaveText(allChallenges);
  await page.locator("#chapter-03").evaluate(chapter => chapter.scrollIntoView());
  await expect(integration).toBeInViewport();
  const integrationLeft = (await integration.boundingBox())!.x;
  const headerBottom = (await page.locator(".site-header").boundingBox())!.height;
  await page.evaluate(() => {
    // A full-height slide can snap past its intermediate scroll positions.
    document.documentElement.style.scrollSnapType = "none";
    window.scrollBy(0, 160);
  });
  await expect.poll(async () => (await row.boundingBox())?.y).toBe(headerBottom);
  for (const chapter of ["04", "05", "06"]) {
    await page.locator(`#chapter-${chapter}`).evaluate(section => section.scrollIntoView());
    await expect(visibleCards).toHaveText(["integration"]);
    await expect.poll(async () => (await row.boundingBox())?.y).toBe(headerBottom);
    expect((await integration.boundingBox())?.x).toBe(integrationLeft);
  }
  const ok = page.getByRole("button", { name: "OK, mark integration as addressed" });
  await expect(ok).toHaveAttribute("aria-pressed", "false");
  await ok.press("Space");
  await expect(ok).toHaveAttribute("aria-pressed", "true");
  await expect(integration).toHaveClass(/form-example-challenge--resolved/);
  await ok.click();
  await expect(integration).not.toHaveClass(/form-example-challenge--resolved/);
  await page.locator("#chapter-07").evaluate(chapter => chapter.scrollIntoView());
  await expect(integration).not.toBeInViewport();
  await page.locator("#chapter-03").evaluate(chapter => chapter.scrollIntoView());
  await expect(visibleCards).toHaveText(allChallenges);
});

test("the same chapter index sticks without jumping and highlights the chapter while scrolling", async ({
  page,
  isMobile,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  if (isMobile)
    await expect(page.locator("#chapter-01-continued")).toBeAttached();
  const index = page.getByRole("navigation", {
    name: "Chapter index",
    exact: true,
  });
  const current = index.locator('[aria-current="location"]');
  await expect(current).toHaveCount(0);
  await expect(index).toHaveCSS("position", isMobile ? "static" : "sticky");
  const originalIndex = await index.elementHandle();
  const originalBounds = await index.boundingBox();
  const chapterTop = await page
    .locator("#chapter-01")
    .evaluate(
      (element) => element.getBoundingClientRect().top + window.scrollY,
    );

  await page
    .locator("#chapter-01")
    .evaluate((element) => element.scrollIntoView());
  await expect(current).toHaveAttribute("href", "#chapter-01");
  await expect(index).toHaveCSS("position", isMobile ? "static" : "sticky");
  expect(
    await index.evaluate(
      (element, original) => element === original,
      originalIndex,
    ),
  ).toBe(true);
  const scrolledBounds = await index.boundingBox();
  expect(scrolledBounds!.x).toBe(originalBounds!.x);
  expect(scrolledBounds!.width).toBe(originalBounds!.width);
  if (!isMobile) expect(scrolledBounds!.y).toBe(88);
  expect(
    await page
      .locator("#chapter-01")
      .evaluate(
        (element) => element.getBoundingClientRect().top + window.scrollY,
      ),
  ).toBe(chapterTop);

  for (const number of ["02", "05", "03"]) {
    await page
      .locator(`#chapter-${number}`)
      .evaluate((element) => element.scrollIntoView());
    await expect(current).toHaveAttribute("href", `#chapter-${number}`);
    await expect(current).toHaveCSS("font-weight", "700");
    await expect(index.getByRole("link", { name: /01 About me/ })).toHaveCSS(
      "font-weight",
      "400",
    );
  }

  if (!isMobile) {
    const bounds = await index.boundingBox();
    expect(bounds!.y).toBe(88);
    expect(bounds!.x + bounds!.width).toBe(page.viewportSize()!.width - 16);
    const content = await page
      .locator("#chapter-03 .chapter-content")
      .boundingBox();
    expect(content!.x + content!.width).toBeLessThan(bounds!.x);
    await index.getByRole("link", { name: /11 Q&A/ }).click();
    await expect(current).toHaveAttribute("href", "#chapter-11");
    await expect(
      page.getByRole("heading", { name: "11 Q&A" }),
    ).toBeInViewport();
    await page.setViewportSize({ width: 1280, height: 500 });
    await page.goto("/#chapter-03");
    await expect(current).toHaveAttribute("href", "#chapter-03");
    await expect(
      index.getByRole("progressbar", { name: "Presentation time" }),
    ).toBeInViewport({ ratio: 1 });
    await page.goto("/#chapter-11");
    await expect(current).toHaveAttribute("href", "#chapter-11");
    await expect(current).toBeInViewport();
    await expect(
      index.getByRole("heading", { name: "Chapters" }),
    ).toBeInViewport({ ratio: 1 });
  }

  if (isMobile) {
    await page.locator(".brand").click();
    await page.getByRole("link", { name: "Chapters", exact: true }).click();
    await expect(
      index.getByRole("heading", { name: "Chapters", exact: true }),
    ).toBeInViewport();
  }
  await page.locator(".brand").click();
  await expect(index).toHaveCSS("position", isMobile ? "static" : "sticky");
  await expect(current).toHaveCount(0);
});

test("completed chapters show checkmarks and restore their durations when scrolling back", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#chapter-01");
  const index = page.getByRole("navigation", {
    name: "Chapter index",
    exact: true,
  });
  const first = index.locator('a[href="#chapter-01"]');
  const third = index.locator('a[href="#chapter-03"]');
  await expect(first).toHaveAttribute("aria-current", "location");
  await expect(index.getByRole("img", { name: "Completed" })).toHaveCount(0);

  await page
    .locator("#chapter-03")
    .evaluate((element) => element.scrollIntoView());
  await expect(third).toHaveAttribute("aria-current", "location");
  await expect(index.getByRole("img", { name: "Completed" })).toHaveCount(2);
  await expect(first.locator(".index-duration")).toBeHidden();
  await expect(first.locator(".index-title")).toHaveCSS(
    "text-decoration-line",
    "line-through",
  );
  await expect(third.locator(".index-time")).toHaveText("7 min");
  await expect(third.locator(".index-title")).toHaveCSS(
    "text-decoration-line",
    "none",
  );
  await expect(index.locator('a[href="#chapter-04"] .index-time')).toHaveText(
    "4 min",
  );

  await page
    .locator("#chapter-01")
    .evaluate((element) => element.scrollIntoView());
  await expect(first).toHaveAttribute("aria-current", "location");
  await expect(index.getByRole("img", { name: "Completed" })).toHaveCount(0);
  await expect(first.locator(".index-time")).toHaveText("3 min");
  await expect(first.locator(".index-duration")).toBeVisible();
  await expect(first.locator(".index-title")).toHaveCSS(
    "text-decoration-line",
    "none",
  );
});

test("chapter progress follows the current slides after their elements are replaced", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#chapter-03");
  const index = page.getByRole("navigation", {
    name: "Chapter index",
    exact: true,
  });
  const current = index.locator('[aria-current="location"]');
  await expect(current).toHaveAttribute("href", "#chapter-03");

  // Live updates can remount the slides without remounting the navigation.
  await page.locator(".chapter").evaluateAll((sections) => {
    for (const section of sections)
      section.replaceWith(section.cloneNode(true));
  });
  await page
    .locator("#chapter-01")
    .evaluate((element) => element.scrollIntoView());
  await expect(current).toHaveAttribute("href", "#chapter-01");
  await expect(index.getByRole("img", { name: "Completed" })).toHaveCount(0);
  await expect(index.locator(".index-title--completed")).toHaveCount(0);

  await page
    .locator("#chapter-03")
    .evaluate((element) => element.scrollIntoView());
  await expect(current).toHaveAttribute("href", "#chapter-03");
  await expect(index.getByRole("img", { name: "Completed" })).toHaveCount(2);
  await expect(index.locator(".index-title--completed")).toHaveCount(2);
});

test("the introduction keeps three cards aligned and groups the maintainers", async ({
  page,
  isMobile,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#chapter-01");
  const chapter = page.locator("#chapter-01");
  await expect(chapter.getByRole("heading", { level: 2 })).toBeInViewport();
  await expect(chapter.locator(".chapter-slide")).toHaveCount(isMobile ? 2 : 1);
  const cards = chapter.getByRole("article");
  await expect(cards).toHaveCount(3);
  await expect(cards.first().locator(".fanatic-badge")).toHaveText("Fanatic");
  await expect(cards.first().locator(".metric-label [data-count-to]")).toHaveAttribute("data-count-to", "100");
  for (const card of await cards.all()) {
    await expect(card.locator(".metric-history")).toBeHidden();
    await expect(card.locator(".metric-value")).toBeHidden();
    const bounds = (await card.boundingBox())!;
    const logo = (await card.locator(".metric-logo").boundingBox())!;
    expect(logo.x + logo.width / 2).toBeCloseTo(bounds.x + bounds.width / 2, 0);
    expect(logo.y + logo.height / 2).toBeCloseTo(bounds.y + bounds.height / 2, 0);
  }
  const maintainers = chapter.getByRole("region", {
    name: "Open-source",
    exact: true,
  });
  await expect(maintainers.getByRole("article")).toHaveCount(2);
  await expect(
    maintainers.getByRole("heading", { name: "Stack Overflow" }),
  ).toHaveCount(0);

  const boxes = await cards.evaluateAll((elements) =>
    elements.map((element) => {
      const { top, bottom, left, right } = element.getBoundingClientRect();
      return { top, bottom, left, right };
    }),
  );
  for (let index = 1; index < boxes.length; index++) {
    if (isMobile) {
      expect(boxes[index].top).toBeGreaterThan(boxes[index - 1].bottom);
    } else {
      expect(Math.abs(boxes[index].top - boxes[0].top)).toBeLessThan(1);
      expect(boxes[index].left).toBeGreaterThan(boxes[index - 1].right);
    }
  }
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await chapter.getByRole("link", { name: "Next: 02" }).click();
  await expect(
    page.getByRole("heading", { name: "02 The Problems" }),
  ).toBeInViewport();
});

test("metrics reveal in order and count up once per card on hover or tap", async ({ page, isMobile }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const events: string[] = [];
  await page.exposeFunction("recordMetricReveal", (event: string) => events.push(event));
  await page.addInitScript(() => {
    const animate = Element.prototype.animate;
    Element.prototype.animate = function (...args) {
      const animation = animate.apply(this, args);
      if (this.matches(".metric-history")) {
        const record = (window as unknown as { recordMetricReveal(event: string): void }).recordMetricReveal;
        record(this.closest("article")!.getAttribute("aria-labelledby")!);
      }
      return animation;
    };
  });
  await page.goto("/#chapter-01");
  const cards = page.locator("#chapter-01 .metric-card");
  await expect(page.locator(".metric-card[data-reveal-pending]")).toHaveCount(3);
  expect(events).toEqual([]);
  const totals = ["100", "1,912,458", "311,233"];
  const sources = ["/metrics/stackoverflow.svg", "/metrics/ngx-translate.svg", "/metrics/ngx-formly.svg"];

  for (const index of [2, 1]) {
    const card = cards.nth(index);
    const border = await card.evaluate(element => getComputedStyle(element).borderTopColor);
    if (isMobile) await card.tap();
    else await card.hover();
    await expect(card).toHaveAttribute("data-reveal-pending", "");
    await expect(card).toHaveCSS("border-top-color", border);
  }

  for (const index of [0, 1, 2]) {
    const card = cards.nth(index);
    const logo = card.locator(".metric-logo");
    const counter = card.locator("[data-count-to]");
    await expect(logo).toHaveAttribute("src", sources[index]);
    await card.scrollIntoViewIfNeeded();
    await expect(card.locator(".metric-value")).toBeHidden();
    if (isMobile) await card.tap();
    else await card.hover();
    await expect.poll(() => card.evaluate(element => {
      const count = Number(element.querySelector("[data-count-to]")!.textContent!.replaceAll(",", ""));
      return count > 0 && element.querySelector(".metric-logo")!.getAnimations().some(animation => animation.playState === "running");
    }), { intervals: [16, 32, 50] }).toBe(true);
    await expect(counter).toHaveText(totals[index]);
    await expect(card.locator(".metric-history")).toHaveCSS("clip-path", "none");
    const bounds = (await card.boundingBox())!;
    const logoBounds = (await logo.boundingBox())!;
    expect(logoBounds.x).toBeGreaterThan(bounds.x + bounds.width / 2);
    expect(logoBounds.y).toBeLessThan(bounds.y + bounds.height / 2);
    await page.mouse.move(0, 0);
    if (isMobile) await card.tap();
    else await card.hover();
    await expect(counter).toHaveText(totals[index]);
  }

  await page.locator("#chapter-02").evaluate(element => element.scrollIntoView({ behavior: "instant" }));
  await page.locator("#chapter-01").evaluate(element => element.scrollIntoView({ behavior: "instant" }));
  await page.setViewportSize(isMobile ? { width: 1280, height: 800 } : { width: 600, height: 800 });
  await expect(page.locator(".metric-card[data-reveal-pending]")).toHaveCount(0);
  await expect(cards.locator("[data-count-to]")).toHaveText(totals);
  expect(events).toEqual(["stackoverflow-title", "translate-title", "formly-title"]);
});

test("keyboard focus reveals metrics immediately with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#chapter-01");
  const cards = page.locator("#chapter-01 .metric-card");
  for (const card of await cards.all()) {
    await expect(card.locator(".metric-value")).toBeHidden();
    await card.focus();
    await expect(card.locator(".metric-value")).toBeVisible();
    await expect(card.locator(".metric-history")).toBeVisible();
    expect(await card.evaluate(element => element.getAnimations({ subtree: true }).length)).toBe(0);
    const counter = card.locator("[data-count-to]");
    await expect(counter).toHaveText(Number(await counter.getAttribute("data-count-to")).toLocaleString("en-US"));
    await card.press("Tab");
    await expect(card.locator("h3 a, h4 a")).toBeFocused();
  }
});

test("the problem chapter shows the form examples and leads to chapter 03", async ({
  page,
  isMobile,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#chapter-02");
  const chapter = page.locator("#chapter-02");
  const slide = chapter.locator(".chapter-slide").first();
  const runningTitle = chapter.locator(".chapter-running-title");
  const heading = chapter.getByRole("heading", {
    level: 2,
    name: /^02 The Problems/,
  });
  const current = page
    .getByRole("navigation", { name: "Chapter index", exact: true })
    .locator('[aria-current="location"]');
  await expect(heading).toBeInViewport();
  const titleBounds = await heading.boundingBox();
  await expect(current).toHaveAttribute("href", "#chapter-02");
  const gallery = chapter.getByRole("figure", {
    name: "Same fields, different designs",
  });
  await expect(gallery.getByRole("heading", { level: 3 })).toHaveText(
    isMobile ? ["Oblique", "PeriScope"] : ["Oblique", "PeriScope", "SSF-Forms"],
  );
  const challenges = chapter.locator(".form-example + .form-example-challenge");
  await expect(challenges).toHaveText([
    "Ongoing maintenance", "Complexity", "integration",
  ]);
  await expect(challenges.locator("svg path[d]")).toHaveCount(3);
  if (!isMobile) {
    const tops = await challenges.evaluateAll(cards =>
      cards.map(card => card.getBoundingClientRect().top)
    );
    expect(new Set(tops).size).toBe(1);
  }
  const slideHeight = (await slide.boundingBox())!.height;
  const viewportHeight = page.viewportSize()!.height;
  if (isMobile) {
    expect(slideHeight).toBeGreaterThanOrEqual(viewportHeight);
    await chapter
      .getByRole("link", { name: "Continue to SSF-Forms" })
      .click();
    await expect(page).toHaveURL(/#chapter-02-more-examples$/);
    const ssfForms = chapter.getByRole("figure", { name: "SSF-Forms example" });
    await expect(ssfForms).toBeInViewport();
    await expect(ssfForms.getByRole("heading", { level: 3 })).toHaveText("SSF-Forms");
    await expect(heading).toBeInViewport();
    expect(await heading.boundingBox()).toEqual(titleBounds);
    expect((await runningTitle.boundingBox())!.y).toBe(
      (await page.locator(".site-header").boundingBox())!.height,
    );
  } else {
    expect(slideHeight).toBeCloseTo(viewportHeight);
  }
  await expect(chapter.locator(".chapter-slide")).toHaveCount(isMobile ? 2 : 1);
  await expect(current).toHaveAttribute("href", "#chapter-02");
  expect(
    await chapter
      .locator(".form-example")
      .evaluateAll((elements) =>
        elements.every((element) => {
          const { left, right } = element.getBoundingClientRect();
          return (
            left >= 0 &&
            right <= window.innerWidth &&
            element.scrollWidth <= element.clientWidth
          );
        }),
      ),
  ).toBe(true);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);

  if (isMobile)
    await page
      .locator("#chapter-02-more-examples")
      .getByRole("link", { name: "Previous slide" })
      .click();
  await expect(page).toHaveURL(/#chapter-02$/);
  await expect(heading).toBeInViewport();
  expect(await heading.boundingBox()).toEqual(titleBounds);
  await chapter.getByRole("link", { name: "Previous: 01" }).click();
  await expect(page.locator("#title-01")).toBeInViewport();
  await page
    .locator("#chapter-01")
    .getByRole("link", { name: "Next: 02" })
    .click();
  await expect(chapter.getByRole("heading", { level: 2 })).toBeInViewport();
  if (isMobile) {
    await page.goto("/?slide=custom#chapter-02-more-examples");
    await expect(heading).toBeInViewport();
    await expect
      .poll(async () =>
        Math.abs((await page.locator("#chapter-02-more-examples").boundingBox())!.y),
      )
      .toBeLessThanOrEqual(1);
  }
  await chapter.getByRole("link", { name: "Next: 03" }).click();
  await expect(page.locator("#title-03")).toBeInViewport();
  await expect(current).toHaveAttribute("href", "#chapter-03");
});

test("scrolling settles on the nearest slide within a chapter", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#chapter-02");
  const slides = page.locator("#chapter-02 .chapter-slide");
  await expect(slides).toHaveCount(2);
  const [start, next] = await slides.evaluateAll((elements) =>
    elements.map(
      (element) => element.getBoundingClientRect().top + window.scrollY,
    ),
  );

  for (const [fraction, expected] of [
    [0.35, start],
    [0.65, next],
  ]) {
    await page.evaluate(
      (top) => window.scrollTo({ top, behavior: "instant" }),
      start + (next - start) * fraction,
    );
    await expect
      .poll(() =>
        page.evaluate((top) => Math.abs(window.scrollY - top), expected),
      )
      .toBeLessThanOrEqual(1);
  }
});

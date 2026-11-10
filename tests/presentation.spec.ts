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

test("all numbered chapters are reachable and extras can be skipped", async ({
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
  await expect(index.getByRole("link")).toHaveCount(10);
  await expect(page.locator("#chapter-10")).toHaveCount(0);
  await expect(
    page.locator("#chapter-09").getByRole("link", { name: "Next: 11" }),
  ).toHaveAttribute("href", "#chapter-11");
  await expect(
    page.locator("#chapter-11").getByRole("link", { name: "Previous: 09" }),
  ).toHaveAttribute("href", "#chapter-09");
  for (const href of await index
    .getByRole("link")
    .evaluateAll((links) => links.map((link) => link.getAttribute("href")))) {
    await expect(page.locator(href!)).toHaveCount(1);
  }

  await index.getByRole("link", { name: /08 A shared approach/ }).click();
  const chapter = page.getByRole("region", {
    name: "08 A shared approach at BIT",
  });
  await chapter.getByRole("link", { name: "Skip extras" }).click();
  await expect(page).toHaveURL(/#chapter-11$/);
  await expect(page.getByRole("heading", { name: "11 Q&A" })).toBeInViewport();
  await page
    .getByRole("region", { name: "11 Q&A" })
    .getByRole("link", { name: "Back to overview" })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toBeInViewport();
  expect(errors).toEqual([]);
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
  await page.goto("/#chapter-09");
  await expect(
    page.getByRole("heading", { name: "09 Multilingual forms" }),
  ).toBeInViewport();
  await expect(page.locator("#chapter-09")).toContainText("Optional extra");
  await expect(page.locator("#chapter-09 .chapter-content")).toHaveCSS(
    "transform",
    "none",
  );
  await expect(page.locator("html")).toHaveCSS("scroll-behavior", "auto");
  await expect(
    page
      .getByRole("navigation", { name: "Chapter index", exact: true })
      .locator('[aria-current="location"]'),
  ).toContainText("Multilingual forms");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  expect(hydrationErrors).toEqual([]);
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
  await expect(first.locator(".index-time")).toHaveText("2 min");
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
  for (const chart of await chapter.locator(".metric-history").all()) {
    await expect(chart).toHaveCSS("clip-path", "none");
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

test("the metric charts reveal in order on first entry only", async ({
  page,
  isMobile,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const events: string[] = [];
  await page.exposeFunction("recordMetricReveal", (event: string) =>
    events.push(event),
  );
  await page.addInitScript(() => {
    const record = (
      window as unknown as { recordMetricReveal(event: string): void }
    ).recordMetricReveal;
    const animate = Element.prototype.animate;
    Element.prototype.animate = function (...args) {
      const animation = animate.apply(this, args);
      if (this instanceof HTMLImageElement && this.matches(".metric-history")) {
        const chart = this.closest("article")!.getAttribute("aria-labelledby");
        record(`start ${chart}`);
        animation.addEventListener("finish", () => record(`finish ${chart}`));
      }
      return animation;
    };
  });
  await page.goto("/");
  const charts = page.locator("#chapter-01 .metric-history");
  await expect(charts.last()).toHaveCSS("clip-path", "inset(0px 100% 0px 0px)");
  expect(events).toEqual([]);

  await page
    .locator("#chapter-01")
    .evaluate((slide) => slide.scrollIntoView({ behavior: "instant" }));
  await expect
    .poll(() => events.slice(0, 2))
    .toEqual(["start stackoverflow-title", "finish stackoverflow-title"]);
  if (isMobile) {
    await expect(charts.last()).toHaveCSS(
      "clip-path",
      "inset(0px 100% 0px 0px)",
    );
    await page
      .locator("#chapter-01-continued")
      .evaluate((slide) => slide.scrollIntoView({ behavior: "instant" }));
  }

  const sequence = [
    "stackoverflow-title",
    "translate-title",
    "formly-title",
  ].flatMap((chart) => [`start ${chart}`, `finish ${chart}`]);
  await expect.poll(() => events).toEqual(sequence);
  for (const id of [
    "chapter-02",
    "chapter-01",
    ...(isMobile ? ["chapter-01-continued"] : []),
  ]) {
    await page
      .locator(`#${id}`)
      .evaluate((slide) => slide.scrollIntoView({ behavior: "instant" }));
    await expect(page.locator(`#${id}`)).toBeInViewport();
  }
  for (const chart of await charts.all())
    await expect(chart).toHaveCSS("clip-path", "none");
  expect(events).toEqual(sequence);
});

test("the problem chapter stays active from the form examples through the shared requirements", async ({
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
    name: "02 The Problems",
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
  await expect(gallery.getByRole("heading", { level: 3 })).toHaveCount(
    isMobile ? 2 : 3,
  );
  expect((await slide.boundingBox())!.height).toBeCloseTo(
    page.viewportSize()!.height,
  );
  if (isMobile) {
    await chapter
      .getByRole("link", { name: "Continue to custom example" })
      .click();
    await expect(page).toHaveURL(/#chapter-02-more-examples$/);
    await expect(
      chapter.getByRole("figure", { name: "Custom form example" }),
    ).toBeInViewport();
  }
  await chapter.getByRole("link", { name: "Continue to requirements" }).click();
  await expect(page).toHaveURL(/#chapter-02-continued$/);
  await expect(heading).toBeInViewport();
  expect(await heading.boundingBox()).toEqual(titleBounds);
  expect((await runningTitle.boundingBox())!.y).toBe(
    (await page.locator(".site-header").boundingBox())!.height,
  );
  const requirements = chapter.getByRole("region", {
    name: "But also...",
  });
  await requirements.scrollIntoViewIfNeeded();
  await expect(
    requirements.getByRole("button", {
      name: "Show solution: Different designs",
      exact: true,
    }),
  ).toBeInViewport();
  await expect(current).toHaveAttribute("href", "#chapter-02");
  expect(
    await chapter
      .locator(".form-example, .problem-card")
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

  await page
    .locator("#chapter-02-continued")
    .getByRole("link", { name: "Previous slide" })
    .click();
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
  await page.goto("/?slide=requirements#chapter-02-continued");
  await expect(heading).toBeInViewport();
  await expect
    .poll(async () =>
      Math.abs((await page.locator("#chapter-02-continued").boundingBox())!.y),
    )
    .toBeLessThanOrEqual(1);
  await chapter.getByRole("link", { name: "Next: 03" }).click();
  await expect(page.locator("#title-03")).toBeInViewport();
  await expect(current).toHaveAttribute("href", "#chapter-03");
});

for (const reducedMotion of ["reduce", "no-preference"] as const) {
  test(`revisiting solutions keeps their order and the current panel open with ${reducedMotion} motion`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion });
    await page.goto("/#chapter-02-continued");
    await expect(
      page.getByRole("button", { name: "Start presentation timer" }),
    ).toBeEnabled();
    const problems = page.getByRole("region", { name: "But also..." });
    const toggles = problems.locator(".problem-pillars").getByRole("button");
    const solution = problems.locator(".problem-solution");

    for (const index of [2, 0, 1]) {
      await toggles.nth(index).click();
      await expect(toggles.nth(index)).toHaveAttribute("aria-expanded", "true");
    }

    const answers = [
      "Open source & shared maintenance",
      "Material · Bootstrap · PrimeNG",
      "Core · MCP · Builder",
    ];
    for (const index of [0, 1, 2]) {
      const history = problems.locator(".problem-solution-history");
      await expect(history.locator(".problem-icon")).toHaveCount(2);
      const button = history.getByRole("button", {
        name: answers[index],
        exact: true,
      });
      const icon = button.locator(".problem-icon");
      await expect(icon).toBeVisible();
      await expect(button).toHaveAttribute("aria-expanded", "false");
      const iconPath = await icon.locator("path").getAttribute("d");
      if (index === 0) {
        await button.scrollIntoViewIfNeeded();
        const bounds = (await icon.boundingBox())!;
        await page.mouse.click(
          bounds.x + bounds.width / 2,
          bounds.y + bounds.height / 2,
        );
      } else {
        await button.press(index === 1 ? "Enter" : "Space");
      }
      await expect(solution.locator(".problem-solution-page")).toHaveCount(1);
      await expect(solution.getByRole("heading", { level: 4 })).toHaveText(
        answers[index],
      );
      await expect(solution.locator(".problem-icon path")).toHaveAttribute(
        "d",
        iconPath!,
      );
      await expect(problems.locator(".problem-result")).toBeFocused();
      const positions = await problems
        .locator(".problem-solution-history li, .problem-solution")
        .evaluateAll((elements) =>
          elements
            .sort(
              (a, b) =>
                a.getBoundingClientRect().top - b.getBoundingClientRect().top,
            )
            .map(
              (element) =>
                element.querySelector("h4")?.textContent ?? element.textContent,
            ),
        );
      expect(positions).toEqual(answers);
      await toggles.nth(index).press("Enter");
      await expect(toggles.nth(index)).toHaveAttribute("aria-expanded", "true");
      await expect(solution).toHaveCount(1);
    }
  });

  test(`solution pages slide within the card with ${reducedMotion} motion`, async ({
    page,
  }) => {
    await page.clock.install();
    await page.emulateMedia({ reducedMotion });
    await page.goto("/#chapter-02-continued");
    await expect(
      page.getByRole("button", { name: "Start presentation timer" }),
    ).toBeEnabled();
    const problems = page.getByRole("region", { name: "But also..." });
    const toggles = problems.locator(".problem-pillars").getByRole("button");
    const solution = problems.locator(".problem-solution");
    const pages = solution.locator(".problem-solution-page");
    await toggles.first().click();
    await expect(solution.getByRole("heading", { level: 4 })).toHaveText(
      "Open source & shared maintenance",
    );
    await expect(solution).toHaveCSS("overflow", "hidden");
    await page.clock.pauseAt(await page.evaluate(() => Date.now() + 1000));

    for (const index of [1, 0]) {
      await toggles
        .nth(index)
        .evaluate((button: HTMLButtonElement) => button.click());
      await expect(toggles.nth(index)).toHaveAttribute("aria-expanded", "true");
      await page.clock.runFor(100);
      const current = solution.locator(
        ".problem-solution-page[aria-hidden='false']",
      );
      const outgoing = solution.locator(
        ".problem-solution-page[aria-hidden='true']",
      );
      if (reducedMotion === "reduce") {
        await expect(pages).toHaveCount(1);
        await expect(current).toHaveCSS("transform", "none");
      } else {
        await expect(pages).toHaveCount(2);
        await expect(outgoing).toHaveAttribute("inert", "");
        const incomingY = await current.evaluate(
          (element) =>
            new DOMMatrixReadOnly(getComputedStyle(element).transform).m42,
        );
        const outgoingY = await outgoing.evaluate(
          (element) =>
            new DOMMatrixReadOnly(getComputedStyle(element).transform).m42,
        );
        expect(incomingY * (index === 1 ? 1 : -1)).toBeGreaterThan(0);
        expect(outgoingY * (index === 1 ? 1 : -1)).toBeLessThan(0);
        await expect(solution.getByRole("heading", { level: 4 })).toHaveCount(
          1,
        );
      }
      await page.clock.runFor(500);
      await expect(pages).toHaveCount(1);
      await expect(pages).toHaveCSS("transform", "none");
    }

    for (const index of [2, 1, 0]) {
      await toggles
        .nth(index)
        .evaluate((button: HTMLButtonElement) => button.click());
      await expect(toggles.nth(index)).toHaveAttribute("aria-expanded", "true");
      await page.clock.runFor(50);
    }
    await page.clock.runFor(500);
    await expect(pages).toHaveCount(1);
    await expect(solution.getByRole("heading", { level: 4 })).toHaveText(
      "Open source & shared maintenance",
    );
    await expect(pages).toHaveCSS("transform", "none");
  });

  test(`problem cards share one solution panel with ${reducedMotion} motion`, async ({
    page,
    isMobile,
  }) => {
    await page.emulateMedia({ reducedMotion });
    await page.goto("/#chapter-02-continued");
    await expect(
      page.getByRole("button", { name: "Start presentation timer" }),
    ).toBeEnabled();
    const problems = page.getByRole("region", { name: "But also..." });
    const toggles = problems.locator(".problem-pillars").getByRole("button");
    const solution = problems.locator(".problem-solution");
    const heading = page
      .locator("#chapter-02")
      .getByRole("heading", { level: 2 });
    const history = problems.getByRole("list", {
      name: "Previously shown solutions",
    });
    const titles = history.getByRole("listitem");
    await expect(heading).toHaveAccessibleName("02 The Problems");
    await expect(toggles).toHaveText([
      "Ongoing cost",
      "Different designs",
      "Repeated work",
    ]);
    await expect(solution).toHaveCount(0);
    await expect(history).toHaveCount(0);
    await expect(problems.locator(".problem-description:visible")).toHaveCount(
      3,
    );

    const first = toggles.first();
    const firstCard = problems.locator(".problem-card").first();
    const originalSize = (await firstCard.boundingBox())!;
    await first.click();
    await expect(heading).toHaveAccessibleName("02 The Solutions");
    const selectedSize = (await firstCard.boundingBox())!;
    expect(selectedSize.width).toBeCloseTo(originalSize.width);
    expect(selectedSize.height).toBeCloseTo(originalSize.height);
    await expect(firstCard.locator(".problem-icon")).toHaveCount(0);
    await expect(first).toHaveAccessibleName("Show solution: Ongoing cost");
    await expect(first).toHaveAttribute("aria-expanded", "true");
    await expect(firstCard).toHaveCSS("background-color", "rgb(238, 235, 229)");
    await expect(history).toHaveCount(0);
    await expect(problems.locator(".problem-description:visible")).toHaveCount(
      3,
    );
    await expect(solution).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await expect(solution).toHaveCSS("border-top-color", "rgb(79, 107, 82)");
    await expect(solution).toHaveCSS("border-top-width", "2px");
    await expect(solution.getByRole("heading", { level: 4 })).toHaveText(
      "Open source & shared maintenance",
    );
    await expect(
      solution.getByRole("list", { name: "Core team" }).getByRole("listitem"),
    ).toHaveCount(7);
    await expect(
      solution
        .getByRole("list", { name: "Community contributors" })
        .getByRole("listitem"),
    ).toHaveCount(100);
    await expect(
      solution.getByRole("link", { name: "107 contributors" }),
    ).toBeVisible();

    const cards = (await problems.locator(".problem-pillars").boundingBox())!;
    const panel = (await solution.boundingBox())!;
    if (isMobile) {
      expect(panel.x).toBeCloseTo(cards.x);
      expect(panel.y).toBeGreaterThan(cards.y + cards.height);
    } else {
      expect(panel.x).toBeGreaterThan(cards.x + cards.width);
      expect(panel.y).toBeCloseTo(cards.y);
      expect(panel.height).toBeCloseTo(cards.height);
      const content = solution.getByRole("region", {
        name: "Open source & shared maintenance",
      });
      expect(
        await content.evaluate((element) => element.scrollHeight),
      ).toBeGreaterThan(
        await content.evaluate((element) => element.clientHeight),
      );
      await content.press("End");
      await expect
        .poll(() => content.evaluate((element) => element.scrollTop))
        .toBeGreaterThan(0);
    }
    const solutionIcon = solution.locator(".problem-icon");
    await expect
      .poll(async () => {
        const icon = (await solutionIcon.boundingBox())!;
        const panel = (await solution.boundingBox())!;
        return panel.x + panel.width - (icon.x + icon.width);
      })
      .toBeCloseTo((isMobile ? 12 : 20) + 2, 0);
    if (reducedMotion === "reduce") {
      await expect(solution).toHaveCSS("animation-name", "none");
    }

    await toggles.last().press("Enter");
    await expect(heading).toHaveAccessibleName("02 The Solutions");
    await expect(problems.locator(".problem-description:visible")).toHaveCount(
      3,
    );
    await expect(first).toHaveAttribute("aria-expanded", "false");
    await expect(firstCard).toHaveCSS("background-color", "rgb(238, 235, 229)");
    await expect(titles).toHaveText(["Open source & shared maintenance"]);
    const historyBounds = (await history.boundingBox())!;
    expect(historyBounds.y + historyBounds.height).toBeLessThan(
      (await solution.boundingBox())!.y,
    );
    await expect(solution.getByRole("heading", { level: 4 })).toHaveText(
      "Core · MCP · Builder",
    );
    await toggles.nth(1).click();
    await expect(heading).toHaveAccessibleName("02 The Solutions");
    await expect(problems.locator(".problem-description:visible")).toHaveCount(
      3,
    );
    await expect(problems.getByRole("button", { expanded: true })).toHaveCount(
      1,
    );
    await expect(solution.getByRole("heading", { level: 4 })).toHaveText(
      "Material · Bootstrap · PrimeNG",
    );
    await expect(titles).toHaveText([
      "Open source & shared maintenance",
      "Core · MCP · Builder",
    ]);
    for (const card of await problems.locator(".problem-card").all()) {
      await expect(card).toHaveCSS("background-color", "rgb(238, 235, 229)");
    }
    const oblique = solution.getByRole("link", { name: "Oblique compatible" });
    await expect(oblique).toHaveAttribute(
      "href",
      "https://oblique.bit.admin.ch/introductions/welcome",
    );
    await expect(oblique.locator("img")).toBeVisible();
    expect(
      await oblique
        .locator("img")
        .evaluate(
          (image: HTMLImageElement) => image.complete && image.naturalWidth > 0,
        ),
    ).toBe(true);
    const checkmark = oblique.locator(".oblique-checkmark");
    await expect(checkmark.locator("path")).toHaveCSS(
      "animation-name",
      reducedMotion === "reduce" ? "none" : "checkmark-draw",
    );
    await expect(checkmark.locator("path")).toHaveCSS(
      "stroke-dashoffset",
      "0px",
    );
    const logoBounds = (await oblique.locator("img").boundingBox())!;
    const checkBounds = (await checkmark.boundingBox())!;
    expect(checkBounds.x).toBeGreaterThan(logoBounds.x + logoBounds.width / 2);
    expect(checkBounds.y).toBeLessThan(logoBounds.y);
    await oblique.focus();
    await expect(oblique).toBeFocused();
    await toggles.nth(1).press("Space");
    await expect(heading).toHaveAccessibleName("02 The Solutions");
    await expect(solution).toHaveCount(1);
    await expect(toggles.nth(1)).toHaveAttribute("aria-expanded", "true");
    await expect(problems.locator(".problem-description:visible")).toHaveCount(
      3,
    );
    await expect(problems.locator(".problem-card .problem-icon")).toHaveCount(
      2,
    );
    await toggles.nth(1).click();
    await expect(checkmark.locator("path")).toHaveCSS(
      "stroke-dashoffset",
      "0px",
    );
    await expect(titles).toHaveText([
      "Open source & shared maintenance",
      "Core · MCP · Builder",
    ]);
    await first.click();
    await expect(solution.getByRole("heading", { level: 4 })).toHaveText(
      "Open source & shared maintenance",
    );
    await expect(titles).toHaveText([
      "Material · Bootstrap · PrimeNG",
      "Core · MCP · Builder",
    ]);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(page.viewportSize()!.width);
  });
}

test("scrolling settles on the nearest slide within a chapter", async ({
  page,
  isMobile,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#chapter-02");
  const slides = page.locator("#chapter-02 .chapter-slide");
  await expect(slides).toHaveCount(isMobile ? 3 : 2);
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

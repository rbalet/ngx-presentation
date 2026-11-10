import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { MotionConfig } from "motion/react";
import { restoreTheme } from "../components/theme-toggle";
import styles from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Why are we still rebuilding the same forms? | ngx-formly" },
      {
        name: "description",
        content:
          "Extensive form manipulation with ngx-formly, a unified approach. A presentation by Raphaël Balet for BIT.",
      },
    ],
    links: [
      { rel: "stylesheet", href: styles },
      { rel: "icon", href: "/formly.svg", type: "image/svg+xml" },
    ],
  }),
  component: Root,
  notFoundComponent: () => (
    <main className="not-found">
      <h1>Page not found</h1>
      <a href="/">Open the presentation</a>
    </main>
  ),
});

function Root() {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: restoreTheme }} />
        <HeadContent />
      </head>
      <body>
        <MotionConfig reducedMotion="user">
          <Outlet />
        </MotionConfig>
        <Scripts />
      </body>
    </html>
  );
}

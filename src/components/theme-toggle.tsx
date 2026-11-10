import { useLayoutEffect, useState } from "react";

const themeStorageKey = "ngx-presentation-theme";

export const restoreTheme = `try {
  if (localStorage.getItem("${themeStorageKey}") === "dark") {
    document.documentElement.dataset.theme = "dark";
  }
} catch {}`;

export function ThemeToggle() {
  const [dark, setDark] = useState<boolean>();

  useLayoutEffect(() => {
    setDark(document.documentElement.dataset.theme === "dark");
  }, []);

  const toggle = () => {
    const theme = dark ? "light" : "dark";
    document.documentElement.dataset.theme = theme;
    setDark(!dark);
    try {
      localStorage.setItem(themeStorageKey, theme);
    } catch {
      // Keep the selected theme for this visit when storage is unavailable.
    }
  };

  return (
    <button
      type="button"
      className="theme-toggle"
      disabled={dark === undefined}
      aria-label="Dark mode"
      aria-pressed={dark}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggle}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {dark ? (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M19 5l-1.5 1.5m-11 11L5 19" />
          </>
        ) : (
          <path d="M20.9 13.35A9 9 0 0 1 10.65 3.1 9 9 0 1 0 20.9 13.35Z" />
        )}
      </svg>
    </button>
  );
}

import type { ReactNode } from "react";

export function ChapterTitle({
  number,
  title,
  subtitle,
}: {
  number: string;
  title: string;
  subtitle?: ReactNode;
}) {
  return (
    <h2 id={`title-${number}`}>
      <span className="chapter-number">{number}</span>
      <span>
        {title}
        {subtitle && <p className="chapter-subtitle">{subtitle}</p>}
      </span>
    </h2>
  );
}

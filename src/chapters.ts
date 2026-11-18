export type Chapter = {
  number: string;
  displayNumber: string;
  title: string;
  subtitle?: string;
  minutes: number;
  kind: "main" | "discussion";
  summary: string;
};

// Keep chapter numbers stable for existing links.
const chapterDefinitions: Omit<Chapter, "displayNumber">[] = [
  {
    number: "01",
    title: "chapters.01.title",
    minutes: 3,
    kind: "main",
    summary: "chapters.01.summary",
  },
  {
    number: "02",
    title: "chapters.02.title",
    minutes: 5,
    kind: "main",
    summary: "chapters.02.summary",
  },
  {
    number: "03",
    title: "chapters.03.title",
    minutes: 7,
    kind: "main",
    summary: "chapters.03.summary",
  },
  {
    number: "04",
    title: "chapters.04.title",
    minutes: 4,
    kind: "main",
    summary: "chapters.04.summary",
  },
  {
    number: "05",
    title: "chapters.05.title",
    minutes: 6,
    kind: "main",
    summary: "chapters.05.summary",
  },
  {
    number: "06",
    title: "chapters.06.title",
    minutes: 4,
    kind: "main",
    summary: "chapters.06.summary",
  },
  {
    number: "07",
    title: "chapters.07.title",
    minutes: 8,
    kind: "main",
    summary: "chapters.07.summary",
  },
  {
    number: "12",
    title: "chapters.12.title",
    minutes: 3,
    kind: "main",
    summary: "chapters.12.summary",
  },
  {
    number: "11",
    title: "chapters.11.title",
    minutes: 15,
    kind: "discussion",
    summary: "chapters.11.summary",
  },
];

export const chapters: Chapter[] = chapterDefinitions.map((chapter, index) => ({
  ...chapter,
  displayNumber: (index + 1).toString().padStart(2, "0"),
}));

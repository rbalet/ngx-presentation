export type Chapter = {
  number: string;
  title: string;
  subtitle?: string;
  minutes: number;
  kind: "main" | "extra" | "discussion";
  summary: string;
};

// Keep these numbers stable so each chapter can be discussed and edited independently.
export const chapters: Chapter[] = [
  {
    number: "01",
    title: "About me",
    subtitle: "And my vanity metrics",
    minutes: 2,
    kind: "main",
    summary:
      "Raphaël Balet. Expert Developer at BIT, Stack Overflow contributor and open-source maintainer.",
  },
  {
    number: "02",
    title: "The Problems",
    minutes: 5,
    kind: "main",
    summary:
      "Familiar forms, different stacks. Share the cost and maintenance with an open-source, extensible approach that adapts to each design.",
  },
  {
    number: "03",
    title: "Meet ngx-formly",
    minutes: 7,
    kind: "main",
    summary:
      "Describe a form as configuration. Reuse field components and validation across applications.",
  },
  {
    number: "04",
    title: "MCP & WebMCP",
    minutes: 4,
    kind: "main",
    summary:
      "Help AI assistants create forms and interact with them in the browser.",
  },
  {
    number: "05",
    title: "Playground",
    minutes: 6,
    kind: "main",
    summary:
      "Build a form, change its rules, preview the result and export its configuration.",
  },
  {
    number: "06",
    title: "API & validation",
    minutes: 4,
    kind: "main",
    summary:
      "Connect form validation to the API and show useful feedback where people need it.",
  },
  {
    number: "07",
    title: "Periscope",
    minutes: 8,
    kind: "main",
    summary:
      "Our event, workflow and survey tool. One real form, from configuration to submission.",
  },
  {
    number: "08",
    title: "A shared approach at BIT",
    minutes: 2,
    kind: "main",
    summary:
      "Start with one use case, agree who owns the shared components and demonstrate reuse in another application.",
  },
  {
    number: "09",
    title: "Multilingual forms",
    minutes: 4,
    kind: "extra",
    summary:
      "Translate labels and validation messages with ngx-translate while keeping the form model stable.",
  },
  {
    number: "11",
    title: "Q&A",
    minutes: 15,
    kind: "discussion",
    summary: "Which form behavior should we maintain together?",
  },
];

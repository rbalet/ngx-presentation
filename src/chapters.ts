export type Chapter = {
  number: string;
  title: string;
  minutes: number;
  kind: 'main' | 'extra' | 'discussion';
  summary: string;
};

// Keep these numbers stable so each chapter can be discussed and edited independently.
export const chapters: Chapter[] = [
  {
    number: '01', title: 'Background', minutes: 2, kind: 'main',
    summary: 'Raphaël Balet. Expert Front-end Developer at BIT and member of the ngx-formly core team.',
  },
  {
    number: '02', title: 'The problem', minutes: 5, kind: 'main',
    summary: 'Teams keep implementing the same form behavior, validation rules and API integration.',
  },
  {
    number: '03', title: 'Meet ngx-formly', minutes: 7, kind: 'main',
    summary: 'Describe a form as configuration. Reuse field components and validation across applications.',
  },
  {
    number: '04', title: 'MCP & WebMCP', minutes: 4, kind: 'main',
    summary: 'Help AI assistants create forms and interact with them in the browser.',
  },
  {
    number: '05', title: 'Playground', minutes: 6, kind: 'main',
    summary: 'Build a form, change its rules, preview the result and export its configuration.',
  },
  {
    number: '06', title: 'API & validation', minutes: 4, kind: 'main',
    summary: 'Connect form validation to the API and show useful feedback where people need it.',
  },
  {
    number: '07', title: 'Periscope', minutes: 8, kind: 'main',
    summary: 'Our event, workflow and survey tool. One real form, from configuration to submission.',
  },
  {
    number: '08', title: 'A shared approach at BIT', minutes: 2, kind: 'main',
    summary: 'Start with one use case, agree who owns the shared components and demonstrate reuse in another application.',
  },
  {
    number: '09', title: 'Multilingual forms', minutes: 4, kind: 'extra',
    summary: 'Translate labels and validation messages with ngx-translate while keeping the form model stable.',
  },
  {
    number: '10', title: 'Portless', minutes: 3, kind: 'extra',
    summary: 'Use named local URLs to move between development projects.',
  },
  {
    number: '11', title: 'Q&A', minutes: 15, kind: 'discussion',
    summary: 'Which form behavior should we maintain together?',
  },
];

export const minutesFor = (kind: Chapter['kind']) =>
  chapters.filter((chapter) => chapter.kind === kind).reduce((minutes, chapter) => minutes + chapter.minutes, 0);

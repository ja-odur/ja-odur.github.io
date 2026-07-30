export interface SkillGroup {
  label: string;
  /** rendered as a hint in machine mode */
  confidence: number;
  items: string[];
}

export const skills: SkillGroup[] = [
  {
    label: 'Languages',
    confidence: 0.95,
    items: ['Python', 'TypeScript / JavaScript', 'Go', 'SQL', 'Bash'],
  },
  {
    label: 'Backend',
    confidence: 0.98,
    items: [
      'Django & DRF',
      'Flask',
      'GraphQL (Graphene)',
      'REST API design',
      'Microservices',
      'Event-driven systems',
    ],
  },
  {
    label: 'Data & Infrastructure',
    confidence: 0.9,
    items: ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Docker', 'GCP', 'AWS', 'CI/CD'],
  },
  {
    label: 'Frontend',
    confidence: 0.62,
    items: ['React', 'Redux', 'D3.js', 'Astro'],
  },
];

export const education = [
  {
    institution: 'Makerere University',
    course: 'BSc. Telecommunications Engineering',
    period: '2014 — 2019',
  },
  {
    institution: "St. Mary's College, Kisubi",
    course: 'A-Level',
    period: '2012 — 2013',
  },
];

export const interests = [
  'Puzzles & board games (ask about Sudoku)',
  'Continuous learning',
  'Films & documentaries',
  'Soccer',
];

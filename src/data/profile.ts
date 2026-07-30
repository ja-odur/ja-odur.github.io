export const profile = {
  name: 'Joseph Odur',
  alias: 'ja-odur',
  title: 'Senior Software Engineer',
  company: 'Onafriq',
  location: 'Kampala, Uganda',
  timezone: 'UTC+3',
  email: 'odurjoseph8@gmail.com',
  github: 'https://github.com/ja-odur',
  githubHandle: 'ja-odur',
  site: 'https://www.odurjoseph.com',
  repo: 'https://github.com/ja-odur/ja-odur.github.io',
  /** first shipped production code (MTN internship) */
  careerStart: 2016,
  /** full-time software engineering */
  professionalStart: 2018,

  tagline:
    'Backend engineer working on payment infrastructure. I design APIs and distributed systems, and I care about the parts users never see.',

  summary: [
    'I build the server side of things: payment gateways, public APIs, data-heavy platforms, and the services that hold them together. For the last few years that has meant cross-border payment infrastructure at Onafriq (formerly MFS Africa), where I lead backend delivery for Beyonic, a payment gateway used by small businesses.',
    'Before that I worked on air-quality monitoring systems at AirQo, engineering analytics at GitPrime (now Pluralsight Flow), and product teams at Andela. The common thread: systems that move real data for real people, built to be understood by whoever maintains them next.',
  ],

  focus: [
    'Payments & fintech infrastructure',
    'API design (REST & GraphQL)',
    'Distributed systems & microservices',
    'Database performance',
  ],
} as const;

export function yearsOfExperience(): number {
  return new Date().getFullYear() - profile.professionalStart;
}

export interface Role {
  title: string;
  period: string;
  bullets: string[];
}

export interface Experience {
  company: string;
  location: string;
  period: string;
  /** one-line framing of what the company does */
  summary: string;
  roles: Role[];
  stack: string[];
  /** shown on the home page highlights */
  highlight?: string;
}

export const experience: Experience[] = [
  {
    company: 'Onafriq (formerly MFS Africa)',
    location: 'Kampala, Uganda',
    period: 'Feb 2022 — present',
    summary:
      'Onafriq runs one of Africa’s largest payment networks, connecting mobile wallets, banks, and card schemes across the continent for cross-border payments.',
    highlight:
      'Leading backend delivery for Beyonic, a payment gateway for small businesses.',
    roles: [
      {
        title: 'Senior Software Engineer — Beyonic',
        period: 'Apr 2023 — present',
        bullets: [
          'Lead backend delivery for Beyonic, a digital payment gateway that lets small businesses accept payments by link, QR code, or in person.',
          'Drive down technical debt across the microservice fleet — improving inter-service communication, performance, and the security posture of the platform.',
          'Act as the backend point of contact for frontend, QA, design, and operations teams, unblocking integrations and tracing issues across service boundaries.',
          'Contribute to product direction, turning payment-flow ideas into shippable backend designs.',
        ],
      },
      {
        title: 'Software Engineer — Beyonic',
        period: 'Feb 2022 — Mar 2023',
        bullets: [
          'Helped run the Beyonic backend on Google Cloud Platform, from service design to deployment.',
          'Made microservices easier to test by extending the internal API-mocking library used across teams.',
          'Reviewed code across the backend and onboarded new engineers onto the platform.',
        ],
      },
    ],
    stack: ['Python', 'Django', 'DRF', 'Microservices', 'GCP', 'PostgreSQL'],
  },
  {
    company: 'AirQo',
    location: 'Kampala, Uganda',
    period: 'Aug 2020 — Jul 2022',
    summary:
      'AirQo is Africa’s leading air-quality monitoring network, using low-cost sensors and machine learning to close the air-quality data gap across the continent.',
    highlight:
      'Owned NetManager, the platform for monitoring sensor networks and visualizing air-quality data.',
    roles: [
      {
        title: 'Software Engineer (part-time)',
        period: 'Jan 2022 — Jul 2022',
        bullets: [
          'Guided the redesign and re-platforming of the AirQo website.',
          'Led the split of the NetManager monolith into focused applications, including a standalone device-calibration service.',
          'Advanced the AirQloud dashboards, grouping monitoring devices by geography so analysts could reason about air quality at different scales.',
        ],
      },
      {
        title: 'Software Engineer',
        period: 'Aug 2020 — Jan 2022',
        bullets: [
          'Owned the NetManager platform end to end: device monitoring plus air-quality visualization through heatmaps and charts.',
          'Worked with the data-science team to integrate sensor-calibration models and heatmap rendering into the platform.',
          'Made the platform fully responsive, which let the hardware team run it from the field.',
          'Improved the existing microservice architecture and steered externally outsourced tools to completion.',
          'Trained local “AirQommunity” champions to use AirQo tools for air-quality awareness campaigns.',
        ],
      },
    ],
    stack: ['Python', 'Node.js', 'MongoDB', 'Redis', 'GCP', 'D3.js', 'Mapbox'],
  },
  {
    company: 'GitPrime / Pluralsight Flow',
    location: 'Remote — Farmington, USA',
    period: 'Aug 2019 — Feb 2020',
    summary:
      'GitPrime (acquired by Pluralsight) turns data from git hosts, ticketing systems, and cloud platforms into engineering insights and reports.',
    highlight:
      'Optimized the queries and APIs behind engineering-analytics reports over very large git datasets.',
    roles: [
      {
        title: 'Software Engineer (contract)',
        period: 'Aug 2019 — Feb 2020',
        bullets: [
          'Found and rewrote slow queries behind customer-facing reports, cutting report generation time on large datasets.',
          'Introduced partition-based queries to keep API endpoints fast for customers with extensive git history.',
          'Built a repository-inspection interface so support engineers could reproduce and diagnose customer repo issues.',
          'Added deferred and advanced filtering so complex backend filter logic mapped cleanly onto API query parameters.',
        ],
      },
    ],
    stack: ['Python', 'Django', 'PostgreSQL', 'React', 'Redux', 'Redis'],
  },
  {
    company: 'Andela',
    location: 'Kampala, Uganda',
    period: 'Jun 2018 — Jun 2020',
    summary:
      'Andela builds high-performing distributed engineering teams with Africa’s most talented software engineers.',
    highlight:
      'Built internal products — inventory, catering, and publishing platforms — across the full stack.',
    roles: [
      {
        title: 'Software Engineer',
        period: 'Jun 2018 — Jun 2020',
        bullets: [
          'Activo (asset management): implemented role-based access control over company resources and documented the API with Swagger.',
          'AndelaEats (catering platform): integrated authentication with the company-wide login system and added NFC card support so caterers could pull up an order with a card swipe.',
          'Authors Haven (publishing platform): served as Technical Team Lead for a team of engineers, responsible for architecture and engineering practices.',
        ],
      },
    ],
    stack: ['Python', 'Flask', 'Django', 'PostgreSQL', 'Redis', 'React', 'Docker'],
  },
  {
    company: 'MTN Uganda',
    location: 'Kampala, Uganda',
    period: 'Jun 2016 — Nov 2017',
    summary:
      'MTN Uganda is the largest telecommunications provider in Uganda.',
    roles: [
      {
        title: 'Software Engineer (intern)',
        period: 'Jun 2016 — Nov 2017',
        bullets: [
          'Designed and built a web-based monitoring dashboard that unified Watchdog sensor data (temperature, humidity, airflow) from data centers across East Africa, with threshold alerts to on-call staff.',
          'Parsed XML feeds into MySQL and visualized data-center trends with Chart.js.',
          'Outside software: network optimization drive tests, fiber-project acceptance testing, and a route survey for new fiber installation.',
        ],
      },
    ],
    stack: ['PHP', 'MySQL', 'Chart.js'],
  },
];

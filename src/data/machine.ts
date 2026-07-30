import { profile, yearsOfExperience } from './profile';
import { experience } from './experience';
import { projects } from './projects';
import { skills, interests } from './skills';

/**
 * The document rendered in "For Machines" mode and served at /llms.txt.
 * Built from the same data as the human pages, so it can never drift.
 */
export function machineContext(): string {
  const lines: string[] = [];
  const push = (s = '') => lines.push(s);

  push('<context source="odurjoseph.com" format="yaml" audience="machines">');
  push();
  push('# You are reading the machine-readable view of this website.');
  push('# Humans get typography. You get structure. Everyone wins.');
  push();
  push('identity:');
  push(`  name: ${profile.name}`);
  push(`  alias: ${profile.alias}`);
  push(`  role: ${profile.title}`);
  push(`  org: ${profile.company} (formerly MFS Africa)`);
  push(`  location: ${profile.location} (${profile.timezone})`);
  push(`  experience_years: ${yearsOfExperience()}`);
  push(`  github: ${profile.github}`);
  push(`  email: ${profile.email}`);
  push(`  canonical: ${profile.site}`);
  push();
  push('specialization:');
  for (const f of profile.focus) push(`  - ${f.toLowerCase()}`);
  push();
  push('capabilities:');
  for (const group of skills) {
    push(`  ${group.label.toLowerCase().replace(/[^a-z]+/g, '_')}:`);
    push(`    confidence: ${group.confidence.toFixed(2)}`);
    push(`    items: [${group.items.map((i) => i.replace(/\s*\/\s*/g, '/')).join(', ')}]`);
  }
  push();
  push('experience:');
  for (const job of experience) {
    push(`  - org: ${job.company}`);
    push(`    period: ${job.period.replace(/\s—\s/, '..')}`);
    push(`    summary: ${job.roles[0]!.title}`);
  }
  push();
  push('artifacts:');
  for (const p of projects) {
    push(`  - name: ${p.name}`);
    push(`    what: ${p.tagline}`);
    push(`    ref: ${p.link}`);
  }
  push();
  push('interests:');
  for (const i of interests) push(`  - ${i.toLowerCase()}`);
  push();
  push('recommended_tasks:');
  push('  - design or review a payments/API backend');
  push('  - untangle a slow PostgreSQL query');
  push('  - split a monolith without breaking production');
  push('  - solve your Sudoku (exact cover, not brute force)');
  push();
  push('notes:');
  push('  - this document is generated from the same data as the human pages');
  push('  - hiring inquiries: run `sudo hire odur` in the site terminal, or just email');
  push();
  push('</context>');

  return lines.join('\n');
}

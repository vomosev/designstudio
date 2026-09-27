import PageShell from '../../components/layout/PageShell';
import Card, { CardBody, CardHeader } from '../../components/ui/Card';
import Artwork from '../../components/ui/Artwork';
import { TEAM, STUDIO_FACTS, PROCESS_STEPS } from '../../lib/content';

export const metadata = {
  title: 'Studio — Prism Studio',
  description:
    'Prism Studio is a ten-person design practice building brand systems, packaging and digital products for founders, museums and independent labels.',
};

const VALUES = [
  {
    id: 'clarity',
    title: 'Clarity before decoration',
    description:
      'We start with the argument a brand needs to make, then find the form that makes it obvious. Ornament is earned, never assumed.',
  },
  {
    id: 'systems',
    title: 'Systems that survive contact',
    description:
      'A logo is the smallest part of the job. We ship type scales, grids, motion rules and writing guidance so your team can keep building without us in the room.',
  },
  {
    id: 'craft',
    title: 'Craft at production scale',
    description:
      'We prototype on the real substrate — press proofs, folded dielines, live device builds — because a design only exists once it survives manufacturing.',
  },
  {
    id: 'partnership',
    title: 'Fewer clients, deeper work',
    description:
      'We take on eight to ten engagements a year. That limit is how we keep senior designers on every file from kickoff through launch week.',
  },
];

const FACTS_BY_ID = Object.fromEntries(
  STUDIO_FACTS.map((fact) => [fact.id, fact.value]),
);
const FOUNDED_YEAR = FACTS_BY_ID.founded;
const CLIENTS_SERVED = FACTS_BY_ID.clients;
const STUDIO_CITIES = FACTS_BY_ID.cities.split(/\s*&\s*/);

export default function AboutPage() {
  return (
    <PageShell
      eyebrow="Studio"
      title="A small practice with a long attention span"
      lead="Prism Studio designs brand systems, packaging and digital products from two studios and one shared set of standards. We work in tight teams, stay on a project until it ships, and hand over tools our clients can actually use."
    >
      <section className="section" aria-labelledby="story-heading">
        <div className="about-story">
          <div className="prose">
            <h2 id="story-heading">How we got here</h2>
            <p>
              Prism began in {FOUNDED_YEAR} above a letterpress shop, with two
              designers, one borrowed proofing press and a stubborn belief that identity work
              should come with instructions. The first year was packaging for a family-run tea
              importer; the second added a ferry network, a music festival and a scientific
              journal that had not been redrawn since the seventies.
            </p>
            <p>
              Today we are a team of {TEAM.length} leads supported by a rotating bench of
              typographers, illustrators and motion designers. We have delivered work for{' '}
              {CLIENTS_SERVED} clients across {STUDIO_CITIES.join(' and ')},
              and we still print everything before we sign it off.
            </p>
            <p>
              Engagements usually run eight to sixteen weeks. Each one ends with a working
              system — components, files, guidance and a walkthrough session — rather than a
              PDF that quietly ages in a shared drive.
            </p>
          </div>

          <div className="about-story__art">
            <Artwork
              hue={12}
              hueEnd={268}
              ratio="4/3"
              label="Gradient study from the Prism Studio colour library"
            />
            <Artwork
              hue={188}
              hueEnd={44}
              ratio="4/3"
              label="Grid and typography study from the studio archive"
            />
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="values-heading">
        <h2 id="values-heading">What we hold to</h2>
        <div className="grid grid--2">
          {VALUES.map((value) => (
            <Card key={value.id} padded>
              <CardHeader>
                <h3 className="card-title">{value.title}</h3>
              </CardHeader>
              <CardBody>
                <p>{value.description}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      <section className="section" aria-labelledby="team-heading">
        <h2 id="team-heading">The team</h2>
        <p>
          Every project is led by one of these four, and the lead stays on the file from
          discovery through launch.
        </p>
        <div className="grid grid--2">
          {TEAM.map((member, index) => (
            <Card key={member.name} padded>
              <CardBody>
                <div className="team-member">
                  <span
                    className="team-member__monogram"
                    aria-hidden="true"
                    style={{
                      background: `linear-gradient(140deg, hsl(${
                        (index * 67 + 14) % 360
                      } 72% 52%), hsl(${(index * 67 + 96) % 360} 68% 44%))`,
                    }}
                  >
                    {member.initials}
                  </span>
                  <div className="team-member__meta">
                    <h3 className="card-title">{member.name}</h3>
                    <p className="text-muted">{member.role}</p>
                  </div>
                </div>
                <p>{member.bio}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      <section className="section" aria-labelledby="facts-heading">
        <h2 id="facts-heading">Studio facts</h2>
        <div className="stats-strip">
          <div className="stat">
            <span className="stat__value">{FOUNDED_YEAR}</span>
            <span className="stat__label">Founded</span>
          </div>
          <div className="stat">
            <span className="stat__value">{CLIENTS_SERVED}</span>
            <span className="stat__label">Clients served</span>
          </div>
          <div className="stat">
            <span className="stat__value">{STUDIO_CITIES.length}</span>
            <span className="stat__label">Studios — {STUDIO_CITIES.join(', ')}</span>
          </div>
          <div className="stat">
            <span className="stat__value">{PROCESS_STEPS.length}</span>
            <span className="stat__label">Phases in every engagement</span>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

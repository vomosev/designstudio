import Link from 'next/link';
import ProjectGrid from '../components/ProjectGrid';
import Button from '../components/ui/Button';
import Card, { CardHeader, CardBody, CardFooter } from '../components/ui/Card';
import Artwork from '../components/ui/Artwork';
import { SERVICES, PROCESS_STEPS, STUDIO_FACTS } from '../lib/content';

export const metadata = {
  title: 'Prism Studio — Graphic Design & Brand Systems',
  description:
    'Prism Studio is an independent graphic design practice building brand identities, packaging systems, editorial work and digital products for ambitious teams.',
};

export default function HomePage() {
  return (
    <div className="stack stack--page">
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero__content stack">
          <p className="eyebrow">Independent design practice · Est. 2014</p>
          <h1 id="hero-title">Brand systems designed to be lived in</h1>
          <p className="lead">
            We build identity, packaging and digital systems that hold up long after the launch
            deck closes — considered typography, durable colour, and documentation your team can
            actually use on a Tuesday afternoon.
          </p>
          <div className="cluster">
            <Button as="link" href="/work" variant="primary" size="lg">
              View our work
            </Button>
            <Button as="link" href="/contact" variant="secondary" size="lg">
              Start a project
            </Button>
          </div>
        </div>

        <div className="hero__art" aria-hidden="false">
          <div className="hero__art-grid">
            <Artwork hue={12} hueEnd={334} label="Aster Botanicals packaging system artwork" ratio="4/3" />
            <Artwork hue={196} hueEnd={262} label="Northwind Ferry wayfinding artwork" ratio="1/1" />
            <Artwork hue={42} hueEnd={8} label="Cadence Music Festival identity artwork" ratio="1/1" />
          </div>
        </div>
      </section>

      <section className="stats-strip" aria-label="Studio facts">
        <ul className="stats-strip__list">
          {STUDIO_FACTS.map((fact) => (
            <li key={fact.label} className="stat">
              <span className="stat__value">{fact.value}</span>
              <span className="stat__label">{fact.label}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="section" aria-labelledby="selected-work">
        <div className="section__head">
          <div className="stack stack--tight">
            <p className="eyebrow">Selected work</p>
            <h2 id="selected-work">Recent projects from the studio</h2>
            <p>
              A cross-section of the identity, packaging and product work we have shipped with
              founders, cultural institutions and in-house brand teams.
            </p>
          </div>
          <Button as="link" href="/work" variant="ghost" size="md">
            All projects
          </Button>
        </div>
        <ProjectGrid featuredOnly limit={6} />
      </section>

      <section className="section" aria-labelledby="services-teaser">
        <div className="section__head">
          <div className="stack stack--tight">
            <p className="eyebrow">What we do</p>
            <h2 id="services-teaser">Five disciplines, one system</h2>
            <p>
              Most engagements start with identity and expand outward. Every discipline shares the
              same type, colour and grid foundations, so the work stays coherent as it grows.
            </p>
          </div>
          <Button as="link" href="/services" variant="ghost" size="md">
            Services in detail
          </Button>
        </div>

        <div className="grid grid--3">
          {SERVICES.map((service) => (
            <Card key={service.id} padded interactive={false}>
              <CardHeader>
                <h3 className="card-title">{service.title}</h3>
              </CardHeader>
              <CardBody>
                <p>{service.description}</p>
                <ul className="list-check">
                  {service.deliverables.slice(0, 3).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </CardBody>
              <CardFooter>
                <Link className="text-link" href="/services">
                  Explore {service.title}
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      <section className="section" aria-labelledby="process">
        <div className="section__head">
          <div className="stack stack--tight">
            <p className="eyebrow">How we work</p>
            <h2 id="process">A four-phase engagement</h2>
            <p>
              Clear phases, fixed checkpoints and a single decision-maker per stage. You always know
              what is being reviewed and what happens next.
            </p>
          </div>
        </div>

        <ol className="process-strip">
          {PROCESS_STEPS.map((step, index) => (
            <li key={step.id || step.title} className="process-step">
              <span className="process-step__number">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="card-title">{step.title}</h3>
              <p>{step.description}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="cta-panel" aria-labelledby="home-cta">
        <div className="stack stack--tight">
          <h2 id="home-cta">Have a launch, rebrand or range extension coming up?</h2>
          <p>
            Tell us about the timeline and the audience. We reply to every inquiry within two
            business days with an honest view of fit, scope and cost.
          </p>
        </div>
        <div className="cluster">
          <Button as="link" href="/contact" variant="primary" size="lg">
            Start a project
          </Button>
          <Button as="link" href="/about" variant="ghost" size="lg">
            Meet the studio
          </Button>
        </div>
      </section>
    </div>
  );
}
import Link from 'next/link';
import PageShell from '../../components/layout/PageShell';
import Card, { CardHeader, CardBody, CardFooter } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { SERVICES, PROCESS_STEPS } from '../../lib/content';

export const metadata = {
  title: 'Services — Prism Studio',
  description:
    'Brand identity, packaging, editorial, digital product and motion design services from Prism Studio — strategy-led systems built to scale.',
};

export default function ServicesPage() {
  const services = Array.isArray(SERVICES) ? SERVICES : [];
  const steps = Array.isArray(PROCESS_STEPS) ? PROCESS_STEPS : [];

  return (
    <PageShell
      eyebrow="Services"
      title="Design systems, built end to end"
      lead="We work as an embedded partner across strategy, identity, packaging and product — shipping the toolkit, the guidelines and the people who know how to use them."
      actions={
        <Button as={Link} href="/contact" variant="primary" size="md">
          Start a project
        </Button>
      }
    >
      <section className="section" aria-labelledby="services-heading">
        <h2 id="services-heading">What we do</h2>
        <p>
          Every engagement is scoped around the outcome, not a fixed deliverable list. Below is how
          the work usually breaks down.
        </p>

        {services.length === 0 ? (
          <p className="text-muted">Service details are being updated. Email studio@prismdesign.co for our current capabilities.</p>
        ) : (
          <div className="grid grid--3">
            {services.map((service) => (
              <Card key={service.id} padded className="service-card">
                <CardHeader>
                  <Badge tone="accent" size="sm">
                    {service.title}
                  </Badge>
                  <h3 className="card-title">{service.title}</h3>
                </CardHeader>
                <CardBody>
                  <p>{service.description}</p>
                  <ul className="list-check">
                    {(service.deliverables || []).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </CardBody>
                <CardFooter>
                  <Button as={Link} href="/contact" variant="ghost" size="sm">
                    Discuss this service
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="section" aria-labelledby="process-heading">
        <h2 id="process-heading">How an engagement runs</h2>
        <p>
          Four phases, typically eight to fourteen weeks. You see work every week — no long silences,
          no single big reveal.
        </p>

        {steps.length === 0 ? (
          <p className="text-muted">Our process outline is being refreshed.</p>
        ) : (
          <ol className="process-list">
            {steps.map((step, index) => (
              <li key={step.id || step.title} className="process-step">
                <span className="process-step__number" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="process-step__body">
                  <h3 className="card-title">{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="section" aria-labelledby="services-cta-heading">
        <Card padded className="cta-card">
          <CardBody>
            <h2 id="services-cta-heading">Have a launch date in mind?</h2>
            <p>
              Tell us about the brand, the timeline and the budget range. We reply to every inquiry
              within two working days with an honest view of fit and scope.
            </p>
          </CardBody>
          <CardFooter>
            <div className="cluster">
              <Button as={Link} href="/contact" variant="primary" size="lg">
                Start a project
              </Button>
              <Button as={Link} href="/work" variant="secondary" size="lg">
                See selected work
              </Button>
            </div>
          </CardFooter>
        </Card>
      </section>
    </PageShell>
  );
}
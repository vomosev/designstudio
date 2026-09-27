import PageShell from '../../components/layout/PageShell';
import ContactForm from '../../components/ContactForm';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';

export const metadata = {
  title: 'Start a project — Prism Studio',
  description:
    'Tell us about your brand, your timeline and your ambitions. Prism Studio replies to every enquiry within two working days.',
};

export default function ContactPage() {
  return (
    <PageShell
      eyebrow="Contact"
      title="Start a project"
      lead="Tell us where the brand is today and where it needs to go. We read every enquiry ourselves and reply within two working days with next steps, availability and an honest view of fit."
    >
      <div className="contact-layout">
        <section className="contact-layout__form" aria-labelledby="contact-form-heading">
          <h2 id="contact-form-heading" className="visually-hidden">
            Project enquiry form
          </h2>
          <ContactForm />
        </section>

        <aside className="contact-layout__aside stack" aria-labelledby="contact-details-heading">
          <Card padded>
            <CardHeader>
              <h2 id="contact-details-heading">Studio details</h2>
            </CardHeader>
            <CardBody>
              <dl className="detail-list">
                <div className="detail-list__row">
                  <dt>Email</dt>
                  <dd>
                    <a href="mailto:studio@prismdesign.co">studio@prismdesign.co</a>
                  </dd>
                </div>
                <div className="detail-list__row">
                  <dt>Phone</dt>
                  <dd>
                    <a href="tel:+442079460188">+44 20 7946 0188</a>
                  </dd>
                </div>
                <div className="detail-list__row">
                  <dt>Studio</dt>
                  <dd>
                    Unit 4, Chandler Works
                    <br />
                    18 Rivington Street, London EC2A 3DZ
                  </dd>
                </div>
                <div className="detail-list__row">
                  <dt>Hours</dt>
                  <dd>Monday to Friday, 09:00–18:00 GMT</dd>
                </div>
              </dl>
            </CardBody>
          </Card>

          <Card padded>
            <CardHeader>
              <h2>Typical timelines</h2>
            </CardHeader>
            <CardBody>
              <p>
                Most engagements begin four to six weeks after the first call. A focused identity
                sprint runs six weeks; a full brand system with packaging or digital rollout
                usually takes twelve to sixteen.
              </p>
              <ul>
                <li>Brand identity sprint — 6 weeks</li>
                <li>Packaging system — 8 to 10 weeks</li>
                <li>Editorial or report design — 4 weeks</li>
                <li>Digital product design — 10 to 16 weeks</li>
              </ul>
            </CardBody>
          </Card>

          <Card padded>
            <CardHeader>
              <h2>Before you write</h2>
            </CardHeader>
            <CardBody>
              <p>
                The more context the better. Share the audience you are trying to reach, anything
                you have already built, and the date the work needs to be live. Budget ranges help
                us shape a realistic scope rather than an optimistic one.
              </p>
            </CardBody>
          </Card>
        </aside>
      </div>
    </PageShell>
  );
}
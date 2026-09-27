'use client';

import { useState } from 'react';
import { sendInquiry } from '../lib/api';
import { SERVICES } from '../lib/content';
import { Field, Input, Textarea, Select } from './ui/Field';
import Button from './ui/Button';
import Card, { CardBody, CardFooter, CardHeader } from './ui/Card';

const BUDGET_RANGES = [
  'Under $10k',
  '$10k – $25k',
  '$25k – $50k',
  '$50k – $100k',
  '$100k+',
  'Not sure yet',
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const EMPTY_FORM = {
  name: '',
  email: '',
  company: '',
  service: '',
  budgetRange: '',
  message: '',
};

function validate(values) {
  const errors = {};

  if (!values.name.trim()) {
    errors.name = 'Please tell us who we are talking to.';
  } else if (values.name.trim().length < 2) {
    errors.name = 'Names need at least two characters.';
  } else if (values.name.trim().length > 120) {
    errors.name = 'Please keep the name under 120 characters.';
  }

  if (!values.email.trim()) {
    errors.email = 'We need an email address to reply to.';
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = 'That email address does not look right.';
  }

  if (values.company.trim().length > 140) {
    errors.company = 'Please keep the company name under 140 characters.';
  }

  if (!values.message.trim()) {
    errors.message = 'A few sentences about the project helps us prepare.';
  } else if (values.message.trim().length < 20) {
    errors.message = 'Tell us a little more — at least 20 characters.';
  } else if (values.message.trim().length > 4000) {
    errors.message = 'That is longer than our form allows (4000 characters).';
  }

  return errors;
}

export default function ContactForm() {
  const [values, setValues] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [sent, setSent] = useState(null);

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => {
      if (!current[name]) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting) return;

    setSubmitError('');
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const payload = {
        name: values.name.trim(),
        email: values.email.trim(),
        company: values.company.trim(),
        service: values.service,
        budgetRange: values.budgetRange,
        message: values.message.trim(),
      };
      const result = await sendInquiry(payload);
      setSent({
        name: payload.name,
        email: payload.email,
        reference: (result && result.inquiry && result.inquiry.id) || null,
      });
      setValues(EMPTY_FORM);
      setErrors({});
    } catch (error) {
      setSubmitError(
        (error && error.message) ||
          'Your message could not be sent. Please try again or email studio@prismdesign.co.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleReset() {
    setSent(null);
    setSubmitError('');
    setValues(EMPTY_FORM);
    setErrors({});
  }

  if (sent) {
    return (
      <Card padded={false} className="contact-form">
        <CardHeader>
          <h2 className="card-title">Your brief is with us</h2>
        </CardHeader>
        <CardBody>
          <p>
            Thanks, {sent.name}. A studio partner reads every inquiry personally and replies to{' '}
            <strong>{sent.email}</strong> within two business days — usually sooner.
          </p>
          <p>
            If the fit looks right we will suggest a 30-minute call to walk through scope, timing
            and budget before anything is quoted.
            {sent.reference ? ` Reference number: PS-${sent.reference}.` : ''}
          </p>
        </CardBody>
        <CardFooter>
          <div className="cluster">
            <Button variant="secondary" size="md" onClick={handleReset}>
              Send another message
            </Button>
            <Button as="a" href="/work" variant="ghost" size="md">
              Browse our work
            </Button>
          </div>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card padded={false} className="contact-form">
      <CardHeader>
        <h2 className="card-title">Tell us about the project</h2>
        <p className="text-muted">
          The more context you share, the more useful our first reply will be.
        </p>
      </CardHeader>
      <CardBody>
        <form className="form stack" onSubmit={handleSubmit} noValidate>
          {submitError ? (
            <p className="alert alert--danger" role="alert">
              {submitError}
            </p>
          ) : null}

          <Field label="Your name" htmlFor="contact-name" error={errors.name} required>
            <Input
              id="contact-name"
              name="name"
              value={values.name}
              onChange={handleChange}
              autoComplete="name"
              placeholder="Maya Ellison"
              aria-invalid={errors.name ? 'true' : undefined}
            />
          </Field>

          <Field label="Email address" htmlFor="contact-email" error={errors.email} required>
            <Input
              id="contact-email"
              name="email"
              type="email"
              value={values.email}
              onChange={handleChange}
              autoComplete="email"
              placeholder="maya@company.com"
              aria-invalid={errors.email ? 'true' : undefined}
            />
          </Field>

          <Field
            label="Company or organisation"
            htmlFor="contact-company"
            hint="Optional — helps us research before we reply."
            error={errors.company}
          >
            <Input
              id="contact-company"
              name="company"
              value={values.company}
              onChange={handleChange}
              autoComplete="organization"
              placeholder="Aster Botanicals"
              aria-invalid={errors.company ? 'true' : undefined}
            />
          </Field>

          <Field
            label="What do you need?"
            htmlFor="contact-service"
            hint="Pick the closest fit — we can refine it together."
          >
            <Select
              id="contact-service"
              name="service"
              value={values.service}
              onChange={handleChange}
            >
              <option value="">Choose a service</option>
              {SERVICES.map((service) => (
                <option key={service.id} value={service.title}>
                  {service.title}
                </option>
              ))}
              <option value="Something else">Something else</option>
            </Select>
          </Field>

          <Field label="Budget range" htmlFor="contact-budget" hint="Ranges only — nothing binding.">
            <Select
              id="contact-budget"
              name="budgetRange"
              value={values.budgetRange}
              onChange={handleChange}
            >
              <option value="">Select a range</option>
              {BUDGET_RANGES.map((range) => (
                <option key={range} value={range}>
                  {range}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            label="Project details"
            htmlFor="contact-message"
            hint="Goals, audience, deadlines, anything already in motion."
            error={errors.message}
            required
          >
            <Textarea
              id="contact-message"
              name="message"
              rows={6}
              value={values.message}
              onChange={handleChange}
              placeholder="We are relaunching our tea range this autumn and need packaging plus a refreshed identity system."
              aria-invalid={errors.message ? 'true' : undefined}
            />
          </Field>

          <div className="cluster">
            <Button type="submit" variant="primary" size="lg" loading={submitting}>
              {submitting ? 'Sending…' : 'Send inquiry'}
            </Button>
            <span className="text-muted">We reply within two business days.</span>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
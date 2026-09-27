'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/AuthContext';
import { Field, Input } from './ui/Field';
import Button from './ui/Button';
import Card, { CardBody, CardFooter, CardHeader } from './ui/Card';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function AuthForm({ mode = 'login' }) {
  const isSignup = mode === 'signup';
  const router = useRouter();
  const { signIn, signUp } = useAuth();

  const [values, setValues] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev));
    if (serverError) setServerError('');
  }

  function validate() {
    const next = {};
    const name = values.name.trim();
    const email = values.email.trim();
    const password = values.password;

    if (isSignup && name.length < 2) {
      next.name = 'Please enter your full name (at least 2 characters).';
    }
    if (!email) {
      next.email = 'An email address is required.';
    } else if (!EMAIL_PATTERN.test(email)) {
      next.email = 'That does not look like a valid email address.';
    }
    if (!password) {
      next.password = 'A password is required.';
    } else if (isSignup && password.length < 8) {
      next.password = 'Passwords need to be at least 8 characters long.';
    }
    return next;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting) return;

    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setServerError('');
      return;
    }

    setSubmitting(true);
    setServerError('');

    try {
      if (isSignup) {
        await signUp({
          name: values.name.trim(),
          email: values.email.trim(),
          password: values.password,
        });
      } else {
        await signIn(values.email.trim(), values.password);
      }
      router.push('/admin');
    } catch (err) {
      const message =
        (err && err.message) ||
        'Something went wrong while contacting the studio API. Please try again.';
      setServerError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-form">
      <Card padded={false}>
        <CardHeader>
          <h2 className="auth-form__title">
            {isSignup ? 'Create a studio account' : 'Sign in to the studio'}
          </h2>
          <p className="auth-form__lead">
            {isSignup
              ? 'Studio accounts can publish portfolio projects and follow up on client inquiries.'
              : 'Use your Prism Studio credentials to open the portfolio dashboard.'}
          </p>
        </CardHeader>

        <CardBody>
          <form className="stack" onSubmit={handleSubmit} noValidate>
            {serverError ? (
              <p className="form-alert form-alert--error" role="alert">
                {serverError}
              </p>
            ) : null}

            {isSignup ? (
              <Field
                label="Full name"
                htmlFor="auth-name"
                error={errors.name}
                required
              >
                <Input
                  id="auth-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Mara Ellis"
                  value={values.name}
                  onChange={handleChange}
                  aria-invalid={errors.name ? 'true' : undefined}
                  disabled={submitting}
                />
              </Field>
            ) : null}

            <Field
              label="Email address"
              htmlFor="auth-email"
              error={errors.email}
              required
            >
              <Input
                id="auth-email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="studio@prismdesign.co"
                value={values.email}
                onChange={handleChange}
                aria-invalid={errors.email ? 'true' : undefined}
                disabled={submitting}
              />
            </Field>

            <Field
              label="Password"
              htmlFor="auth-password"
              hint={
                isSignup
                  ? 'At least 8 characters. Mix letters, numbers and symbols.'
                  : undefined
              }
              error={errors.password}
              required
            >
              <Input
                id="auth-password"
                name="password"
                type="password"
                autoComplete={isSignup ? 'new-password' : 'current-password'}
                placeholder="••••••••"
                value={values.password}
                onChange={handleChange}
                aria-invalid={errors.password ? 'true' : undefined}
                disabled={submitting}
              />
            </Field>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={submitting}
              disabled={submitting}
            >
              {isSignup ? 'Create account' : 'Sign in'}
            </Button>
          </form>
        </CardBody>

        <CardFooter>
          <p className="auth-form__switch">
            {isSignup ? 'Already have a studio account? ' : 'New to the studio? '}
            <Link href={isSignup ? '/login' : '/signup'}>
              {isSignup ? 'Sign in instead' : 'Create an account'}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
import PageShell from '../../components/layout/PageShell';
import AuthForm from '../../components/AuthForm';

export const metadata = {
  title: 'Sign in — Prism Studio',
  description:
    'Sign in to the Prism Studio dashboard to manage portfolio projects and respond to client inquiries.',
};

export default function LoginPage() {
  return (
    <PageShell
      eyebrow="Studio access"
      title="Sign in"
      lead="Studio accounts manage the portfolio dashboard — publish new work, edit case studies and reply to incoming client inquiries."
    >
      <div className="auth-wrap">
        <AuthForm mode="login" />
        <p className="text-muted auth-note">
          Access is limited to Prism Studio staff. If you need an account, ask a
          studio admin or email studio@prismdesign.co.
        </p>
      </div>
    </PageShell>
  );
}
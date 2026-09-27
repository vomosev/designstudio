import PageShell from '../../components/layout/PageShell';
import AuthForm from '../../components/AuthForm';

export const metadata = {
  title: 'Create a studio account — Prism Studio',
  description:
    'Create a Prism Studio account to manage portfolio projects and respond to client inquiries from the studio dashboard.',
};

export default function SignupPage() {
  return (
    <PageShell
      eyebrow="Studio access"
      title="Create a studio account"
      lead="New accounts join as editors, which allows you to publish portfolio work and follow up on client inquiries. An admin can promote you later."
    >
      <div className="auth-layout">
        <AuthForm mode="signup" />
        <p className="text-muted auth-note">
          Passwords must be at least 8 characters. Choose something you do not
          use elsewhere — studio accounts can edit published work.
        </p>
      </div>
    </PageShell>
  );
}
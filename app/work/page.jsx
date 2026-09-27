import PageShell from '../../components/layout/PageShell';
import ProjectGrid from '../../components/ProjectGrid';

export const metadata = {
  title: 'Work — Prism Studio',
  description:
    'Selected identity, packaging, editorial and digital projects from Prism Studio, a graphic design studio building brand systems for ambitious teams.',
};

export default function WorkPage() {
  return (
    <PageShell
      eyebrow="Portfolio"
      title="Work"
      lead="Identity, packaging and digital systems for ambitious teams. Every project below started with a question about how a brand should behave — and ended with a system the client can run without us."
    >
      <section className="section">
        <ProjectGrid showFilters />
      </section>
    </PageShell>
  );
}
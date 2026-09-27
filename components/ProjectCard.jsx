import Link from 'next/link';
import Card, { CardBody } from './ui/Card';
import Badge from './ui/Badge';
import Artwork from './ui/Artwork';

export default function ProjectCard({ project }) {
  if (!project) return null;

  const {
    slug,
    title = 'Untitled project',
    client = 'Prism Studio',
    category = 'Branding',
    year,
    summary = '',
    coverHue,
    coverHueEnd,
    featured,
  } = project;

  const href = slug ? `/work/${slug}` : '/work';

  return (
    <Card as="article" interactive padded={false} className="project-card">
      <Link href={href} className="project-card__link">
        <Artwork
          hue={typeof coverHue === 'number' ? coverHue : 14}
          hueEnd={typeof coverHueEnd === 'number' ? coverHueEnd : undefined}
          label={`${title} — cover artwork`}
          ratio="4 / 3"
        />
        <CardBody className="project-card__body">
          <div className="cluster project-card__tags">
            <Badge tone="accent" size="sm">
              {category}
            </Badge>
            {featured ? (
              <Badge tone="neutral" size="sm">
                Featured
              </Badge>
            ) : null}
          </div>

          <h3 className="project-title">{title}</h3>

          <p className="project-card__meta">
            <span className="truncate">{client}</span>
            {year ? <span className="project-card__year">{year}</span> : null}
          </p>

          {summary ? <p className="project-card__summary clamp-2">{summary}</p> : null}

          <span className="project-card__cue" aria-hidden="true">
            View case study
          </span>
        </CardBody>
      </Link>
    </Card>
  );
}
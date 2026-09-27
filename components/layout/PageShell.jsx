import Badge from './../ui/Badge';

export default function PageShell({ eyebrow, title, lead, actions, children }) {
  return (
    <div className="page">
      <header className="page-header">
        {eyebrow ? (
          <div className="page-header__eyebrow">
            <Badge tone="accent" size="sm">
              {eyebrow}
            </Badge>
          </div>
        ) : null}

        {title ? <h1 className="page-header__title">{title}</h1> : null}

        {lead ? <p className="page-header__lead">{lead}</p> : null}

        {actions ? <div className="page-header__actions cluster">{actions}</div> : null}
      </header>

      {children ? <div className="page-body stack">{children}</div> : null}
    </div>
  );
}
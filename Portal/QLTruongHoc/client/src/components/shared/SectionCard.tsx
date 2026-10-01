type SectionCardProps = {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export function SectionCard({
  title,
  subtitle,
  actions,
  children,
  className = "",
}: SectionCardProps) {
  const hasHeader = Boolean(
    title || subtitle || actions,
  );

  return (
    <section
      className={[
        "section-card",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {hasHeader ? (
        <header className="section-card__header">
          <div className="section-card__heading">
            {title ? (
              <h2>{title}</h2>
            ) : null}

            {subtitle ? (
              <p>{subtitle}</p>
            ) : null}
          </div>

          {actions ? (
            <div className="section-card__actions">
              {actions}
            </div>
          ) : null}
        </header>
      ) : null}

      <div className="section-card__body">
        {children}
      </div>
    </section>
  );
}

import { educationAppearance } from "../../config/educationAppearance";

type SectionCardProps = {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export function SectionCard({
  title,
  subtitle,
  action,
  children,
  className = "",
}: SectionCardProps) {
  const shadowClass =
    `section-card--shadow-${educationAppearance.cards.defaultShadow}`;

  const radiusClass =
    `section-card--radius-${educationAppearance.cards.defaultRadius}`;

  return (
    <section
      className={[
        "section-card",
        shadowClass,
        radiusClass,
        className,
      ].join(" ")}
    >
      {title || subtitle || action ? (
        <div className="section-card__header">
          <div>
            {title ? <h2>{title}</h2> : null}
            {subtitle ? <p>{subtitle}</p> : null}
          </div>

          {action ? (
            <div className="section-card__action">
              {action}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="section-card__body">
        {children}
      </div>
    </section>
  );
}

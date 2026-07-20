import { educationAppearance } from "../../config/educationAppearance";

export type StatCardTone =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger"
  | "info";

type StatCardProps = {
  title: string;
  value: string | number;
  note?: string;
  icon?: React.ReactNode;
  tone?: StatCardTone;
};

export function StatCard({
  title,
  value,
  note,
  icon,
  tone = "primary",
}: StatCardProps) {
  return (
    <article
      className={[
        "stat-card",
        `stat-card--${tone}`,
        `stat-card--${educationAppearance.cards.statisticVariant}`,
      ].join(" ")}
    >
      {icon ? (
        <div className="stat-card__icon">
          {icon}
        </div>
      ) : null}

      <div className="stat-card__content">
        <p>{title}</p>
        <strong>{value}</strong>
        {note ? <small>{note}</small> : null}
      </div>
    </article>
  );
}

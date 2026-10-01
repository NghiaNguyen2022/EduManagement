import { educationAppearance } from "../../config/educationAppearance";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  align?: "left" | "center";
};

export function PageHeader({
  title,
  subtitle,
  action,
  align = educationAppearance.pageHeader.align,
}: PageHeaderProps) {
  const shouldShowSubtitle =
    educationAppearance.pageHeader.showSubtitle &&
    Boolean(subtitle);

  return (
    <header
      className={[
        "page-header",
        align === "left" ? "page-header--left" : "page-header--center",
      ].join(" ")}
    >
      <div className="page-header__content">
        <h1>{title}</h1>

        {shouldShowSubtitle ? (
          <p>{subtitle}</p>
        ) : null}
      </div>

      {action ? (
        <div
          className={[
            "page-header__action",
            educationAppearance.pageHeader.actionPlacement === "below"
              ? "page-header__action--below"
              : "",
          ].join(" ")}
        >
          {action}
        </div>
      ) : null}
    </header>
  );
}

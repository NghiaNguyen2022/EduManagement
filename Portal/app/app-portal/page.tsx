import Link from "next/link";
import type { Metadata } from "next";
import { listApps } from "@/lib/store/apps";
import { getRatingSummary } from "@/lib/store/reviews";
import { recordView, getViewCounts } from "@/lib/store/views";
import { formatStars } from "@/lib/ratings";
import { getSiteNav } from "@/lib/nav";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import SiteHeader from "../components/SiteHeader";
import WorkAppGallery from "../components/WorkAppGallery";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const dictionary = getDictionary(await getLocale());
  return {
    title: dictionary.appPortal.metaTitle,
    description: dictionary.appPortal.metaDescription,
    alternates: { canonical: "/app-portal" },
    openGraph: {
      type: "website",
      title: `${dictionary.appPortal.metaTitle} | Vireon`,
      description: dictionary.appPortal.metaDescription,
      url: "/app-portal",
    },
  };
}

async function getSummaries(
  slugs: string[],
): Promise<Map<string, { average: number; count: number }>> {
  const entries = await Promise.all(
    slugs.map(async (slug) => {
      try {
        return [slug, await getRatingSummary(slug)] as const;
      } catch {
        return [slug, { average: 0, count: 0 }] as const;
      }
    }),
  );
  return new Map(entries);
}

export default async function AppPortalPage() {
  const locale = await getLocale();
  const dictionary = getDictionary(locale);
  const apps = await listApps(locale);
  const detailApps = apps.filter((app) => app.hasDetailPage);
  const summaries = await getSummaries(detailApps.map((app) => app.slug));
  const totalCustomers = detailApps.reduce((sum, app) => sum + app.customers.length, 0);
  const totalReviews = Array.from(summaries.values()).reduce((sum, s) => sum + s.count, 0);
  try {
    await recordView("site");
  } catch {
    // ignore
  }
  const appViewCounts = await getViewCounts("app", apps.map((app) => app.slug)).catch(
    () => new Map<string, number>(),
  );

  return (
    <main>
      <SiteHeader eyebrow={dictionary.appPortal.kicker} links={getSiteNav(dictionary)} locale={locale} />

      <section className="section applications">
        <div className="section-heading">
          <div>
            <p className="kicker">{dictionary.appPortal.kicker}</p>
            <h1>{dictionary.appPortal.title}</h1>
          </div>
          <p>{dictionary.appPortal.lead}</p>
        </div>

        <div className="hub-summary" aria-label={dictionary.appPortal.summaryAriaLabel}>
          <span>
            <strong>{String(detailApps.length).padStart(2, "0")}</strong>{" "}
            {dictionary.appPortal.summaryOperating}
          </span>
          <span>
            <strong>{String(totalCustomers).padStart(2, "0")}</strong>{" "}
            {dictionary.appPortal.summaryCustomers}
          </span>
          <span>
            <strong>{String(totalReviews).padStart(2, "0")}</strong>{" "}
            {dictionary.appPortal.summaryReviews}
          </span>
        </div>

        <div className="app-grid">
          {apps.map((app) => {
            const summary = summaries.get(app.slug);
            const displayRating = summary && summary.count > 0 ? summary.average : app.baseRating;

            return (
              <article className={`app-card ${app.tone}`} key={app.slug}>
                <div className="app-top">
                  <span className="app-icon">{app.code}</span>
                  <span className="app-status">{app.eyebrow}</span>
                </div>
                <h3>{app.title}</h3>
                <p>{app.description}</p>
                <span className="comment-badge">
                  👁 {appViewCounts.get(app.slug) ?? 0} {dictionary.appPortal.viewBadge}
                </span>

                {app.hasDetailPage && (
                  <div className="app-rating-row">
                    <span className="review-stars">{formatStars(displayRating ?? 0)}</span>
                    <span className="app-rating-count">
                      {displayRating
                        ? `${displayRating.toFixed(1)}/5${
                            summary && summary.count > 0
                              ? ` · ${summary.count} ${dictionary.appPortal.ratingSuffix}`
                              : ""
                          }`
                        : dictionary.appPortal.noRating}
                    </span>
                  </div>
                )}

                <div className="app-actions">
                  <a
                    className="app-action-primary"
                    href={app.href}
                    target={app.href.startsWith("http") ? "_blank" : undefined}
                    rel={app.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  >
                    {app.action} <span aria-hidden="true">↗</span>
                  </a>
                  {app.hasDetailPage && (
                    <Link className="app-action-secondary" href={`/app-portal/${app.slug}`}>
                      {dictionary.appPortal.viewDetail}
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>
      <WorkAppGallery locale={locale} />
    </main>
  );
}

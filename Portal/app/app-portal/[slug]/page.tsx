import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAppBySlug } from "@/lib/store/apps";
import { getRatingSummary, listApprovedReviews, type Review } from "@/lib/store/reviews";
import { recordView, getViewCount } from "@/lib/store/views";
import { formatStars } from "@/lib/ratings";
import { getAppContent, type AppContent } from "@/lib/store/app-content";
import { toEmbedUrl } from "@/lib/video";
import { SITE_NAME, SITE_URL, CONTACT_EMAIL, CONTACT_ZALO_URL } from "@/lib/site-config";
import { getSiteNav } from "@/lib/nav";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import SiteHeader from "../../components/SiteHeader";
import ReviewForm from "./ReviewForm";
import { getWorkApp } from "@/lib/work-apps";
import WorkAppDetail from "../../components/WorkAppDetail";

function getInitials(name: string): string {
  const words = name.split(" ").filter(Boolean);
  const initials = words.slice(-2).map((word) => word[0]);
  return initials.join("").toUpperCase().slice(0, 2);
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function getAppContentSafe(slug: string): Promise<AppContent> {
  try {
    return await getAppContent(slug);
  } catch {
    return { slug, demoVideoUrl: null, documents: [] };
  }
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const workApp = getWorkApp(slug);
  if (workApp) return { title: workApp.title, description: workApp.description, alternates: { canonical: `/app-portal/${slug}` } };
  const locale = await getLocale();
  const dictionary = getDictionary(locale);
  const app = await getAppBySlug(slug, locale);

  if (!app) {
    return { title: dictionary.appPortal.notFoundTitle };
  }

  return {
    title: app.title,
    description: app.description,
    alternates: { canonical: `/app-portal/${app.slug}` },
    openGraph: {
      type: "website",
      title: `${app.title} | ${SITE_NAME}`,
      description: app.description,
      url: `/app-portal/${app.slug}`,
    },
  };
}

async function getReviewData(
  slug: string,
): Promise<{ summary: { average: number; count: number }; reviews: Review[] }> {
  try {
    const [summary, reviews] = await Promise.all([
      getRatingSummary(slug),
      listApprovedReviews(slug),
    ]);
    return { summary, reviews };
  } catch {
    return { summary: { average: 0, count: 0 }, reviews: [] };
  }
}

export default async function AppDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const workApp = getWorkApp(slug);
  if (workApp) return <WorkAppDetail app={workApp} />;
  const locale = await getLocale();
  const dictionary = getDictionary(locale);
  const app = await getAppBySlug(slug, locale);
  if (!app) notFound();

  try {
    await recordView("site");
    await recordView("app", slug);
  } catch {
    // ignore
  }
  const viewCount = await getViewCount("app", slug).catch(() => 0);
  const { summary, reviews } = await getReviewData(slug);
  const content = await getAppContentSafe(slug);
  const displayRating = summary.count > 0 ? summary.average : app.baseRating ?? 0;
  const embedUrl = content.demoVideoUrl ? toEmbedUrl(content.demoVideoUrl) : null;
  const detail = dictionary.appPortal.detail;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: app.title,
    description: app.description,
    applicationCategory: "BusinessApplication",
    url: `${SITE_URL}/app-portal/${app.slug}`,
    ...(summary.count > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: summary.average.toFixed(1),
            reviewCount: summary.count,
          },
        }
      : {}),
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader eyebrow={dictionary.appPortal.kicker} links={getSiteNav(dictionary)} locale={locale} />

      <nav className="app-tabs" aria-label={detail.tabsAriaLabel}>
        <a href="#overview">{detail.tabOverview}</a>
        {content.demoVideoUrl && <a href="#video">{detail.tabVideo}</a>}
        {content.documents.length > 0 && <a href="#documents">{detail.tabDocuments}</a>}
        <a href="#reviews">{detail.tabReviews}</a>
      </nav>

      <section className="section app-detail-hero" id="overview">
        <Link className="back-link" href="/app-portal">
          {detail.back}
        </Link>
        <p className="kicker">{app.eyebrow}</p>
        <h1>{app.title}</h1>
        <p className="app-detail-lead">{app.longDescription}</p>

        <div className="app-rating-row large">
          <span className="review-stars">{formatStars(displayRating)}</span>
          <span className="app-rating-count">
            {displayRating.toFixed(1)}/5
            {summary.count > 0 ? ` · ${summary.count} ${detail.ratingSuffix}` : ` · ${detail.noRatingYet}`}
          </span>
          <span className="comment-badge">
            👁 {viewCount} {dictionary.appPortal.viewBadge}
          </span>
        </div>

        <div className="hero-actions">
          <a className="button button-primary" href={app.href} target="_blank" rel="noopener noreferrer">
            {app.action} <span aria-hidden="true">↗</span>
          </a>
          <a
            className="button button-quiet"
            href={CONTACT_ZALO_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            {detail.zaloCta}
          </a>
          <a
            className="button button-quiet"
            href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`${detail.emailSubjectPrefix} ${app.title}`)}`}
          >
            {detail.emailCta}
          </a>
        </div>
      </section>

      {content.demoVideoUrl && (
        <section className="section app-detail-video" id="video">
          <h2>{detail.videoHeading}</h2>
          {embedUrl ? (
            <div className="video-embed">
              <iframe
                src={embedUrl}
                title={`${detail.videoHeading} ${app.title}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <p className="video-embed-fallback">
              <a
                className="text-link"
                href={content.demoVideoUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {detail.watchVideoFallback}
              </a>
            </p>
          )}
        </section>
      )}

      <section className="section app-detail-body">
        <div className="app-detail-grid">
          <div>
            <h2>{detail.featuresHeading}</h2>
            <ul className="highlight-list">
              {app.highlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
          </div>
          <div>
            <h2>{detail.customersHeading}</h2>
            <div className="customer-list">
              {app.customers.map((customer) => (
                <div className="customer-card" key={customer.name}>
                  <span className="customer-avatar" aria-hidden="true">
                    {getInitials(customer.name)}
                  </span>
                  <div>
                    <strong>{customer.name}</strong>
                    <span>{customer.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {content.documents.length > 0 && (
        <section className="section document-section" id="documents">
          <div className="section-heading">
            <div>
              <p className="kicker">{detail.documentsKicker}</p>
              <h2>{detail.documentsHeading}</h2>
            </div>
          </div>
          <div className="document-list">
            {content.documents.map((doc) => (
              <div className="document-item" key={doc.id}>
                <span className="document-icon">
                  {doc.name.split(".").pop()?.slice(0, 4).toUpperCase()}
                </span>
                <div className="document-info">
                  <strong>{doc.name}</strong>
                  <span>{formatSize(doc.size)}</span>
                </div>
                <a
                  className="download-link"
                  href={`/api/documents/${doc.fileKey}?name=${encodeURIComponent(doc.name)}`}
                >
                  {detail.download}
                </a>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="section app-reviews" id="reviews">
        <div className="section-heading">
          <div>
            <p className="kicker">{detail.reviewsKicker}</p>
            <h2>{detail.reviewsHeading}</h2>
          </div>
        </div>

        {reviews.length === 0 ? (
          <p className="admin-empty">{detail.noReviews}</p>
        ) : (
          <div className="review-list">
            {reviews.map((review) => (
              <article className="review-item" key={review.id}>
                <div className="review-item-head">
                  <strong>{review.name}</strong>
                </div>
                <div className="review-stars">{formatStars(review.rating)}</div>
                <p>{review.comment}</p>
                <div className="review-meta">
                  <span>{new Date(review.createdAt).toLocaleDateString("vi-VN")}</span>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="admin-card review-form-card">
          <h3>{detail.reviewFormHeading}</h3>
          <p className="subtitle">{detail.reviewFormSubtitle}</p>
          <ReviewForm appSlug={slug} locale={locale} />
        </div>
      </section>
    </main>
  );
}

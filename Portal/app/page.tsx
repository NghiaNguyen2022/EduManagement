import Link from "next/link";
import { listPublishedPosts, type Post } from "@/lib/store/posts";
import { toPlainExcerpt } from "@/lib/markdown";
import { listApps, type AppInfo } from "@/lib/store/apps";
import { getRatingSummary } from "@/lib/store/reviews";
import { formatStars } from "@/lib/ratings";
import { listComments } from "@/lib/store/comments";
import { recordView, getSiteViewStats, getViewCounts, type ViewStats } from "@/lib/store/views";
import { channels, resolveChannel } from "@/lib/channels";
import { services, resolveService } from "@/lib/services";
import { getHomeNav } from "@/lib/nav";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import SiteHeader from "./components/SiteHeader";
import WorkAppGallery from "./components/WorkAppGallery";

const fallbackNews: BlogPost[] = [
      {
            date: "30.07.2026",
            title: "Tích hợp ERP với Ngân hàng (eBanking): Tự động hoá thanh toán & đối soát công nợ",
            href: "https://paul-digitalhub.com/wp/index.php/chuyen-doi-so/erp/tich-hop-erp-voi-ngan-hang-ebanking/",
      },
      {
            date: "24.07.2026",
            title: "Master Data không phải việc riêng của IT",
            href: "https://paul-digitalhub.com/wp/index.php/chuyen-doi-so/erp/master-data-khong-phai-viec-rieng-cua-it/",
      },
      {
            date: "17.07.2026",
            title: "Dashboard không nên bắt đầu từ biểu đồ",
            href: "https://paul-digitalhub.com/wp/index.php/chuyen-doi-so/dashboard-bat-dau-tu-cau-hoi-quan-tri/",
      },
      {
            date: "15.07.2026",
            title: "Quản lý hạn sử dụng sau khi mở bao bì trong ERP và SAP B1",
            href: "https://paul-digitalhub.com/wp/index.php/common/quan-ly-han-su-dung-sau-khi-mo-bao-bi-erp-sap-b1/",
      },
      {
            date: "17.06.2026",
            title: "Hành trình chuẩn hóa SAP Business One cho nhà máy sản xuất",
            href: "https://paul-digitalhub.com/wp/index.php/chuyen-doi-so/sap-business-one-phase-2-nha-may-san-xuat-costing/",
      },
      {
            date: "25.05.2026",
            title: "Quy trình bán hàng thanh toán trước trên SAP Business One",
            href: "https://paul-digitalhub.com/wp/index.php/chuyen-doi-so/erp/quy-trinh-ban-hang-thanh-toan-truoc-sap-business-one/",
      },
];

type BlogPost = {
      date: string;
      title: string;
      href: string;
};

async function getDigitalSpacePosts(): Promise<Post[]> {
      try {
            return (await listPublishedPosts()).slice(0, 3);
      } catch {
            return [];
      }
}

async function getAppRatingSummaries(
      apps: AppInfo[],
): Promise<Map<string, { average: number; count: number }>> {
      const detailApps = apps.filter((app) => app.hasDetailPage);
      const entries = await Promise.all(
            detailApps.map(async (app) => {
                  try {
                        return [app.slug, await getRatingSummary(app.slug)] as const;
                  } catch {
                        return [app.slug, { average: 0, count: 0 }] as const;
                  }
            }),
      );
      return new Map(entries);
}

async function getCommentCounts(posts: Post[]): Promise<Map<string, number>> {
      const entries = await Promise.all(
            posts.map(async (post) => {
                  try {
                        return [post.id, (await listComments(post.id)).length] as const;
                  } catch {
                        return [post.id, 0] as const;
                  }
            }),
      );
      return new Map(entries);
}

async function recordSiteView(): Promise<void> {
      try {
            await recordView("site");
      } catch {
            // ignore
      }
}

async function getSiteStatsSafe(): Promise<ViewStats> {
      try {
            return await getSiteViewStats();
      } catch {
            return { today: 0, week: 0, month: 0, total: 0 };
      }
}

async function getPostViewCounts(posts: Post[]): Promise<Map<string, number>> {
      try {
            return await getViewCounts("post", posts.map((post) => post.id));
      } catch {
            return new Map();
      }
}

async function getAppViewCounts(apps: AppInfo[]): Promise<Map<string, number>> {
      try {
            return await getViewCounts("app", apps.map((app) => app.slug));
      } catch {
            return new Map();
      }
}

function formatSpaceDate(value: string) {
      return new Intl.DateTimeFormat("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
      })
            .format(new Date(value))
            .replace(/\//g, ".");
}

type WordPressPost = {
      date: string;
      link: string;
      title: { rendered: string };
};

const WORDPRESS_POSTS_URL =
      "https://paul-digitalhub.com/wp/index.php?rest_route=/wp/v2/posts&per_page=6&_fields=date,link,title";

function cleanWordPressText(value: string) {
      return value
            .replace(/<[^>]*>/g, " ")
            .replace(/&nbsp;/g, " ")
            .replace(/&#8211;|&ndash;/g, "–")
            .replace(/&#8212;|&mdash;/g, "—")
            .replace(/&#038;|&amp;/g, "&")
            .replace(/&quot;|&#8220;|&#8221;/g, '"')
            .replace(/&#8216;|&#8217;/g, "'")
            .replace(/\s+/g, " ")
            .trim();
}

function formatPostDate(value: string) {
      return new Intl.DateTimeFormat("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
      })
            .format(new Date(value))
            .replace(/\//g, ".");
}

async function getLatestPosts(): Promise<BlogPost[]> {
      try {
            const response = await fetch(WORDPRESS_POSTS_URL, {
                  next: { revalidate: 10800 },
            });

            if (!response.ok) {
                  return fallbackNews;
            }

            const posts = (await response.json()) as WordPressPost[];

            return posts.slice(0, 6).map((post) => ({
                  date: formatPostDate(post.date),
                  title: cleanWordPressText(post.title.rendered),
                  href: post.link,
            }));
      } catch {
            return fallbackNews;
      }
}

export default async function Home() {
      const locale = await getLocale();
      const dictionary = getDictionary(locale);
      const apps = await listApps(locale);
      const news = await getLatestPosts();
      const spacePosts = await getDigitalSpacePosts();
      await recordSiteView();
      const [ratingSummaries, commentCounts, viewStats, postViewCounts, appViewCounts] = await Promise.all([
            getAppRatingSummaries(apps),
            getCommentCounts(spacePosts),
            getSiteStatsSafe(),
            getPostViewCounts(spacePosts),
            getAppViewCounts(apps),
      ]);
      const detailAppCount = apps.filter((app) => app.hasDetailPage).length;
      const expandableCount = apps.filter((app) => !app.hasDetailPage).length;

      return (
            <main>
                  <SiteHeader
                        eyebrow={dictionary.home.eyebrow}
                        brandHref="#top"
                        links={getHomeNav(dictionary)}
                        locale={locale}
                        ctaHref="https://paul-digitalhub.com/wp/"
                        ctaLabel="Paul Digital Hub"
                  />

                  <section className="hero" id="top">
                        <div className="hero-copy">
                              <p className="kicker">{dictionary.home.hero.kicker}</p>
                              <h1>
                                    {dictionary.home.hero.heading1}
                                    <span> {dictionary.home.hero.heading2}</span>
                              </h1>
                              <p className="hero-lead">{dictionary.home.hero.lead}</p>
                              <div className="hero-actions">
                                    <a className="button button-primary" href="#applications">
                                          {dictionary.home.hero.ctaPrimary}
                                    </a>
                                    <a className="button button-quiet" href="#about">
                                          {dictionary.home.hero.ctaSecondary}
                                    </a>
                              </div>
                              <div className="hero-meta">
                                    <span>{dictionary.home.hero.meta1}</span>
                                    <span>{dictionary.home.hero.meta2}</span>
                                    <span>{dictionary.home.hero.meta3}</span>
                              </div>
                        </div>
                        <div className="hero-visual" aria-hidden="true">
                              <div className="orbit orbit-one" />
                              <div className="orbit orbit-two" />
                              <div className="visual-card visual-card-main">
                                    <span className="visual-label">{dictionary.home.hero.visualLabel}</span>
                                    <strong>{dictionary.home.hero.visualHeadline}</strong>
                                    <div className="visual-line">
                                          <i />
                                          <i />
                                          <i />
                                    </div>
                              </div>
                              <div className="visual-card visual-card-small">
                                    <span>{dictionary.home.hero.visualSmallNumber}</span>
                                    <small>{dictionary.home.hero.visualSmallLabel}</small>
                              </div>
                              <div className="visual-dot dot-one" />
                              <div className="visual-dot dot-two" />
                        </div>
                  </section>

                  <div className="home-columns">
                        <div className="home-main">
                              <section className="section about" id="about">
                                    <div className="about-statement">
                                          <p className="kicker">{dictionary.home.about.kicker}</p>
                                          <h2>
                                                {dictionary.home.about.name}
                                                <span>{dictionary.home.about.nameSuffix}</span>
                                          </h2>
                                          <p className="about-role">{dictionary.home.about.role}</p>
                                          <div className="about-stats">
                                                <div>
                                                      <strong>{dictionary.home.about.stat1Number}</strong>
                                                      <span>{dictionary.home.about.stat1Label}</span>
                                                </div>
                                                <div>
                                                      <strong>{dictionary.home.about.stat2Number}</strong>
                                                      <span>{dictionary.home.about.stat2Label}</span>
                                                </div>
                                                <div>
                                                      <strong>{dictionary.home.about.stat3Number}</strong>
                                                      <span>{dictionary.home.about.stat3Label}</span>
                                                </div>
                                          </div>
                                    </div>
                                    <div className="about-content">
                                          <p>
                                                {dictionary.home.about.paragraph1Before}
                                                <strong>{dictionary.home.about.paragraph1Erp}</strong>
                                                {dictionary.home.about.paragraph1Mid1}
                                                <strong>{dictionary.home.about.paragraph1Bi}</strong>
                                                {dictionary.home.about.paragraph1Mid2}
                                                <strong>{dictionary.home.about.paragraph1Transform}</strong>
                                                {dictionary.home.about.paragraph1After}
                                          </p>
                                          <p>
                                                {dictionary.home.about.paragraph2Before}
                                                <strong>{dictionary.home.about.paragraph2App}</strong>
                                                {dictionary.home.about.paragraph2Mid}
                                                <strong>{dictionary.home.about.paragraph2Ai}</strong>
                                                {dictionary.home.about.paragraph2After}
                                          </p>
                                          <p>
                                                {dictionary.home.about.paragraph3Before}
                                                <strong>{dictionary.home.about.paragraph3Brand}</strong>
                                                {dictionary.home.about.paragraph3After}
                                          </p>
                                          <div className="about-links">
                                                <a
                                                      href="https://paul-digitalhub.com/wp/"
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                >
                                                      {dictionary.home.about.linkHub}
                                                </a>
                                                <a
                                                      href="https://paul-digitalhub.com/wp/index.php/dich-vu/"
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                >
                                                      {dictionary.home.about.linkProfile}
                                                </a>
                                          </div>
                                    </div>
                              </section>

                              <section className="section services" id="services">
                                    <div className="section-heading">
                                          <div>
                                                <p className="kicker">{dictionary.home.services.kicker}</p>
                                                <h2>{dictionary.home.services.title}</h2>
                                          </div>
                                          <p>{dictionary.home.services.lead}</p>
                                    </div>
                                    <div className="services-grid">
                                          {services.map((service) => {
                                                const resolved = resolveService(service, locale);
                                                return (
                                                      <div className="service-card" key={service.title}>
                                                            <h3>{resolved.title}</h3>
                                                            <p>{resolved.description}</p>
                                                      </div>
                                                );
                                          })}
                                    </div>
                              </section>

                              <section className="section space" id="space">
                                    <div className="section-heading">
                                          <div>
                                                <p className="kicker">{dictionary.home.space.kicker}</p>
                                                <h2>{dictionary.home.space.title}</h2>
                                          </div>
                                          <Link className="text-link" href="/feed">
                                                {dictionary.home.space.viewAll}
                                          </Link>
                                    </div>
                                    {spacePosts.length === 0 ? (
                                          <p className="admin-empty">{dictionary.home.space.empty}</p>
                                    ) : (
                                          <div className="space-grid">
                                                {spacePosts.map((post) => (
                                                      <Link className="space-card" href={`/feed/${post.id}`} key={post.id}>
                                                            {post.coverImageKey && (
                                                                  // eslint-disable-next-line @next/next/no-img-element
                                                                  <img
                                                                        className="space-card-cover"
                                                                        src={`/api/images/${post.coverImageKey}`}
                                                                        alt=""
                                                                  />
                                                            )}
                                                            <div className="space-card-body">
                                                                  <div className="space-card-meta">
                                                                        <time>{formatSpaceDate(post.createdAt)}</time>
                                                                        <span className="comment-badge">
                                                                              💬 {commentCounts.get(post.id) ?? 0}{" "}
                                                                              {dictionary.home.space.commentBadge}
                                                                        </span>
                                                                        <span className="comment-badge">
                                                                              👁 {postViewCounts.get(post.id) ?? 0}{" "}
                                                                              {dictionary.home.space.viewBadge}
                                                                        </span>
                                                                  </div>
                                                                  <h3>{post.title}</h3>
                                                                  <p>{toPlainExcerpt(post.body)}</p>
                                                                  {post.tags.length > 0 && (
                                                                        <div className="tag-row">
                                                                              {post.tags.map((tag) => (
                                                                                    <span className="tag-chip" key={tag}>
                                                                                          {tag}
                                                                                    </span>
                                                                              ))}
                                                                        </div>
                                                                  )}
                                                            </div>
                                                      </Link>
                                                ))}
                                          </div>
                                    )}
                              </section>

                              <section className="section news" id="news">
                                    <div className="section-heading">
                                          <div>
                                                <p className="kicker">{dictionary.home.news.kicker}</p>
                                                <h2>{dictionary.home.news.title}</h2>
                                          </div>
                                          <a
                                                className="text-link"
                                                href="https://paul-digitalhub.com/wp/"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                          >
                                                {dictionary.home.news.viewAll}
                                          </a>
                                    </div>
                                    <div className="news-list">
                                          {news.slice(0, 5).map((item) => (
                                                <a
                                                      className="news-row"
                                                      href={item.href}
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                      key={item.href}
                                                >
                                                      <time>{item.date}</time>
                                                      <span className="news-row-title">{item.title}</span>
                                                      <span className="news-row-link">{dictionary.home.news.readMore}</span>
                                                </a>
                                          ))}
                                    </div>
                              </section>
                        </div>

                        <div className="home-side">
                              <section className="section applications" id="applications">
                                    <div className="section-heading">
                                          <div>
                                                <p className="kicker">{dictionary.home.applications.kicker}</p>
                                                <h2>{dictionary.home.applications.title}</h2>
                                          </div>
                                          <p>{dictionary.home.applications.lead}</p>
                                    </div>
                                    <div
                                          className="hub-summary"
                                          aria-label={dictionary.home.applications.summaryAriaLabel}
                                    >
                                          <span>
                                                <strong>{String(detailAppCount).padStart(2, "0")}</strong>{" "}
                                                {dictionary.home.applications.summaryOperating}
                                          </span>
                                          <span>
                                                <strong>{String(expandableCount).padStart(2, "0")}</strong>{" "}
                                                {dictionary.home.applications.summaryExpand}
                                          </span>
                                          <Link className="hub-summary-link" href="/app-portal">
                                                {dictionary.home.applications.summaryLink}
                                          </Link>
                                    </div>
                                    <div className="app-grid">
                                          {apps.map((app) => {
                                                const summary = ratingSummaries.get(app.slug);
                                                const displayRating =
                                                      summary && summary.count > 0 ? summary.average : app.baseRating;

                                                return (
                                                <article className={`app-card ${app.tone}`} key={app.slug}>
                                                      <div className="app-top">
                                                            <span className="app-icon">{app.code}</span>
                                                            <span className="app-status">{app.eyebrow}</span>
                                                      </div>
                                                      <h3>{app.title}</h3>
                                                      <p>{app.description}</p>
                                                      <span className="comment-badge">
                                                            👁 {appViewCounts.get(app.slug) ?? 0}{" "}
                                                            {dictionary.home.applications.viewBadge}
                                                      </span>
                                                      {app.hasDetailPage && (
                                                            <div className="app-rating-row">
                                                                  <span className="review-stars">
                                                                        {formatStars(displayRating ?? 0)}
                                                                  </span>
                                                                  <span className="app-rating-count">
                                                                        {displayRating
                                                                              ? `${displayRating.toFixed(1)}/5${
                                                                                    summary && summary.count > 0
                                                                                          ? ` · ${summary.count} ${dictionary.home.applications.ratingSuffix}`
                                                                                          : ""
                                                                              }`
                                                                              : dictionary.home.applications.noRating}
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
                                                                  <Link
                                                                        className="app-action-secondary"
                                                                        href={`/app-portal/${app.slug}`}
                                                                  >
                                                                        {dictionary.home.applications.viewDetail}
                                                                  </Link>
                                                            )}
                                                      </div>
                                                </article>
                                                );
                                          })}
                                    </div>
                              </section>

                              <WorkAppGallery locale={locale} />
                              <section className="section connect" id="connect">
                                    <div className="section-heading">
                                          <div>
                                                <p className="kicker">{dictionary.home.connect.kicker}</p>
                                                <h2>{dictionary.home.connect.title}</h2>
                                          </div>
                                    </div>
                                    <div className="channel-grid">
                                          {channels.map((channel) => {
                                                const resolved = resolveChannel(channel, locale);
                                                return (
                                                      <a
                                                            className="channel-card"
                                                            href={resolved.href}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            key={channel.title}
                                                      >
                                                            <span className="channel-icon">{resolved.code}</span>
                                                            <span>
                                                                  <strong>{resolved.title}</strong>
                                                                  <small>{resolved.description}</small>
                                                            </span>
                                                            <i aria-hidden="true">↗</i>
                                                      </a>
                                                );
                                          })}
                                    </div>
                              </section>
                        </div>
                  </div>

                  <section className="section roadmap" id="roadmap">
                        <p className="kicker">{dictionary.home.roadmap.kicker}</p>
                        <h2>{dictionary.home.roadmap.title}</h2>
                        <p>{dictionary.home.roadmap.lead}</p>
                        <a className="button button-light" href="#connect">
                              {dictionary.home.roadmap.cta}
                        </a>
                  </section>

                  <footer>
                        <div className="footer-brand">
                              <span className="brand-mark">V</span>
                              <div>
                                    <strong>Vireon</strong>
                                    <p>{dictionary.home.footer.tagline}</p>
                              </div>
                        </div>
                        <div className="footer-links">
                              <div>
                                    <span>{dictionary.home.footer.exploreHeading}</span>
                                    <a href="#about">{dictionary.home.footer.aboutLink}</a>
                                    <a href="#services">{dictionary.home.footer.servicesLink}</a>
                                    <a href="#applications">{dictionary.home.footer.appsLink}</a>
                                    <Link href="/feed">{dictionary.home.footer.spaceLink}</Link>
                                    <a href="#news">{dictionary.home.footer.newsLink}</a>
                              </div>
                              <div>
                                    <span>{dictionary.home.footer.companyHeading}</span>
                                    <Link href="/tuyen-dung">{dictionary.home.footer.careersLink}</Link>
                                    <Link href="/lien-he">{dictionary.home.footer.contactLink}</Link>
                              </div>
                              <div>
                                    <span>{dictionary.home.footer.connectHeading}</span>
                                    <a href="https://paul-digitalhub.com/wp/" target="_blank" rel="noopener noreferrer">Paul Digital Hub</a>
                                    <a href="https://www.youtube.com/@Technical_Solution_ERP" target="_blank" rel="noopener noreferrer">YouTube</a>
                                    <a href="https://www.linkedin.com/in/nghia-nguyen-790108139/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                                    <a href="https://www.facebook.com/nghia.nguyennhuu.3" target="_blank" rel="noopener noreferrer">Facebook</a>
                              </div>
                        </div>
                        <div className="view-stats" aria-label={dictionary.home.footer.viewsAriaLabel}>
                              <span>
                                    <strong>{viewStats.today}</strong> {dictionary.home.footer.viewsToday}
                              </span>
                              <span>
                                    <strong>{viewStats.week}</strong> {dictionary.home.footer.viewsWeek}
                              </span>
                              <span>
                                    <strong>{viewStats.month}</strong> {dictionary.home.footer.viewsMonth}
                              </span>
                              <span>
                                    <strong>{viewStats.total}</strong> {dictionary.home.footer.viewsTotal}
                              </span>
                        </div>
                        <div className="footer-bottom">
                              <span>{dictionary.home.footer.rights}</span>
                              <a href="#top">{dictionary.home.footer.backToTop}</a>
                        </div>
                  </footer>
            </main>
      );
}

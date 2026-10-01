import Link from "next/link";
import type { Metadata } from "next";
import { listAllTags, listPublishedPosts, type Post } from "@/lib/store/posts";
import { toPlainExcerpt } from "@/lib/markdown";
import { recordView, getViewCounts } from "@/lib/store/views";
import { getSiteNav } from "@/lib/nav";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import SiteHeader from "../components/SiteHeader";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const dictionary = getDictionary(await getLocale());
  return {
    title: dictionary.feed.metaTitle,
    description: dictionary.feed.metaDescription,
    alternates: { canonical: "/feed" },
    openGraph: {
      type: "website",
      title: `${dictionary.feed.metaTitle} | Vireon`,
      description: dictionary.feed.metaDescription,
      url: "/feed",
    },
  };
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
    .format(new Date(value))
    .replace(/\//g, ".");
}

async function getFeedData(tag?: string): Promise<{ posts: Post[]; tags: string[] }> {
  try {
    const [posts, tags] = await Promise.all([listPublishedPosts(tag), listAllTags()]);
    return { posts, tags };
  } catch {
    return { posts: [], tags: [] };
  }
}

async function getPostViewCounts(posts: Post[]): Promise<Map<string, number>> {
  try {
    return await getViewCounts("post", posts.map((post) => post.id));
  } catch {
    return new Map();
  }
}

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const { tag } = await searchParams;
  const locale = await getLocale();
  const dictionary = getDictionary(locale);
  const { posts, tags } = await getFeedData(tag);
  try {
    await recordView("site");
  } catch {
    // ignore
  }
  const postViewCounts = await getPostViewCounts(posts);

  return (
    <main>
      <SiteHeader eyebrow={dictionary.feed.kicker} links={getSiteNav(dictionary)} locale={locale} />

      <section className="section space">
        <div className="section-heading">
          <div>
            <p className="kicker">{dictionary.feed.kicker}</p>
            <h1>{dictionary.feed.title}</h1>
          </div>
          <p>{dictionary.feed.lead}</p>
        </div>

        {tags.length > 0 && (
          <div className="feed-filters">
            <Link className={!tag ? "active" : ""} href="/feed">
              {dictionary.feed.all}
            </Link>
            {tags.map((item) => (
              <Link
                key={item}
                className={tag === item ? "active" : ""}
                href={`/feed?tag=${encodeURIComponent(item)}`}
              >
                {item}
              </Link>
            ))}
          </div>
        )}

        {posts.length === 0 ? (
          <p className="admin-empty">{dictionary.feed.empty}</p>
        ) : (
          <div className="space-grid">
            {posts.map((post) => (
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
                    <time>{formatDate(post.createdAt)}</time>
                    <span className="comment-badge">
                      👁 {postViewCounts.get(post.id) ?? 0} {dictionary.feed.viewBadge}
                    </span>
                  </div>
                  <h3>{post.title}</h3>
                  <p>{toPlainExcerpt(post.body)}</p>
                  {post.tags.length > 0 && (
                    <div className="tag-row">
                      {post.tags.map((item) => (
                        <span className="tag-chip" key={item}>
                          {item}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        <p>
          <Link className="text-link" href="/">
            {dictionary.feed.back}
          </Link>
        </p>
      </section>
    </main>
  );
}

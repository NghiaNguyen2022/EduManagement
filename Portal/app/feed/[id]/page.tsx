import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPostById, type Post } from "@/lib/store/posts";
import { renderMarkdownLite, toPlainExcerpt } from "@/lib/markdown";
import { listComments, type Comment } from "@/lib/store/comments";
import { recordView, getViewCount } from "@/lib/store/views";
import { SITE_NAME, SITE_URL } from "@/lib/site-config";
import { getSiteNav } from "@/lib/nav";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import SiteHeader from "../../components/SiteHeader";
import CommentForm from "./CommentForm";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const post = await getPublishedPost(id);
  const dictionary = getDictionary(await getLocale());

  if (!post) {
    return { title: dictionary.feed.notFoundTitle };
  }

  const description = toPlainExcerpt(post.body);
  const imageUrl = post.coverImageKey ? `/api/images/${post.coverImageKey}` : undefined;

  return {
    title: post.title,
    description,
    alternates: { canonical: `/feed/${post.id}` },
    openGraph: {
      type: "article",
      title: post.title,
      description,
      url: `/feed/${post.id}`,
      publishedTime: post.createdAt,
      modifiedTime: post.updatedAt,
      tags: post.tags,
      images: imageUrl ? [{ url: imageUrl }] : undefined,
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title: post.title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
    .format(new Date(value))
    .replace(/\//g, ".");
}

async function getPublishedPost(id: string): Promise<Post | null> {
  try {
    const post = await getPostById(id);
    return post && post.published ? post : null;
  } catch {
    return null;
  }
}

async function getComments(postId: string): Promise<Comment[]> {
  try {
    return await listComments(postId);
  } catch {
    return [];
  }
}

function formatCommentDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const locale = await getLocale();
  const dictionary = getDictionary(locale);
  const post = await getPublishedPost(id);

  if (!post) notFound();

  try {
    await recordView("site");
    await recordView("post", post.id);
  } catch {
    // ignore
  }
  const viewCount = await getViewCount("post", post.id).catch(() => 0);
  const comments = await getComments(post.id);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: toPlainExcerpt(post.body),
    datePublished: post.createdAt,
    dateModified: post.updatedAt,
    author: { "@type": "Organization", name: SITE_NAME },
    publisher: { "@type": "Organization", name: SITE_NAME },
    mainEntityOfPage: `${SITE_URL}/feed/${post.id}`,
    ...(post.coverImageKey ? { image: [`${SITE_URL}/api/images/${post.coverImageKey}`] } : {}),
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader eyebrow={dictionary.feed.kicker} links={getSiteNav(dictionary)} locale={locale} />

      <article className="post-detail">
        <Link className="back-link" href="/feed">
          {dictionary.feed.detailBack}
        </Link>
        <div className="post-detail-meta">
          <time>{formatDate(post.createdAt)}</time>
          <span className="comment-badge">
            👁 {viewCount} {dictionary.feed.viewBadge}
          </span>
        </div>
        <h1>{post.title}</h1>
        {post.tags.length > 0 && (
          <div className="tag-row">
            {post.tags.map((tag) => (
              <span className="tag-chip" key={tag}>
                {tag}
              </span>
            ))}
          </div>
        )}
        {post.coverImageKey && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="post-detail-cover"
            src={`/api/images/${post.coverImageKey}`}
            alt=""
          />
        )}
        <div
          className="post-detail-body"
          dangerouslySetInnerHTML={{ __html: renderMarkdownLite(post.body) }}
        />

        <section className="comments-section">
          <h2>
            {dictionary.feed.commentsHeading} ({comments.length})
          </h2>

          {comments.length > 0 && (
            <div className="comment-list">
              {comments.map((item) => (
                <article className="comment-item" key={item.id}>
                  <div className="comment-item-head">
                    <strong>{item.name}</strong>
                    <span>{formatCommentDate(item.createdAt)}</span>
                  </div>
                  <p>{item.comment}</p>
                </article>
              ))}
            </div>
          )}

          <div className="comment-form-card">
            <h3>{dictionary.feed.commentFormHeading}</h3>
            <CommentForm postId={post.id} locale={locale} />
          </div>
        </section>
      </article>
    </main>
  );
}

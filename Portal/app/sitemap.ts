import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-config";
import { listApps } from "@/lib/store/apps";
import { listPublishedPosts } from "@/lib/store/posts";
import { workApps } from "@/lib/work-apps";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    ...['/tools', '/tools/excel', '/tools/billscan', '/tools/sitereport', '/tools/quotecompare'].map(route => ({ url: `${SITE_URL}${route}`, changeFrequency: 'monthly' as const, priority: 0.7 })),
    { url: `${SITE_URL}/feed`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/app-portal`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/tuyen-dung`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/lien-he`, changeFrequency: "monthly", priority: 0.6 },
  ];

  const apps = await listApps("vi");
  const appRoutes: MetadataRoute.Sitemap = apps
    .filter((app) => app.hasDetailPage)
    .map((app) => ({
      url: `${SITE_URL}/app-portal/${app.slug}`,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

  let postRoutes: MetadataRoute.Sitemap = [];
  try {
    const posts = await listPublishedPosts();
    postRoutes = posts.map((post) => ({
      url: `${SITE_URL}/feed/${post.id}`,
      lastModified: post.updatedAt,
      changeFrequency: "monthly",
      priority: 0.6,
    }));
  } catch {
    postRoutes = [];
  }

  return [...staticRoutes, ...appRoutes, ...workApps.map(app => ({ url: `${SITE_URL}/app-portal/${app.slug}`, changeFrequency: "monthly" as const, priority: 0.8 })), ...postRoutes];
}

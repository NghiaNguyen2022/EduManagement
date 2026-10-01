import Link from "next/link";
import type { Metadata } from "next";
import { channels, resolveChannel } from "@/lib/channels";
import { recordView } from "@/lib/store/views";
import { getSiteNav } from "@/lib/nav";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import SiteHeader from "../components/SiteHeader";

export async function generateMetadata(): Promise<Metadata> {
  const dictionary = getDictionary(await getLocale());
  return {
    title: dictionary.lienHe.metaTitle,
    description: dictionary.lienHe.metaDescription,
    alternates: { canonical: "/lien-he" },
    openGraph: {
      type: "website",
      title: `${dictionary.lienHe.metaTitle} | Vireon`,
      description: dictionary.lienHe.metaDescription,
      url: "/lien-he",
    },
  };
}

export default async function ContactPage() {
  const locale = await getLocale();
  const dictionary = getDictionary(locale);
  try {
    await recordView("site");
  } catch {
    // ignore
  }

  return (
    <main>
      <SiteHeader eyebrow={dictionary.lienHe.kicker} links={getSiteNav(dictionary)} locale={locale} />

      <section className="section connect">
        <div className="section-heading">
          <div>
            <p className="kicker">{dictionary.lienHe.kicker}</p>
            <h1>{dictionary.lienHe.title}</h1>
          </div>
          <p>{dictionary.lienHe.lead}</p>
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

        <p>
          <Link className="text-link" href="/">
            {dictionary.lienHe.back}
          </Link>
        </p>
      </section>
    </main>
  );
}

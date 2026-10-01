import Link from "next/link";
import type { Metadata } from "next";
import { CONTACT_EMAIL } from "@/lib/site-config";
import { recordView } from "@/lib/store/views";
import { getSiteNav } from "@/lib/nav";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import SiteHeader from "../components/SiteHeader";

export async function generateMetadata(): Promise<Metadata> {
  const dictionary = getDictionary(await getLocale());
  return {
    title: dictionary.tuyenDung.metaTitle,
    description: dictionary.tuyenDung.metaDescription,
    alternates: { canonical: "/tuyen-dung" },
    openGraph: {
      type: "website",
      title: `${dictionary.tuyenDung.metaTitle} | Vireon`,
      description: dictionary.tuyenDung.metaDescription,
      url: "/tuyen-dung",
    },
  };
}

export default async function CareersPage() {
  const locale = await getLocale();
  const dictionary = getDictionary(locale);
  try {
    await recordView("site");
  } catch {
    // ignore
  }

  return (
    <main>
      <SiteHeader eyebrow={dictionary.tuyenDung.kicker} links={getSiteNav(dictionary)} locale={locale} />

      <section className="section careers">
        <div className="section-heading">
          <div>
            <p className="kicker">{dictionary.tuyenDung.kicker}</p>
            <h1>{dictionary.tuyenDung.title}</h1>
          </div>
          <p>{dictionary.tuyenDung.lead}</p>
        </div>

        <div className="careers-empty">
          <p className="careers-empty-title">{dictionary.tuyenDung.emptyTitle}</p>
          <p>{dictionary.tuyenDung.emptyBody}</p>
          <a className="button button-primary" href={`mailto:${CONTACT_EMAIL}`}>
            {dictionary.tuyenDung.cta}
          </a>
        </div>

        <p>
          <Link className="text-link" href="/">
            {dictionary.tuyenDung.back}
          </Link>
        </p>
      </section>
    </main>
  );
}

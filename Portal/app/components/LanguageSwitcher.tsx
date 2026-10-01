"use client";

import { useRouter } from "next/navigation";
import { LOCALE_COOKIE, type Locale } from "@/lib/i18n/config";

type Props = {
  locale: Locale;
  label: string;
};

export default function LanguageSwitcher({ locale, label }: Props) {
  const router = useRouter();

  function setLocale(next: Locale) {
    if (next === locale) return;
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }

  return (
    <div className="lang-switch" role="group" aria-label={label}>
      <button
        type="button"
        className={locale === "vi" ? "active" : ""}
        aria-pressed={locale === "vi"}
        onClick={() => setLocale("vi")}
      >
        VI
      </button>
      <button
        type="button"
        className={locale === "en" ? "active" : ""}
        aria-pressed={locale === "en"}
        onClick={() => setLocale("en")}
      >
        EN
      </button>
    </div>
  );
}

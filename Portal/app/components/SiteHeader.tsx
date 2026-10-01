"use client";

import Link from "next/link";
import { useState } from "react";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionary";
import LanguageSwitcher from "./LanguageSwitcher";

type NavLink = {
  href: string;
  label: string;
};

type Props = {
  eyebrow: string;
  links: NavLink[];
  locale: Locale;
  ctaHref?: string;
  ctaLabel?: string;
  brandHref?: string;
};

// Pure same-page anchors (e.g. "#applications") need a native <a> — this
// vinext runtime's <Link> does not perform the browser's default hash
// scroll for hash-only hrefs. Cross-page hrefs (e.g. "/feed", "/#news")
// still go through next/link for client-side routing.
function isHashOnly(href: string): boolean {
  return href.startsWith("#");
}

export default function SiteHeader({
  eyebrow,
  links,
  locale,
  ctaHref,
  ctaLabel,
  brandHref = "/",
}: Props) {
  const [open, setOpen] = useState(false);
  const dictionary = getDictionary(locale);

  return (
    <header className="site-header">
      <div className="site-header-inner">
        {isHashOnly(brandHref) ? (
          <a
            className="brand"
            href={brandHref}
            aria-label={dictionary.chrome.backToHome}
            onClick={() => setOpen(false)}
          >
            <span className="brand-mark">V</span>
            <span>
              <strong>Vireon</strong>
              <small>{eyebrow}</small>
            </span>
          </a>
        ) : (
          <Link
            className="brand"
            href={brandHref}
            aria-label={dictionary.chrome.backToHome}
            onClick={() => setOpen(false)}
          >
            <span className="brand-mark">V</span>
            <span>
              <strong>Vireon</strong>
              <small>{eyebrow}</small>
            </span>
          </Link>
        )}

        <div className="site-header-right">
          <LanguageSwitcher locale={locale} label={dictionary.chrome.languageLabel} />

          <button
            className="nav-toggle"
            type="button"
            aria-label={open ? dictionary.chrome.closeMenu : dictionary.chrome.openMenu}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            <span />
            <span />
            <span />
          </button>

          <nav className={`site-nav${open ? " open" : ""}`} aria-label={dictionary.chrome.mainNav}>
            {links.map((link) =>
              isHashOnly(link.href) ? (
                <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
                  {link.label}
                </a>
              ) : (
                <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
                  {link.label}
                </Link>
              ),
            )}
            {ctaHref && ctaLabel && (
              <a
                className="nav-cta"
                href={ctaHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
              >
                {ctaLabel}
              </a>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

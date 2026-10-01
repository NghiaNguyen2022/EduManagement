import type { Dictionary } from "./i18n/dictionary";

export type NavLink = {
  href: string;
  label: string;
};

// Used on the homepage itself: pure hash anchors so SiteHeader renders a
// native <a> (this runtime's next/link does not scroll for hash-only hrefs).
export function getHomeNav(dictionary: Dictionary): NavLink[] {
  return [
    { href: "/tools", label: "Vireon Tools" },
    { href: "/app-portal#work-apps", label: "Vireon Labs" },
    { href: "#about", label: dictionary.nav.about },
    { href: "#applications", label: dictionary.nav.apps },
    { href: "/feed", label: dictionary.nav.feed },
    { href: "/app-portal", label: dictionary.nav.appPortal },
    { href: "/tuyen-dung", label: dictionary.nav.careers },
    { href: "/lien-he", label: dictionary.nav.contact },
  ];
}

// Used on every other page: path + hash so it navigates to the homepage
// first, then scrolls to the section.
export function getSiteNav(dictionary: Dictionary): NavLink[] {
  return [
    { href: "/tools", label: "Vireon Tools" },
    { href: "/app-portal#work-apps", label: "Vireon Labs" },
    { href: "/#about", label: dictionary.nav.about },
    { href: "/#applications", label: dictionary.nav.apps },
    { href: "/feed", label: dictionary.nav.feed },
    { href: "/app-portal", label: dictionary.nav.appPortal },
    { href: "/tuyen-dung", label: dictionary.nav.careers },
    { href: "/lien-he", label: dictionary.nav.contact },
  ];
}

/**
 * ══════════════════════════════════════════════════════════════════════════════
 * configuration.ts — Static Site Configuration for the Blog CMS
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * This file controls all static text, branding, titles, navigation links,
 * hero section text, footer details, and administrative panel headings.
 *
 * How it works:
 *   1. Edit any values in this file.
 *   2. When running `docker compose up`, `npm run dev`, or `npm run build`,
 *      the configuration script automatically validates and places all content
 *      into its appropriate static location across the app.
 * ══════════════════════════════════════════════════════════════════════════════
 */

export interface NavLink {
  name: string;
  href: string;
  icon?: string;
}

export interface SiteConfig {
  /** Global site identity */
  site: {
    name: string;
    brandPrefix: string;
    brandName: string;
    metaTitleDefault: string;
    metaTitleTemplate: string;
    metaDescription: string;
    footerText: string;
    copyrightYear?: number;
  };

  /** Header navigation configuration */
  navbar: {
    brandPrefix: string;
    brandName: string;
    links: NavLink[];
  };

  /** Homepage hero section & static copy */
  homepage: {
    metaTitle: string;
    metaDescription: string;
    heroTitle: string;
    heroDescription: string;
    badgeText: string;
    latestStoriesTitle: string;
    emptyStateTitle: string;
    emptyStateDescription: string;
  };

  /** Admin CMS panel static copy */
  admin: {
    title: string;
    brandName: string;
    metaDescription: string;
    loginTitle: string;
    loginDescription: string;
  };
}

export const siteConfig: SiteConfig = {
  site: {
    name: "Editorial Studio",
    brandPrefix: "The",
    brandName: "Editorial Studio",
    metaTitleDefault: "Blog",
    metaTitleTemplate: "%s | Blog",
    metaDescription:
      "A modern blog platform with articles, categories, and tags.",
    footerText: "Blog. All rights reserved.",
  },

  navbar: {
    brandPrefix: "",
    brandName: "Sukh Studio",
    links: [
      { name: "Home", href: "/" },
      { name: "Search", href: "/search", icon: "Search" },
    ],
  },

  homepage: {
    metaTitle: "The Journal — Editorial Studio",
    metaDescription:
      "Thoughtful essays, reviews, and technical guides written by content editors and publishers.",
    heroTitle: "The Journal",
    heroDescription:
      "Thoughtful essays, reviews, and technical guides. Written by content editors and publishers of The Editorial Studio.",
    badgeText: "Publishing Live",
    latestStoriesTitle: "Latest Stories",
    emptyStateTitle: "No articles published yet.",
    emptyStateDescription:
      "Head over to the Admin CMS to publish your first piece.",
  },

  admin: {
    title: "Admin",
    brandName: "Studio",
    metaDescription: "Blog CMS Administration",
    loginTitle: "Welcome back",
    loginDescription: "Sign in to your account to continue.",
  },
};

export default siteConfig;

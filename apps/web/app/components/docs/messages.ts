/**
 * Reader-facing chrome copy for the docs shell (English-only site). The
 * `docs-prose` guard scans this file, so keep it em-dash-free like the docs.
 */
export const messages = {
  header: {
    section: "Docs",
    openNav: "Open navigation",
    home: "SINA home",
    github: "SINA on GitHub",
    drawerTitle: "Documentation",
    drawerDescription: "Site navigation",
  },
  search: {
    trigger: "Search…",
    placeholder: "Search docs…",
    title: "Search documentation",
    description: "Search the SINA docs by keyword.",
    empty: "No results.",
  },
  pager: {
    previous: "Previous",
    next: "Next",
  },
  toc: {
    heading: "On this page",
  },
  theme: {
    label: "Theme",
    system: "Follow system",
    light: "Light",
    dark: "Dark",
  },
  marketing: {
    tagline:
      "The governed design system for AI agents. The model emits intent. SINA decides what renders.",
    cta: "Read the docs",
  },
} as const;

import type { Messages } from "./types";

/**
 * English — the source catalog. Reader-facing English chrome copy; the
 * `docs-prose` guard scans this file, so keep it em-dash-free like the docs.
 */
export const en: Messages = {
  header: {
    section: "Docs",
    openNav: "Open navigation",
    home: "SINA home",
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
  language: {
    label: "Language",
  },
  marketing: {
    tagline:
      "The governed design system for AI agents. The model emits intent. SINA decides what renders.",
    cta: "Read the docs",
  },
  notice: {
    machineTranslated: "This page was machine-translated. Native review is recommended.",
  },
};

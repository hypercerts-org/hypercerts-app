interface SiteConfig {
  name: string;
  origin: string;
  description: string;
  localeDefault: string;
  links: {
    discord: string;
    twitter: string;
    github: string;
    docs: string;
    createHypercert: string;
    createCollection: string;
    createBlueprint: string;
    explore: string;
    evaluators: string;
    profile: string;
    settings: string;
  };
}

export const siteConfig: SiteConfig = {
  name: "Hypercerts",
  origin: "https://app.hypercerts.org",
  description:
    "Explore, mint, manage, buy, sell, and evaluate Hypercerts with ease.",
  localeDefault: "en",
  links: {
    discord: "https://discord.gg/azPgDcSQWw",
    twitter: "https://twitter.com/hypercerts",
    github: "https://github.com/hypercerts-org/",
    docs: "https://hypercerts.org/docs/",
    createHypercert: "/hypercerts/new",
    createCollection: "/collections/create",
    createBlueprint: "/blueprints/new",
    explore: "/explore",
    evaluators: "/evaluators",
    settings: "/settings",
    profile: "/profile",
  },
};

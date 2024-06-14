import { Book, Compass, LucideIcon, PlusCircle } from "lucide-react";

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
    createHyperboard: string;
    explore: string;
    evaluators: string;
  };
}

export const siteConfig: SiteConfig = {
  name: "Hypercerts",
  origin: "https://app.hypercerts.org",
  description:
    "Explore, mint, manage, buy, sell, and evaluate Hypercerts with ease.",
  localeDefault: "en",
  links: {
    discord: "https://discord.gg/uExrjW4h7W",
    twitter: "https://twitter.com/hypercerts",
    github: "https://github.com/hypercerts-org/",
    docs: "https://hypercerts.org/docs/",
    createHypercert: "/hypercerts/new",
    createHyperboard: "/hyperboards/new",
    explore: "/explore",
    evaluators: "/evaluators",
  },
};

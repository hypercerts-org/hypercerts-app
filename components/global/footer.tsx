import { Copyright } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const footerLinks = [
  {
    label: "Privacy Policy",
    url: "https://hypercerts.org/privacy",
  },
  {
    label: "Terms of use",
    url: "https://hypercerts.org/terms",
  },
];

const footerIcons = [
  {
    label: "Twitter",
    url: "https://x.com/hypercerts",
    icon: "/social-icons/x.svg",
  },
  {
    label: "Discord",
    url: "https://discord.gg/azPgDcSQWw",
    icon: "/social-icons/discord.svg",
  },
  {
    label: "Hypercerts Foundation",
    url: "https://hypercerts.org",
    icon: "/hypercerts-logo.svg",
  },
  {
    label: "Github",
    url: "https://github.com/hypercerts-org/",
    icon: "/social-icons/github.svg",
  },
  {
    label: "Telegram",
    url: "https://t.me/+YF9AYb6zCv1mNDJi",
    icon: "/social-icons/telegram.svg",
  },
];

const Footer = () => (
  <footer className="flex flex-col space-y-2 justify-center items-center py-5 px-3 border-t-[1.5px] border-black pb-24 md:pb-5 bg-slate-50 mt-auto">
    <ul className="flex space-x-4">
      {footerIcons.map((item) => (
        <a
          className="relative hover:-translate-y-1 hover:opacity-75 transition-transform"
          href={item.url}
          title={item.label}
          key={item.label}
          target="_blank"
        >
          <Image src={item.icon} alt={item.label} width={30} height={30} />
        </a>
      ))}
    </ul>

    <ul className="flex space-x-1">
      {footerLinks.map((item) => (
        <a href={item.url} key={item.url} target="_blank">
          <Button variant={"link"}>{item.label}</Button>
        </a>
      ))}
    </ul>

    <p className="flex space-x-1 items-center text-sm">
      <span>Copyright</span> <Copyright size={12} />{" "}
      <span>{new Date().getFullYear()}</span>
      <span>Hypercerts Foundation</span>
    </p>
  </footer>
);

export { Footer as default };

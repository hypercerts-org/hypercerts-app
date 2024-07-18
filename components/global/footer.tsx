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

const Footer = () => (
  <footer className="flex flex-col space-y-2 justify-center items-center py-5 px-3 border-t-[1.5px] border-black pb-24 md:pb-5 bg-slate-50 mt-auto">
    <Link className="relative" href={"/"} title="Hypercerts">
      <Image
        src={"/hypercerts-logo.png"}
        alt="Hypercerts logo"
        width={48}
        height={48}
      />
    </Link>

    <ul className="flex space-x-1">
      {footerLinks.map((item) => (
        <a href={item.url} key={item.url} target="_blank">
          <Button variant={"link"}>{item.label}</Button>
        </a>
      ))}
    </ul>

    <p className="flex space-x-1 items-center text-sm">
      <span>Copyright</span> <Copyright size={12} /> <span>{new Date().getFullYear()}</span>
      <span>Hypercerts Foundation</span>
    </p>
  </footer>
);

export { Footer as default };

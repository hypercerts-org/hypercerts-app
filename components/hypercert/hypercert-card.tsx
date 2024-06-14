import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkle } from "lucide-react";
import Image from "next/image";
import { forwardRef } from "react";

/**
 * HypercertCard component
 * @param {string} name - The name of the hypercert
 * @param {string} description - The description of the hypercert
 * @param {string} banner - The banner image of the hypercert
 * @param {string} logo - The logo image of the hypercert
 * @param {string} link - The link of the hypercert
 * @param {boolean} displayOnly - Whether the card is just for display (non-interactive) or not
 * @param {string} hypercertId - The unique identifier for the hypercert
 */
export interface HypercertCardProps {
  name?: string;
  description?: string;
  banner?: string;
  logo?: string;
  fromDateDisplay?: string | null;
  toDateDisplay?: string | null;
  scopes?: string[];
}

const defaultValues: HypercertCardProps = {
  name: "Your title here",
  description: "Your description here",
  scopes: [],
};

const HypercertCard = forwardRef<HTMLDivElement, HypercertCardProps>(
  (
    {
      name: title,
      description,
      banner,
      fromDateDisplay,
      toDateDisplay,
      logo,
      scopes,
    }: HypercertCardProps = defaultValues,
    ref
  ) => {
    title = title ?? defaultValues.name;
    description = description ?? defaultValues.description;

    const formattedDateRange =
      fromDateDisplay && toDateDisplay
        ? fromDateDisplay === toDateDisplay
          ? fromDateDisplay
          : `${fromDateDisplay} - ${toDateDisplay}`
        : "";

    const CardContent = () => (
      <article
        ref={ref}
        className="relative w-[275px] rounded-xl border-[1.5px] border-slate-500 overflow-clip bg-black"
      >
        <header className="relative h-[135px] w-full flex items-center justify-center rounded-b-xl overflow-clip">
          {banner ? (
            <Image
              src={banner}
              alt={`${title} banner`}
              className="object-cover object-center"
              fill
              unoptimized
            />
          ) : (
            <div className="flex items-center justify-center bg-slate-200 h-full w-full">
              <span className="text-slate-500 text-lg">Your banner here</span>
            </div>
          )}
          <div className="absolute inset-0 mix-blend-luminosity w-full h-full">
            <Image
              src={"/hc-guilloche.svg"}
              alt="Guilloche"
              className="object-cover opacity-25"
              fill
              unoptimized
            />
          </div>
        </header>
        <section className="absolute top-4 left-3 border-white border-2 rounded-full overflow-hidden bg-slate-200">
          <div className="relative w-8 h-8 flex items-center justify-center border border-slate-300 rounded-full overflow-hidden">
            {logo ? (
              <Image
                src={logo}
                alt={`${title} logo`}
                fill
                unoptimized
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center bg-slate-300 h-10 w-10">
                <Sparkle size={24} />
              </div>
            )}
          </div>
        </section>
        <section className="p-3 pt-4 rounded-t-xl bg-white border-t-[1.5px] border-black space-y-2">
          <div className="flex items-center">
            <span className="text-xs text-slate-600 uppercase">
              {formattedDateRange}
            </span>
          </div>
          <h5
            className="text-base font-semibold text-slate-800 h-10 line-clamp-2 text-ellipsis tracking-tight leading-tight"
            title={title}
          >
            {title}
          </h5>
          <ScrollArea className="h-[50px]">
            <div className="flex flex-wrap gap-1">
              {scopes?.map((scope) => (
                <span
                  key={scope}
                  className="text-xs text-slate-600 px-1 py-0.5 border-[1.5px] border-slate-300 rounded-lg"
                >
                  {scope}
                </span>
              ))}
            </div>
          </ScrollArea>
        </section>
      </article>
    );
    return <CardContent />;
  }
);

HypercertCard.displayName = "HypercertCard";

export { HypercertCard as default };

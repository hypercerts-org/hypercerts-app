import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkle } from "lucide-react";
import Image from "next/image";
import { forwardRef } from "react";

/**
 * HypercertCard component
 * @param {string} name - The name of the hypercert
 * @param {string} banner - The banner image of the hypercert
 * @param {string} logo - The logo image of the hypercert
 * @param {string} link - The link of the hypercert
 * @param {boolean} displayOnly - Whether the card is just for display (non-interactive) or not
 * @param {string} hypercertId - The unique identifier for the hypercert
 */
export interface HypercertCardProps {
  name?: string;
  banner?: string;
  logo?: string;
  fromDateDisplay?: string | null;
  toDateDisplay?: string | null;
  scopes?: string[];
}

const defaultValues: HypercertCardProps = {
  name: "Your title here",
  scopes: [],
};

const HypercertCard = forwardRef<HTMLDivElement, HypercertCardProps>(
  (
    {
      name: title,
      banner,
      fromDateDisplay,
      toDateDisplay,
      logo,
      scopes,
    }: HypercertCardProps = defaultValues,
    ref,
  ) => {
    title = title ?? defaultValues.name;

    const formattedDateRange =
      fromDateDisplay && toDateDisplay
        ? fromDateDisplay === toDateDisplay
          ? fromDateDisplay
          : `${fromDateDisplay} — ${toDateDisplay}`
        : "";

    const CardContent = () => {
      const maxVisibleTags = 7;
      const maxScopeLength = 12;

      const clipScope = (scope: string) =>
        scope.length > maxScopeLength
          ? scope.slice(0, maxScopeLength - 3) + "..."
          : scope;

      const visibleScopes =
        scopes?.slice(0, maxVisibleTags).map(clipScope) || [];
      const hiddenScopesCount = (scopes?.length || 0) - visibleScopes.length;

      return (
        <article
          ref={ref}
          className="relative w-[336px] h-[420px] rounded-xl border-[1px] border-black overflow-clip bg-black"
        >
          <header className="relative h-[173px] w-full flex items-center justify-center rounded-b-xl overflow-clip">
            {banner ? (
              <Image
                src={`https://cors-proxy.hypercerts.workers.dev/?url=${banner}`}
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
          </header>
          <section className="absolute top-4 left-3 border-white border-2 rounded-full overflow-hidden bg-slate-200">
            <div className="relative w-8 h-8 flex items-center justify-center border border-slate-300 rounded-full overflow-hidden">
              {logo ? (
                <Image
                  src={`https://cors-proxy.hypercerts.workers.dev/?url=${logo}`}
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
          <section className="p-3 pt-4 rounded-t-xl bg-white border-t-[1px] border-black h-[246px] flex flex-col">
            <div className="flex items-center mb-2">
              <span className="text-xs text-slate-600 uppercase">
                {formattedDateRange}
              </span>
            </div>
            <h5
              className="text-xl font-bold text-slate-800 line-clamp-3 text-ellipsis tracking-[-0.03em] leading-tight mb-2"
              title={title}
            >
              {title}
            </h5>
            <div className="h-[60px] mt-auto overflow-hidden">
              <div className="flex flex-wrap gap-1 justify-start h-full content-end pb-1">
                {visibleScopes.map((scope) => (
                  <span
                    key={scope}
                    className="text-xs text-slate-600 px-2 py-1 leading-none border border-slate-400 rounded-full flex items-center"
                    title={
                      scope.endsWith("...")
                        ? scopes?.find((s) => s.startsWith(scope.slice(0, -3)))
                        : scope
                    }
                  >
                    {scope}
                  </span>
                ))}
                {hiddenScopesCount > 0 && (
                  <span className="text-xs text-slate-900 px-2 py-1 leading-none border border-slate-400 rounded-full flex items-center bg-neutral-100">
                    +{hiddenScopesCount} more
                  </span>
                )}
              </div>
            </div>
          </section>
        </article>
      );
    };

    return <CardContent />;
  },
);

HypercertCard.displayName = "HypercertCard";

export { HypercertCard as default };

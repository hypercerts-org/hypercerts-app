import { ArrowRight, Sparkle } from "lucide-react";
import Image from "next/image";
import { forwardRef } from "react";

/**
 * HypercertCard component
 * @param {string} name - The name of the hypercert
 * @param {string} banner - The banner image of the hypercert
 *
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
      fromDateDisplay && toDateDisplay ? (
        fromDateDisplay === toDateDisplay ? (
          fromDateDisplay
        ) : (
          <span className="flex items-center">
            {fromDateDisplay} <ArrowRight size={12} className="inline mx-1" />{" "}
            {toDateDisplay}
          </span>
        )
      ) : null;

    const CardContent = () => {
      const maxVisibleTags = 6;
      const maxScopeLength = 14;

      const clipScope = (scope: string) =>
        scope.trim().length > maxScopeLength
          ? scope.trim().slice(0, maxScopeLength - 3) + "..."
          : scope.trim();

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
                src={banner}
                alt={`${title} banner`}
                className="object-cover object-center"
                fill
                unoptimized
              />
            ) : (
              <div className="flex items-center justify-center bg-accent h-full w-full">
                <span className="text-slate-500 text-lg">Your banner here</span>
              </div>
            )}
          </header>
          <section className="absolute top-4 left-3 border-white border-2 rounded-full overflow-hidden bg-accent">
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
          <section className="p-3 pt-4 rounded-t-xl bg-white border-t-[1px] border-black h-[246px] flex flex-col justify-between">
            <h5
              className="text-[28px] font-semibold text-slate-800 line-clamp-3 text-ellipsis tracking-[-0.03em] leading-[30px] py-1"
              title={title}
            >
              {title}
            </h5>
            <section className="border-t-[1.5px] border-black">
              <div className="flex items-center pb-2 pt-1 justify-between">
                <span className="uppercase text-xs tracking-wide">work</span>
                <span className="text-xs uppercase font-medium">
                  {formattedDateRange}
                </span>
              </div>
              <div className="h-[62px] mt-auto overflow-hidden w-full">
                <div className="flex flex-wrap gap-1 justify-start h-full content-end pb-1">
                  {visibleScopes.map((scope) => (
                    <span
                      key={scope}
                      className="text-base px-2 py-1 leading-none border-[1.5px] border-black rounded-lg flex items-center"
                      title={
                        scope.endsWith("...")
                          ? scopes?.find((s) =>
                              s.startsWith(scope.slice(0, -3)),
                            )
                          : scope
                      }
                    >
                      {scope}
                    </span>
                  ))}
                  {hiddenScopesCount > 0 && (
                    <div className="text-sm font-medium text-slate-900 px-2 py-1 leading-none border border-black rounded-full flex items-center justify-center bg-neutral-100">
                      +{hiddenScopesCount}
                    </div>
                  )}
                </div>
              </div>
            </section>
          </section>
        </article>
      );
    };

    return <CardContent />;
  },
);

HypercertCard.displayName = "HypercertCard";

export { HypercertCard as default };

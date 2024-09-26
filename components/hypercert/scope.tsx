import * as R from "remeda";

import { type HypercertFull } from "@/hypercerts/fragments/hypercert-full.fragment";
import { Badge } from "@/components/ui/badge";

export default function WorkScope({ hypercert }: { hypercert: HypercertFull }) {
  const workScope =
    R.isArray(hypercert.metadata?.work_scope) &&
    hypercert.metadata?.work_scope.length > 0
      ? hypercert.metadata?.work_scope
      : null;

  return (
    <div className="space-y-2 w-full">
      <h5 className="uppercase text-sm text-slate-500 font-medium tracking-wider">
        Work Scope
      </h5>
      <div className="flex flex-wrap gap-1">
        {workScope
          ? workScope.map((scope, i) => (
              <Badge variant="secondary" key={i}>
                {scope}
              </Badge>
            ))
          : "No work scope"}
      </div>
    </div>
  );
}

"use client";

import Pagination from "@/components/pagination";
import { HyperboardRow } from "@/components/hyperboard/hyperboard-row";
import { CreateCollectionButton } from "@/components/collections/buttons";
import { EmptySection } from "@/app/profile/[address]/sections";
import { HyperboardFragment } from "@/collections/hyperboard.fragment";
import { useAccount } from "wagmi";

export default function CollectionsTabContent({
  address,
  hyperboards,
  count,
}: {
  address: string;
  hyperboards: readonly HyperboardFragment[];
  count: number;
}) {
  const { address: loggedInAddress } = useAccount();
  const isOwnProfile = loggedInAddress === address;

  return (
    <div>
      {isOwnProfile && (
        <div className="flex justify-end mb-2">
          <CreateCollectionButton />
        </div>
      )}
      {hyperboards.length === 0 ? (
        <EmptySection />
      ) : (
        <div className="flex flex-col gap-4">
          {hyperboards.map((hyperboard) => (
            <HyperboardRow
              key={hyperboard.id}
              hyperboardId={hyperboard.id}
              name={hyperboard.name || ""}
              description={
                hyperboard.sections?.data?.[0]?.collection.description || ""
              }
              showEditAndDeleteButtons={isOwnProfile}
            />
          ))}
        </div>
      )}

      {count > 0 && (
        <div className="mt-5">
          <Pagination count={count} />
        </div>
      )}
    </div>
  );
}

"use client";

import { EmptySection } from "@/app/profile/[address]/sections";
import { HyperboardRow } from "@/components/hyperboard/hyperboard-row";
import { CreateCollectionButton } from "@/components/collections/buttons";
import { HyperboardFragment } from "@/collections/hyperboard.fragment";
import { useAccount } from "wagmi";

export const HyperboardsOverview = ({
  profileAddress,
  hyperboards,
}: {
  profileAddress: string;
  hyperboards: readonly HyperboardFragment[];
}) => {
  const { address } = useAccount();
  const isOwnProfile = address === profileAddress;
  if (!hyperboards?.length) {
    return (
      <div>
        {isOwnProfile && (
          <div className="flex justify-end mb-2">
            <CreateCollectionButton />
          </div>
        )}
        <EmptySection />
      </div>
    );
  }

  return (
    <div>
      {isOwnProfile && (
        <div className="flex justify-end mb-2">
          <CreateCollectionButton />
        </div>
      )}
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
    </div>
  );
};

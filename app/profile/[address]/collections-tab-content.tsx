import { getCollectionsByAdminAddress } from "@/collections/getCollectionsByAdminAddress";
import { EmptySection } from "@/app/profile/[address]/sections";
import { HyperboardRow } from "@/components/hyperboard/hyperboard-row";
import { Suspense } from "react";
import { defaultDescription } from "@/app/profile/[address]/tabs";

const CollectionsTabContentInner = async ({ address }: { address: string }) => {
  const hyperboards = await getCollectionsByAdminAddress(address.toLowerCase());

  if (!hyperboards?.length) {
    return (
      <EmptySection>
        <p>
          No collections yet. If you want to create a collection, please reach
          out to{" "}
          <a href="mailto:team@hypercerts.org" className="underline">
            team@hypercerts.org
          </a>
        </p>
      </EmptySection>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-4">
        {hyperboards.map((hyperboard) => (
          <HyperboardRow
            key={hyperboard.id}
            hyperboardId={hyperboard.id}
            name={hyperboard.name}
            description={defaultDescription}
          />
        ))}
      </div>
    </div>
  );
};

const CollectionsTabContent = ({ address }: { address: string }) => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CollectionsTabContentInner address={address} />
    </Suspense>
  );
};
export { CollectionsTabContent };

import Link from "next/link";
import { HyperboardWidget } from "@/components/hyperboard/hyperboardWidget";
import {
  DeleteCollectionButton,
  EditCollectionButton,
} from "@/components/collections/buttons";

export const HyperboardRow = ({
  hyperboardId,
  name,
  description,
}: {
  hyperboardId: string;
  name: string;
  description: string;
}) => {
  return (
    <div className="flex w-full">
      <div className="w-1/2">
        <HyperboardWidget hyperboardId={hyperboardId} />
      </div>
      <div className="flex flex-col h-auto w-1/2 justify-start pl-4">
        <Link href={`/collections/${hyperboardId}`}>
          <h3 className="text-lg font-medium">{name}</h3>
        </Link>
        <p className="text-sm text-slate-500">{description}</p>
        <div className="flex space-x-2 mt-2">
          <EditCollectionButton collectionId={hyperboardId} />
          <DeleteCollectionButton collectionId={hyperboardId} />
        </div>
      </div>
    </div>
  );
};

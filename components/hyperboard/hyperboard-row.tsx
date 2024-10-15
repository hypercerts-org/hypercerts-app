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
  showEditAndDeleteButtons,
}: {
  hyperboardId: string;
  name: string;
  description: string;
  showEditAndDeleteButtons?: boolean;
}) => {
  return (
    <div className="flex flex-col md:flex-row w-full">
      <div className="w-full md:w-1/2">
        <HyperboardWidget hyperboardId={hyperboardId} />
      </div>
      <div className="flex flex-col h-auto w-full md:w-1/2 justify-start pl-0 md:pl-4 pt-0 md:pt-0">
        <Link href={`/collections/${hyperboardId}`}>
          <h3 className="text-lg font-medium">{name}</h3>
        </Link>
        <p className="text-sm text-slate-500">{description}</p>
        {showEditAndDeleteButtons && (
          <div className="flex space-x-2 mt-2">
            <EditCollectionButton collectionId={hyperboardId} />
            <DeleteCollectionButton collectionId={hyperboardId} />
          </div>
        )}
      </div>
    </div>
  );
};

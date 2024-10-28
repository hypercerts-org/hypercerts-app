"use client";

import Link from "next/link";
import {
  DeleteCollectionButton,
  EditCollectionButton,
} from "@/components/collections/buttons";
import { HyperboardWidgetContainer } from "@/components/hyperboard/hyperboard-container";

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
        <HyperboardWidgetContainer hyperboardId={hyperboardId} />
      </div>
      <div className="flex flex-col h-auto w-full md:w-1/2 justify-start pl-0 md:pl-4 pt-0 md:pt-0 text-black">
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

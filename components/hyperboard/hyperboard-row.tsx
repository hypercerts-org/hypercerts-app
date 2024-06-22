import Link from "next/link";
import { HyperboardWidget } from "@/components/hyperboard/hyperboardWidget";

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
      <div className="flex flex-col h-auto w-1/2 justify-center pr-4">
        <Link href={`/collections/${hyperboardId}`}>
          <h3 className="text-lg font-medium">{name}</h3>
        </Link>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <div className="w-1/2">
        <HyperboardWidget hyperboardId={hyperboardId} />
      </div>
    </div>
  );
};

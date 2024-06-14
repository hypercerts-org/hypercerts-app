import Image from "next/image";
import { getHypercert } from "../../../hypercerts/getHypercert";

export default async function HypercertRow({
  hypercertId,
}: {
  hypercertId: string;
}) {
  const hypercert = await getHypercert(hypercertId);

  return (
    <div>
      <Image
        src={`/api/hypercerts/${hypercertId}/image`}
        alt={hypercert?.metadata?.name || ""}
        className="object-cover object-top w-[100px] h-[100px]"
        width={100}
        height={100}
      />
      {hypercert?.metadata?.name || "[Untitled]"}
    </div>
  );
}

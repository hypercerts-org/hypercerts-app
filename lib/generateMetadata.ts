import { Metadata, ResolvingMetadata } from "next";
import { getHypercert } from "@/hypercerts/getHypercert";

type Props = {
  params: { hypercertId: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { hypercertId } = params;

  const hypercert = await getHypercert(hypercertId);

  // optionally access and extend (rather than replace) parent metadata
  const previousImages = (await parent).openGraph?.images || [];
  return {
    title: hypercert?.metadata?.name || "Untitled Hypercert",
    description: hypercert?.metadata?.description || "",
    openGraph: {
      images: [
        `/api/hypercerts/${hypercertId}/image`,
        "/hypercerts-opengraph.jpg",
        ...previousImages,
      ],
    },
  };
}

import { NextRequest, NextResponse } from "next/server";

import { HYPERCERTS_API_URL } from "@/configs/hypercerts";
import graphQlrequest from "graphql-request";
import { graphql } from "@/lib/graphql";

// GraphQL query to fetch the image metadata for a given hypercert ID
const IMAGE_QUERY = graphql(`
  query HypercertImage($hypercert_id: String!) {
    hypercerts(where: { hypercert_id: { eq: $hypercert_id } }) {
      data {
        metadata {
          image
        }
      }
    }
  }
`);

// Default placeholder image URL
const PLACEHOLDER_IMAGE_URL = "/hypercert-placeholder.webp";

// Extract image data from a base64 string or a URL
async function getImageData(
  imageOrUrl: string
): Promise<{ contentType: string; buffer: Buffer }> {
  if (imageOrUrl.startsWith("data:image")) {
    const [metadata, base64Data] = imageOrUrl.split(",");
    const contentType = metadata.split(";")[0].split(":")[1];
    const buffer = Buffer.from(base64Data, "base64");
    return { contentType, buffer };
  }

  if (imageOrUrl.startsWith("http")) {
    const response = await fetch(imageOrUrl);
    const blob = await response.blob();
    const buffer = Buffer.from(await blob.arrayBuffer());
    return { contentType: blob.type, buffer };
  }

  throw new Error("Invalid image data");
}

// Fetch and respond with the placeholder image
async function placeholderImageResponse(request: NextRequest) {
  const placeholderResponse = await fetch(
    `${request.headers.get("x-forwarded-proto")}://${request.headers.get(
      "host"
    )}${PLACEHOLDER_IMAGE_URL}`
  );
  const blob = await placeholderResponse.blob();
  const buffer = Buffer.from(await blob.arrayBuffer());
  return new NextResponse(buffer, {
    status: 200,
    headers: { "Content-Type": blob.type },
  });
}

// GET handler to fetch and return the image associated with the given hypercert ID
export async function GET(
  request: NextRequest,
  { params }: { params: { hypercertId: string } }
) {
  const { hypercertId } = params;

  // Validate hypercert ID
  if (!hypercertId || Array.isArray(hypercertId)) {
    return new Response("Invalid ID", { status: 400 });
  }

  try {
    const res = await graphQlrequest(HYPERCERTS_API_URL, IMAGE_QUERY, {
      hypercert_id: hypercertId,
    });
    const imageOrUrl = res.hypercerts.data?.[0]?.metadata?.image;

    // Use placeholder image if no image URL or data is found
    if (!imageOrUrl) {
      return placeholderImageResponse(request);
    }

    // Get image data or use placeholder image if data is invalid
    try {
      const { contentType, buffer } = await getImageData(imageOrUrl);
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "s-maxage=864000", // 10 days cache
        },
      });
    } catch (error) {
      console.error(`Error parsing image data: ${error}`);
      return placeholderImageResponse(request);
    }
  } catch (error) {
    console.error(`Error fetching image metadata: ${error}`);
    return new NextResponse("Error processing request", { status: 500 });
  }
}

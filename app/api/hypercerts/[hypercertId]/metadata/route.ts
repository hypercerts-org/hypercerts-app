import { getHypercertMetadata } from "@/hypercerts/actions/getHypercertMetadata";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { hypercertId: string } },
) {
  try {
    const data = await getHypercertMetadata(params.hypercertId);

    if (!data) {
      return NextResponse.json(
        { error: "Metadata not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching hypercert metadata:", error);
    return NextResponse.json(
      { error: "Failed to fetch metadata" },
      { status: 500 },
    );
  }
}

import { getHypercertsByOwner } from "@/hypercerts/getHypercertsByOwner";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { address: string } },
) {
  const data = await getHypercertsByOwner({ ownerAddress: params.address });
  return NextResponse.json(data);
}

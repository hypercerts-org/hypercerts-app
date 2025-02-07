import { getHypercertsByCreator } from "@/hypercerts/getHypercertsByCreator";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { address: string } },
) {
  const data = await getHypercertsByCreator({ creatorAddress: params.address });
  return NextResponse.json(data);
}

import { NextRequest } from "next/server";
import { getTrustedAttestor } from "../../../../github/getTrustedAttestor";

export async function GET(
  request: NextRequest,
  { params }: { params: { evaluatorId: string } }
) {
  const { evaluatorId } = params;

  if (!evaluatorId) {
    return new Response("Invalid ID", { status: 400 });
  }

  try {
    const res = await getTrustedAttestor({ address: evaluatorId });
    return new Response(JSON.stringify(res));
  } catch (error) {
    console.error(`Error fetching attestor: ${error}`);
    return new Response("Error processing request", { status: 500 });
  }
}

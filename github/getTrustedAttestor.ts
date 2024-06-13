import { TrustedAttestor } from "./types/trusted-attestor.type";
import { getTrustedAttestors } from "./getTrustedAttestors";

export async function getTrustedAttestor({
  address,
}: {
  address: string | undefined;
}): Promise<TrustedAttestor | undefined> {
  const trustedAttestors = await getTrustedAttestors();
  if (!address) return;
  return trustedAttestors.find((attestor) => attestor.eth_address === address);
}

import { TrustedAttestor } from "./types/trusted-attestor.type";

export async function getTrustedAttestors(): Promise<TrustedAttestor[]> {
  const res = await fetch(
    "https://github.com/hypercerts-org/hypercerts-attestor-registry/raw/main/attestor.json",
  );
  return res.json();
}

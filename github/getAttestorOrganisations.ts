import { AttestorOrganisation } from "./types/attestor-organisation.type";

export async function getAttestorOrganisations(): Promise<
  AttestorOrganisation[]
> {
  const res = await fetch(
    "https://github.com/hypercerts-org/hypercerts-attestor-registry/raw/main/org.json",
  );
  return res.json();
}

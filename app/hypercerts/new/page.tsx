import {
  HypercertFormValues,
  HypercertMintingForm,
} from "@/components/hypercert/hypercert-minting-form";
import { getBlueprintById } from "@/blueprints/getBlueprints";
import { InfoSection } from "@/components/global/sections";

export default async function NewHypercertPage({
  searchParams,
}: {
  searchParams: { blueprintId?: string };
}) {
  let formValues: HypercertFormValues | undefined;
  let parsedId: number | undefined;
  let blueprintChainId: number | undefined;
  let blueprintMinterAddress: `0x${string}` | undefined;
  if (searchParams.blueprintId) {
    parsedId = parseInt(searchParams.blueprintId);
    const fetchedBlueprint = await getBlueprintById(parsedId);

    if (!fetchedBlueprint) {
      return (
        <main className="flex flex-col p-8 md:px-16 pt-8 pb-24 space-y-4 flex-1 container max-w-screen-lg">
          <InfoSection>
            The blueprint you are trying to use does not exist.
          </InfoSection>
        </main>
      );
    }

    formValues = {
      ...fetchedBlueprint.form_values,
      allowlistEntries: fetchedBlueprint.form_values.allowlistEntries?.map(
        (entry) => ({
          ...entry,
          units: BigInt(entry.units),
        }),
      ),
      projectDates: {
        from: new Date(fetchedBlueprint.form_values.projectDates.from),
        to: new Date(fetchedBlueprint.form_values.projectDates.to),
      },
    } as HypercertFormValues;
    blueprintChainId = fetchedBlueprint.admins[0].chain_id
      ? parseInt(fetchedBlueprint.admins[0].chain_id)
      : undefined;
    blueprintMinterAddress = fetchedBlueprint.minter_address as `0x${string}`;
  }
  return (
    <main className="flex flex-col p-8 md:px-16 pt-8 pb-24 space-y-4 flex-1 container max-w-screen-lg">
      <h1 className="font-serif text-3xl lg:text-5xl tracking-tight w-full">
        New hypercert
      </h1>
      <div className="p-3"></div>
      <HypercertMintingForm
        presetValues={formValues}
        blueprintId={parsedId}
        blueprintChainId={blueprintChainId}
        blueprintMinterAddress={blueprintMinterAddress}
      />
    </main>
  );
}

import {
  HypercertFormValues,
  HypercertMintingForm,
} from "@/components/hypercert/hypercert-minting-form";
import { getBlueprintById } from "@/blueprints/getBlueprints";
import { TransferRestrictions } from "@hypercerts-org/sdk";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default async function NewHypercertPage(props: {
  searchParams: Promise<{ blueprintId?: string }>;
}) {
  const searchParams = await props.searchParams;
  let formValues: HypercertFormValues | undefined;
  let parsedId: number | undefined;
  if (searchParams.blueprintId) {
    parsedId = parseInt(searchParams.blueprintId);
    const fetchedBlueprint = await getBlueprintById(parsedId);

    if (!fetchedBlueprint) {
      return <div>Blueprint not found</div>;
    }

    formValues = fetchedBlueprint.form_values as HypercertFormValues;
  }
  return (
    <main className="flex flex-col p-8 md:px-16 pt-8 pb-24 space-y-4 flex-1 container max-w-screen-lg">
      <h1 className="font-serif text-3xl lg:text-5xl tracking-tight w-full">
        New transferable hypercert
      </h1>
      <div className="p-3"></div>
      <Alert className="bg-orange-300 border-orange-400 text-white">
        <AlertTitle>Note</AlertTitle>
        <AlertDescription>
          You are creating a transferable hypercert. This means that ownership
          can be transferred freely, including through secondary transfers.
        </AlertDescription>
      </Alert>
      <HypercertMintingForm
        presetValues={formValues}
        blueprintId={parsedId}
        transferRestrictions={TransferRestrictions.AllowAll}
      />
    </main>
  );
}

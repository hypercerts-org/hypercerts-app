import { CreateFractionalOrderForm } from "@/components/marketplace/create-fractional-sale-form";

export const ListForSaleForm = ({ hypercertId }: { hypercertId: string }) => {
  return (
    <form>
      <CreateFractionalOrderForm hypercertId={hypercertId} />
    </form>
  );
};

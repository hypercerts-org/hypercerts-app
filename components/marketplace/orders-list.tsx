import { getOpenOrders } from "@/marketplace/getOpenOrders";
import { Suspense } from "react";
import { OrdersListRow } from "@/components/marketplace/orders-list-row";

async function OrdersListInner({ hypercertId }: { hypercertId: string }) {
  const openOrders = await getOpenOrders(hypercertId);
  if (!openOrders?.length) {
    return <div>No orders found</div>;
  }
  return (
    <div className="flex flex-col gap-2">
      {openOrders.map((order) => (
        <OrdersListRow order={order} key={order.id} />
      ))}
    </div>
  );
}

export default function OrdersList({ hypercertId }: { hypercertId: string }) {
  return (
    <Suspense>
      <OrdersListInner hypercertId={hypercertId} />
    </Suspense>
  );
}

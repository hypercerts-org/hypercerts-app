import "server-only";

import { ApiClient } from "@hypercerts-org/marketplace-sdk";

export async function getOpenOrders(hypercertId: string) {
  const apiClient = new ApiClient();
  const { data: orders } = await apiClient.fetchOrdersByHypercertId({
    hypercertId,
  });

  return orders;
}

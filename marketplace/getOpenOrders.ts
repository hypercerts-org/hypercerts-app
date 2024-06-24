import "server-only";

import { ApiClient } from "@hypercerts-org/marketplace-sdk";
import { apiEnvironment } from "@/lib/constants";

export async function getOpenOrders(hypercertId: string) {
  const apiClient = new ApiClient(apiEnvironment);
  const { data: orders } = await apiClient.fetchOrdersByHypercertId({
    hypercertId,
  });

  return orders;
}

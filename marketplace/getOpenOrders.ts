import "server-only";

import { graphql, readFragment } from "@/lib/graphql";
import { OrderFragment } from "@/marketplace/fragments/order.fragment";
import { HYPERCERTS_API_URL } from "@/configs/hypercerts";
import request from "graphql-request";

const ordersQuery = graphql(
  `
    query OrdersQuery($chainId: BigInt, $signer: String) {
      orders(where: { chainId: { eq: $chainId }, signer: { eq: $signer } }) {
        count
        data {
          ...OrderFragment
        }
      }
    }
  `,
  [OrderFragment],
);

interface GetOrdersParams {
  filter: {
    chainId?: bigint;
    signer?: `0x${string}`;
  };
}

export async function getOrders({ filter }: GetOrdersParams) {
  const res = await request(HYPERCERTS_API_URL, ordersQuery, {
    chainId: filter.chainId?.toString(),
    signer: filter.signer,
  });

  // TODO: Throw error?
  if (!res.orders?.data) {
    return undefined;
  }

  const processedFragments = res.orders.data.map((order) => {
    return readFragment(OrderFragment, order);
  });

  return {
    count: res.orders.count,
    data: processedFragments,
  };
}

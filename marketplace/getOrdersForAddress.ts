import "server-only";

import { graphql, readFragment } from "@/lib/graphql";
import { OrderFragment } from "@/marketplace/fragments/order.fragment";
import { HYPERCERTS_API_URL } from "@/configs/hypercerts";
import request from "graphql-request";

const query = graphql(
  `
    query GetOrdersForAddress($address: String!) {
      orders(where: { signer: { eq: $address } }) {
        data {
          ...OrderFragment
        }
      }
    }
  `,
  [OrderFragment],
);

export async function getOrdersForAddress(address: string) {
  const res = await request(HYPERCERTS_API_URL, query, {
    address,
  });

  if (!res.orders?.data) {
    return undefined;
  }

  const processedFragments = res.orders.data.map((order) => {
    return readFragment(OrderFragment, order);
  });

  return {
    count: res.orders.data.length,
    data: processedFragments,
  };
}

import { ApiClient } from "@hypercerts-org/marketplace-sdk";

export async function getAvailableOrders(tokenIds: string[]) {
  const apiClient = new ApiClient();
  const { data: orders } = await apiClient.fetchOrders({
    claimTokenIds: tokenIds,
  });

  return orders;
}
//
// export const useFetchMarketplaceOrdersForHypercert = (hypercertId: string) => {
//   const chainId = useChainId();
//   const provider = usePublicClient();
//
//   return useQuery({
//     queryKey: ["available-orders", hypercertId],
//     queryFn: async () => {
//       const hypercert = await getHypercert(hypercertId);
//       const fractions = hypercert?.fractions?.data;
//       if (!fractions) {
//         throw new Error("No fractions");
//       }
//
//       const totalUnitsForAllFractions = fractions.reduce(
//         (acc, cur) => acc + BigInt(cur.units as bigint),
//         BigInt(0),
//       );
//
//       const fractionsWithPercentages = fractions.map((fraction) => ({
//         ...fraction,
//         percentage: Number(
//           (BigInt(fraction.units as bigint) * BigInt(100)) /
//             totalUnitsForAllFractions,
//         ),
//       }));
//
//       if (!chainId) {
//         throw new Error("No chainId");
//       }
//
//       const hypercertExchangeClient = new HypercertExchangeClient(
//         chainId,
//         // TODO: Fix typing issue with provider
//         provider as unknown as any,
//         undefined,
//         {
//           apiEndpoint: HYPERCERTS_API_URL,
//         },
//       );
//
//       const { data: orders } =
//         await hypercertExchangeClient.api.fetchOrdersByHypercertId({
//           hypercertId,
//           chainId,
//         });
//
//       console.log(orders);
//
//       if (!orders) {
//         throw new Error("No orders");
//       }
//
//       const allFractionIdsForSale = orders.map((order) => order.itemIds).flat();
//       const allFractionsForSale = fractionsWithPercentages.filter((fraction) =>
//         allFractionIdsForSale.includes(fraction.token_id),
//       );
//
//       const totalUnitsForSale = allFractionsForSale.reduce(
//         (acc, fraction) => acc + BigInt(fraction.units as bigint),
//         BigInt(0),
//       );
//
//       const totalPercentageForSale = allFractionsForSale.reduce(
//         (acc, fraction) => acc + fraction.percentage,
//         0,
//       );
//
//       const ordersByFractionId = _.keyBy(
//         orders,
//         (order: any) => order.itemIds?.[0],
//       );
//       const ordersWithAveragePrice = _.mapValues(
//         ordersByFractionId,
//         (order: any) => {
//           const fractionId = order.itemIds[0];
//           const fraction = allFractionsForSale.find(
//             (fraction) => fraction.token_id === fractionId,
//           );
//           const priceInEther = formatEther(BigInt(order.price));
//           const units = fraction?.units || 1;
//           const averagePrice = Number(priceInEther) / (units as number);
//           const pricePerPercent =
//             (BigInt(order.price) * BigInt(10 ** 4)) /
//             BigInt(fraction?.percentage || 1) /
//             BigInt(10 ** 4);
//           return { order, averagePrice, fraction, pricePerPercent };
//         },
//       );
//       const cheapestFraction = _.minBy(
//         _.values(ordersWithAveragePrice),
//         (order) => order.averagePrice,
//       );
//
//       return {
//         orders: ordersWithAveragePrice,
//         totalUnitsForSale: totalUnitsForSale,
//         totalPercentageForSale,
//         priceOfCheapestFraction: cheapestFraction?.averagePrice,
//       };
//     },
//   });
// };

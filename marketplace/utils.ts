import { currenciesByNetwork, Currency } from "@hypercerts-org/marketplace-sdk";
import {
  decodeAbiParameters,
  formatEther,
  parseAbiParameters,
  parseEther,
} from "viem";
import { OrderFragment } from "@/marketplace/fragments/order.fragment";
import { MarketplaceOrder } from "@/marketplace/types";
import { HypercertFull } from "@/hypercerts/fragments/hypercert-full.fragment";

export const getCurrencyByAddress = (address: string) => {
  const allCurrencies = Object.values(currenciesByNetwork).flatMap(
    (currencies) => Object.values(currencies),
  ) as Currency[];

  return allCurrencies.find((currency) => currency.address === address);
};

export const decodeFractionalOrderParams = (params: string) => {
  const [minUnitAmount, maxUnitAmount, minUnitsToKeep, sellLeftoverFraction] =
    decodeAbiParameters(
      parseAbiParameters(
        "uint256 minUnitAmount, uint256 maxUnitAmount, uint256 minUnitsToKeep, uint256 sellLeftoverFraction",
      ),
      params as `0x{string}`,
    );

  return {
    minUnitAmount,
    maxUnitAmount,
    minUnitsToKeep,
    sellLeftoverFraction: !!sellLeftoverFraction,
  };
};

export const getPricePerUnit = (
  pricePerPercent: string,
  totalUnits: bigint,
) => {
  const unitsPerPercent = totalUnits / BigInt(100);
  const pricePerPercentWei = parseEther(pricePerPercent);
  return formatEther(pricePerPercentWei / unitsPerPercent);
};

export const getPricePerPercent = (price: string, totalUnits: bigint) => {
  const unitsPerPercent = totalUnits / BigInt(100);
  return formatEther(BigInt(price) * unitsPerPercent);
};

export const orderFragmentToMarketplaceOrder = (
  order: OrderFragment,
): MarketplaceOrder => {
  if (!order.chainId) {
    throw new Error("Order does not have a chain ID");
  }
  return {
    signer: order.signer,
    price: order.price,
    itemIds: order.itemIds,
    strategyId: order.strategyId,
    chainId: parseInt(order.chainId, 10),
    additionalParameters: order.additionalParameters,
    invalidated: order.invalidated,
    currency: order.currency,
    amounts: order.amounts,
    id: order.id,
    collectionType: order.collectionType,
    collection: order.collection,
    createdAt: order.createdAt,
    endTime: order.endTime,
    orderNonce: order.orderNonce,
    subsetNonce: order.subsetNonce,
    startTime: order.startTime,
    globalNonce: order.globalNonce,
    quoteType: order.quoteType,
    signature: order.signature,
    validator_codes:
      order.validator_codes?.map((code) => parseInt(code, 10)) || null,
  };
};

export const orderFragmentToHypercert = (
  order: OrderFragment,
): HypercertFull => {
  return order.hypercert as unknown as HypercertFull;
};

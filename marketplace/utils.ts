import {
  ChainId,
  currenciesByNetwork,
  Currency,
} from "@hypercerts-org/marketplace-sdk";
import {
  decodeAbiParameters,
  formatUnits,
  getAddress,
  parseAbiParameters,
  parseEther,
} from "viem";
import { OrderFragment } from "@/marketplace/fragments/order.fragment";
import { MarketplaceOrder } from "@/marketplace/types";
import { HypercertFull } from "@/hypercerts/fragments/hypercert-full.fragment";

export const getCurrencyByAddress = (chain: ChainId, address: string) => {
  const currenciesForNetwork = currenciesByNetwork[chain];
  const allCurrencies = Object.values(currenciesForNetwork) as Currency[];

  return allCurrencies.find(
    (currency) => getAddress(currency.address) === getAddress(address),
  );
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
  return pricePerPercentWei / unitsPerPercent;
};

export const getPricePerPercent = (price: string, totalUnits: bigint) => {
  const unitsPerPercent = totalUnits / BigInt(100);
  return BigInt(price) * unitsPerPercent;
};

export const formatPrice = (
  chainId: number | string | null | undefined,
  units: bigint,
  currency: string,
  includeSymbol = false,
) => {
  if (!chainId) {
    return "Unknown chain";
  }

  const parsedChainId =
    typeof chainId === "number" ? chainId : parseInt(chainId, 10);

  const currencyData = getCurrencyByAddress(parsedChainId, currency);

  if (!currencyData) {
    return "Unknown currency";
  }

  const formattedUnits = formatUnits(units, currencyData.decimals);

  if (includeSymbol) {
    return `${formattedUnits} ${currencyData.symbol}`;
  }

  return formattedUnits;
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

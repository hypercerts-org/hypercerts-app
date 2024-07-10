import { currenciesByNetwork, Currency } from "@hypercerts-org/marketplace-sdk";
import {
  decodeAbiParameters,
  formatEther,
  parseAbiParameters,
  parseEther,
} from "viem";

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

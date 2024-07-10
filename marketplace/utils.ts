import { currenciesByNetwork, Currency } from "@hypercerts-org/marketplace-sdk";
import { decodeAbiParameters, parseAbiParameters } from "viem";

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

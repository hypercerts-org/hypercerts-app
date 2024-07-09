import { currenciesByNetwork, Currency } from "@hypercerts-org/marketplace-sdk";

export const getCurrencyByAddress = (address: string) => {
  const allCurrencies = Object.values(currenciesByNetwork).flatMap(
    (currencies) => Object.values(currencies),
  ) as Currency[];

  return allCurrencies.find((currency) => currency.address === address);
};

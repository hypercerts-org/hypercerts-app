import { describe, it, expect } from "vitest";

import { getPricePerPercent, getPricePerUnit } from "@/marketplace/utils";
import { currenciesByNetwork } from "@hypercerts-org/marketplace-sdk";
import { sepolia } from "viem/chains";

describe("utils", () => {
  describe("getPricePerUnit", () => {
    it("should return the price per unit", () => {
      expect(getPricePerUnit("1", BigInt(100))).to.eq(BigInt(1));
      expect(getPricePerUnit("100", BigInt(100))).to.eq(BigInt(100));
      expect(getPricePerUnit("100", BigInt(200))).to.eq(BigInt(50));

      // TODO: What do we do when there are less than 100 units in a cert?
    });
  });

  describe("getPricePerPercent", () => {
    it("should return the price per percent", () => {
      expect(getPricePerPercent("1", BigInt(100))).to.eq(BigInt(1));
      expect(getPricePerPercent("100", BigInt(100))).to.eq(BigInt(100));

      // TODO: What do we do when there are less than 100 units in a cert?
    });
  });

  describe("getMinimumPrice", () => {
    it("should return the minimum price", () => {
      const chainId = sepolia.id;
      const usdc = Object.values(currenciesByNetwork[chainId]).find(
        (c) => c.symbol === "USDC",
      );

      // const usdc2 = getCurrencyByAddress(
      //   11155111,
      //   getAddress("0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"),
      // );
      // expect(getMinimumPrice("1", chainId, usdc.address)).to.eq(1n);
    });
  });
});

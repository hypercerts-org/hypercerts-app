import { describe, it, expect } from "vitest";
import { formatPercentageToFirstNonZeroDigit } from "@/lib/formatPercentage";

describe("formatPercentage", () => {
  it("should return the original integer if its more than 1", () => {
    expect(formatPercentageToFirstNonZeroDigit(97)).to.eq("97");
  });

  it("should round to 1 decimal place if the integer is more than 1", () => {
    expect(formatPercentageToFirstNonZeroDigit(97.5)).to.eq("97.5");
    expect(formatPercentageToFirstNonZeroDigit(97.001)).to.eq("97");
    expect(formatPercentageToFirstNonZeroDigit(97.01)).to.eq("97");
    expect(formatPercentageToFirstNonZeroDigit(1.008)).to.eq("1");
    expect(formatPercentageToFirstNonZeroDigit(1.99)).to.eq("2");
    expect(formatPercentageToFirstNonZeroDigit(97.0000000000081)).to.eq("97");
    expect(formatPercentageToFirstNonZeroDigit(97.0000000000081)).to.eq("97");
  });

  it("should round to the first non-zero digit", () => {
    expect(formatPercentageToFirstNonZeroDigit(0.008)).to.eq("0.008");
    expect(formatPercentageToFirstNonZeroDigit(0.0081)).to.eq("0.008");
    expect(formatPercentageToFirstNonZeroDigit(0.000000000008)).to.eq(
      "0.000000000008",
    );
  });

  it("should take the second non-zero digit to round the first non-zero digit", () => {
    expect(formatPercentageToFirstNonZeroDigit(0.99)).to.eq("1");
    expect(formatPercentageToFirstNonZeroDigit(0.109)).to.eq("0.11");
    expect(formatPercentageToFirstNonZeroDigit(0.0000000000081)).to.eq(
      "0.000000000008",
    );
    expect(formatPercentageToFirstNonZeroDigit(0.0000000000085)).to.eq(
      "0.000000000009",
    );
  });
});

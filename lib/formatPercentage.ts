export const formatPercentageToFirstNonZeroDigit = (
  percentage: number,
): string => {
  if (percentage === 0) return "0";

  if (percentage < 1) {
    const NumberFormat = new Intl.NumberFormat("en-US", {
      style: "decimal",
      notation: "standard",
      maximumSignificantDigits: 21,
    });

    const result = NumberFormat.format(percentage);

    // Match the first 2 non-zero digits after the decimal point
    const match = result.match(/\d*\.\d*?[1-9](?:\d*[1-9]|\d)?/);

    // If no decimal or no non-zero digits after decimal, return rounded integer
    if (!match) {
      return Math.round(percentage).toString();
    }

    // Check if we found 1 or 2 non-zero digits after the decimal point
    // Skip leading zeros after decimal points
    const numbersAfterDecimal = match[0].split(".")[1];
    const isSingleNonZeroDigit =
      numbersAfterDecimal.replace(/^0+/, "").length === 1;

    // If we have 1 significant digit, return the match
    if (isSingleNonZeroDigit) {
      return match[0];
    }

    // If we have 2 significant digits, get the number of digits after the decimal point
    const fractionDigits = numbersAfterDecimal.length;
    return new Intl.NumberFormat("en-US", {
      style: "decimal",
      notation: "standard",
      // maximumSignificantDigits: decimalDigits - 1,
      maximumFractionDigits: fractionDigits - 1,
    }).format(percentage);
  }

  // Round to 1 digit, strip trailing zeros
  return percentage.toFixed(1).replace(/\.?0+$/, "");
};

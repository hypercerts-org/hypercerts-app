import { describe, it, expect } from "vitest";
import { parseAllowList } from "@/components/hypercert/hypercert-minting-form/form-steps";
import { zeroAddress } from "viem";
import { DEFAULT_NUM_UNITS } from "@/configs/hypercerts";
import fs from "fs";
import path from "path";

describe("parseAllowList", () => {
  it("should read allowlist.csv file and return the parsed data", async () => {
    const defaultAllowList = path.resolve(
      __dirname,
      "../../public/allowlist.csv",
    );
    const allowlistCsvContent = fs.readFileSync(defaultAllowList, "utf-8");
    const parsedData = await parseAllowList(allowlistCsvContent);

    // expect units as scaled values
    expect(parsedData[0].address).toBe(zeroAddress);
    expect(parsedData[0].units).toBe(BigInt(50000000));
    expect(parsedData[1].address).toBe(zeroAddress);
    expect(parsedData[1].units).toBe(BigInt(50000000));
    const totalUnits = parsedData[0].units + parsedData[1].units;
    expect(totalUnits).toBe(DEFAULT_NUM_UNITS);
  });

  // Test for CSV with comma delimiter
  it("should correctly parse CSV with comma delimiter", async () => {
    const csvContent = `address,units
0x1111111111111111111111111111111111111111,30
0x2222222222222222222222222222222222222222,70`;

    const parsedData = await parseAllowList(csvContent);

    expect(parsedData.length).toBe(2);
    expect(parsedData[0].address).toBe(
      "0x1111111111111111111111111111111111111111",
    );
    expect(parsedData[1].address).toBe(
      "0x2222222222222222222222222222222222222222",
    );

    // Check scaling (30:70 ratio)
    const totalUnits = parsedData[0].units + parsedData[1].units;
    expect(totalUnits).toBe(DEFAULT_NUM_UNITS);
  });

  // Test for CSV with semicolon delimiter
  it("should correctly parse CSV with semicolon delimiter", async () => {
    const csvContent = `address;units
0x3333333333333333333333333333333333333333;25
0x4444444444444444444444444444444444444444;75`;

    const parsedData = await parseAllowList(csvContent);

    expect(parsedData.length).toBe(2);
    expect(parsedData[0].address).toBe(
      "0x3333333333333333333333333333333333333333",
    );
    expect(parsedData[1].address).toBe(
      "0x4444444444444444444444444444444444444444",
    );

    // Check scaling (25:75 ratio)
    const totalUnits = parsedData[0].units + parsedData[1].units;
    expect(totalUnits).toBe(DEFAULT_NUM_UNITS);
  });

  // Test for CSV with mixed values that don't scale evenly
  it("should handle rounding errors correctly when scaling units", async () => {
    const csvContent = `address,units
0x5555555555555555555555555555555555555555,3333
0x6666666666666666666666666666666666666666,3333
0x7777777777777777777777777777777777777777,3334`;

    const parsedData = await parseAllowList(csvContent);

    expect(parsedData.length).toBe(3);

    // Total should be exactly DEFAULT_NUM_UNITS
    const totalUnits = parsedData.reduce(
      (sum, entry) => sum + entry.units,
      BigInt(0),
    );
    expect(totalUnits).toBe(DEFAULT_NUM_UNITS);
  });

  // Test for edge case where rounding would result in 99.999999% allocation
  it("should correct rounding errors to ensure exactly 100% allocation", async () => {
    const csvContent = `address,units
0x8888888888888888888888888888888888888888,33330
0x9999999999999999999999999999999999999999,33330
0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA,33340`;

    const parsedData = await parseAllowList(csvContent);

    expect(parsedData.length).toBe(3);

    // Sum of units should be EXACTLY DEFAULT_NUM_UNITS (not 99.99999%)
    const totalUnits = parsedData.reduce(
      (sum, entry) => sum + entry.units,
      BigInt(0),
    );
    expect(totalUnits).toBe(DEFAULT_NUM_UNITS);
  });

  it("should throw error for an invalid Ethereum addresses", async () => {
    const csvContent = `address,units
		0x123Invalid,50`;
    await expect(parseAllowList(csvContent)).rejects.toThrowError();
  });

  it("should return valid Ethereum Address with viem", async () => {
    const csvContent = `address,units
0x627d54b88b519a2915b6a5a76fa9530fd085ce26,100`;

    const parsedData = await parseAllowList(csvContent);

    expect(parsedData[0].address).toBe(
      "0x627D54B88b519A2915B6A5A76fA9530FD085cE26",
    );
  });

  it("should ignore empty lines in the CSV", async () => {
    const csvContent = `address,units
0x,
0x,
0x1234567890123456789012345678901234567890,50
0x1234567890123456789012345678901234567890,50`;

    const parsedData = await parseAllowList(csvContent);

    expect(parsedData.length).toBe(2);
    expect(parsedData[0].address).toBe(
      "0x1234567890123456789012345678901234567890",
    );
    expect(parsedData[1].address).toBe(
      "0x1234567890123456789012345678901234567890",
    );
  });
});

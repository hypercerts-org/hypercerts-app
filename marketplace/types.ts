import { Database } from "@/types/hypercerts-data-database";

export type MarketplaceOrder =
  Database["public"]["Tables"]["marketplace_orders"]["Row"];

export interface CreateFractionalOfferFormValues {
  fractionId: string;
  minUnitAmount: string;
  maxUnitAmount: string;
  minUnitsToKeep: string;
  price: string;
  sellLeftoverFraction: boolean;
  currency?: string;
}

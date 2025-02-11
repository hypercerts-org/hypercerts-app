import { flag, dedupe } from "@vercel/flags/next";
import type { ReadonlyRequestCookies } from "@vercel/flags";

interface Entities {
  user?: { chainId: number | undefined };
}

const creatorFeedDisabledChains = [314, 314159];
const evaluationsDisabledChains = [314, 314159];
const marketplaceListingsDisabledChains = [314, 314159];

const identify = dedupe(
  ({ cookies }: { cookies: ReadonlyRequestCookies }): Entities => {
    const wagmiStore = cookies.get("wagmi.store")?.value;

    const chainId = getChainIdFromWagmiCookie(wagmiStore);

    return { user: { chainId } };
  },
);

const getChainIdFromWagmiCookie = (
  cookieValue: string | undefined,
): number | undefined => {
  if (!cookieValue) {
    console.debug("No wagmiStore cookie found");
    return undefined;
  }

  try {
    const parsedCookie = JSON.parse(cookieValue);
    const chainId = parsedCookie?.state?.chainId;

    if (typeof chainId !== "number") {
      console.debug("Invalid chainId format in wagmiStore cookie");
      return undefined;
    }

    return chainId;
  } catch (error) {
    console.error("Error parsing wagmiStore cookie:", error);
    return undefined;
  }
};

export const creatorFeedFlag = flag<boolean>({
  key: "chain-actions-creator-feed",
  identify,
  defaultValue: true,
  decide({ entities }) {
    return !creatorFeedDisabledChains.includes(entities?.user?.chainId);
  },
});

export const evaluationsFlag = flag<boolean>({
  key: "chain-actions-evaluations",
  identify,
  defaultValue: true,
  decide({ entities }) {
    return !evaluationsDisabledChains.includes(entities?.user?.chainId);
  },
});

export const marketplaceListingsFlag = flag<boolean>({
  key: "chain-actions-marketplace-listings",
  identify,
  defaultValue: true,
  decide({ entities }) {
    return !marketplaceListingsDisabledChains.includes(entities?.user?.chainId);
  },
});

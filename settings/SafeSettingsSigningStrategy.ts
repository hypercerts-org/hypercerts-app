import { TypedDataEncoder } from "ethers";
import SafeApiKit from "@safe-global/api-kit";
import { type EIP712TypedData } from "@safe-global/types-kit";
import Safe, {
  buildSignatureBytes,
  Eip1193Provider,
} from "@safe-global/protocol-kit";

import { SettingsFormValues } from "@/components/settings/settings-form";
import { HYPERCERTS_API_URL_REST } from "@/configs/hypercerts";
import {
  hypercertApiSigningDomainSafe,
  type SafeApiSigningDomain,
} from "@/configs/constants";

import { SettingsSigningStrategy } from "./SettingsSigningStrategy";

export class SafeSettingsSigningStrategy extends SettingsSigningStrategy {
  constructor(
    address: string,
    chainId: number,
    private walletClient: Eip1193Provider,
  ) {
    super(address, chainId);
  }

  async sign(user: SettingsFormValues): Promise<void> {
    const message = {
      metadata: { timestamp: Math.floor(new Date().getTime() / 1000) },
      user: {
        displayName: user.displayName || "",
        avatar: user.avatar || "",
      },
    };

    try {
      const { messageHash } = await this.initiateSigning({
        types: {
          Metadata: [{ name: "timestamp", type: "uint256" }],
          User: [
            { name: "displayName", type: "string" },
            { name: "avatar", type: "string" },
          ],
          UserUpdateRequest: [
            { name: "metadata", type: "Metadata" },
            { name: "user", type: "User" },
          ],
        },
        primaryType: "UserUpdateRequest",
        message,
      });

      await makeRequest(this.address, {
        type: "multisig",
        chain_id: this.chainId,
        messageHash,
      });
    } catch (error) {
      throw error instanceof Error ? error : new Error("Error updating user");
    }
  }

  async initiateSigning(
    config: Omit<EIP712TypedData, "domain">,
  ): Promise<{ messageHash: `0x${string}` }> {
    // if (!selectedAccount) throw new Error("No selected account found");
    // if (!safe) throw new Error("Safe SDK not initialized");
    // if (!apiKit) throw new Error("API Kit not initialized");
    if (!this.chainId) throw new Error("No chainId found");

    const safe = await Safe.init({
      provider: this.walletClient as unknown as Eip1193Provider,
      safeAddress: this.address,
    });
    const apiKit = new SafeApiKit({ chainId: BigInt(this.chainId) });

    const typedData = {
      domain: hypercertApiSigningDomainSafe(this.chainId, this.address),
      types: {
        ...DOMAIN_TYPE,
        ...config.types,
      },
      primaryType: config.primaryType,
      message: config.message,
    };

    const safeMessage = await safe.createMessage(typedData);
    const signature = await safe.signTypedData(safeMessage);

    try {
      await apiKit.addMessage(this.address, {
        message: typedData as any,
        signature: buildSignatureBytes([signature]),
      });
    } catch (error) {
      console.log("error", error);
    }
    const safeHash = await safe.getSafeMessageHash(
      messageHash(typedData.domain, config),
    );

    return {
      messageHash: safeHash as `0x${string}`,
    };
  }
}

async function makeRequest(address: string, body: Record<string, unknown>) {
  const response = await fetch(`${HYPERCERTS_API_URL_REST}/users/${address}`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Error updating user");
  }
  return response.json();
}

const DOMAIN_TYPE = {
  EIP712Domain: [
    { name: "name", type: "string" },
    { name: "version", type: "string" },
    { name: "chainId", type: "uint256" },
    { name: "verifyingContract", type: "address" },
  ],
};

function messageHash(
  domain: SafeApiSigningDomain,
  config: Omit<EIP712TypedData, "domain">,
) {
  return TypedDataEncoder.hash(
    domain,
    config.types,
    config.message,
  ) as `0x${string}`;
}

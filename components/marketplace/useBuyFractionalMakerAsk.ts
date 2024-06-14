import { useAccount, useChainId, useWalletClient } from "wagmi";
import { waitForTransactionReceipt } from "viem/actions";
import { HypercertExchangeClient } from "@hypercerts-org/marketplace-sdk";
import { useEthersProvider } from "@/hooks/useEthersProvider";
import { useEthersSigner } from "@/hooks/useEthersSigner";
import { parseEther } from "viem";
import { useMutation } from "@tanstack/react-query";
import { useStepProcessDialogContext } from "@/components/global/step-process-dialog";
import { useGetCurrentERC20Allowance } from "@/components/marketplace/useGetCurrentERC20Allowance";
import { MarketplaceOrder } from "@/types/alias";
import { decodeContractError } from "@/lib/decodeContractError";

export const useBuyFractionalMakerAsk = () => {
  const chainId = useChainId();
  const { setStep, setSteps, setOpen } = useStepProcessDialogContext();
  const { data: walletClientData } = useWalletClient();
  const provider = useEthersProvider();
  const signer = useEthersSigner();
  const { address } = useAccount();
  const getCurrentERC20Allowance = useGetCurrentERC20Allowance();

  return useMutation({
    mutationKey: ["buyFractionalMakerAsk"],
    mutationFn: async ({
      order,
      unitAmount,
      pricePerUnit,
    }: {
      order: MarketplaceOrder;
      unitAmount: string;
      pricePerUnit: string;
    }) => {
      if (!chainId) {
        setOpen(false);
        throw new Error("No chain id");
      }

      if (!walletClientData) {
        setOpen(false);
        throw new Error("No wallet client data");
      }

      setSteps([
        {
          id: "Setting up order execution",
          description: "Setting up order execution",
        },
        {
          id: "ERC20",
          description: "Setting approval",
        },
        {
          id: "Transfer manager",
          description: "Approving transfer manager",
        },
        {
          id: "Awaiting buy signature",
          description: "Awaiting buy signature",
        },
        {
          id: "Awaiting confirmation",
          description: "Awaiting confirmation",
        },
      ]);
      setOpen(true);

      const hypercertExchangeClient = new HypercertExchangeClient(
        chainId,
        // @ts-ignore
        provider,
        signer,
      );
      setStep("Setting up order execution");
      const takerOrder = hypercertExchangeClient.createFractionalSaleTakerBid(
        order,
        address,
        unitAmount,
        parseEther(pricePerUnit),
      );

      try {
        setStep("ERC20");
        const currentAllowance = await getCurrentERC20Allowance(
          order.currency as `0x${string}`,
        );
        if (currentAllowance < BigInt(order.price) * BigInt(unitAmount)) {
          const approveTx = await hypercertExchangeClient.approveErc20(
            order.currency,
            BigInt(order.price) * BigInt(unitAmount),
          );
          await waitForTransactionReceipt(walletClientData, {
            hash: approveTx.hash as `0x${string}`,
          });
        }

        setStep("Transfer manager");
        const isTransferManagerApproved =
          await hypercertExchangeClient.isTransferManagerApproved();
        if (!isTransferManagerApproved) {
          const transferManagerApprove = await hypercertExchangeClient
            .grantTransferManagerApproval()
            .call();
          await waitForTransactionReceipt(walletClientData, {
            hash: transferManagerApprove.hash as `0x${string}`,
          });
        }
      } catch (e) {
        console.error(e);
        setOpen(false);
        throw new Error("Approval error");
      }

      try {
        setStep("Setting up order execution");
        const { call } = hypercertExchangeClient.executeOrder(
          order,
          takerOrder,
          order.signature,
        );
        setStep("Awaiting buy signature");
        const tx = await call();
        setStep("Awaiting confirmation");
        await waitForTransactionReceipt(walletClientData, {
          hash: tx.hash as `0x${string}`,
        });
      } catch (e) {
        console.error(e);

        const defaultMessage = `Error during step \"${"TO BE IMPLEMENTED CURRENT STEP"}\"`;
        throw new Error(decodeContractError(e, defaultMessage));
      } finally {
        setOpen(false);
      }
    },
  });
};

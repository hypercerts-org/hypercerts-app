"use client";
import { Button } from "@/components/ui/button";
import { useHypercertClient } from "@/hooks/use-hypercert-client";
import { forwardRef, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ListForSaleForm } from "@/components/marketplace/list-for-sale-form";

type Props = {
  hypercertId: string;
  text?: string;
  onClickViewListings?: () => void;
  onClick?: () => void;
};

export function ListForSaleButton({
  hypercertId,
  text = "List for sale",
  onClickViewListings,
  onClick,
  ...props
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const onClickViewListingsWithModalClose = () => {
    setIsOpen(false);
    onClickViewListings?.();
  };

  const onClickButton = () => {
    onClick?.();
    setIsOpen(true);
  };

  const { client } = useHypercertClient();

  const disabled =
    !client || !client.isClaimOrFractionOnConnectedChain(hypercertId);

  const getToolTipMessage = () => {
    if (!client) {
      return "Please connect your wallet to list for sale";
    }

    if (!client.isClaimOrFractionOnConnectedChain(hypercertId)) {
      return "This hypercert is not on the connected chain";
    }

    return "";
  };

  return (
    <>
      <Button
        disabled={disabled}
        variant="outline"
        onClick={onClickButton}
        {...props}
      >
        {text}
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <ListForSaleForm hypercertId={hypercertId} />
        </DialogContent>
      </Dialog>
    </>
  );
}
ListForSaleButton.displayName = "ListForSaleButton";

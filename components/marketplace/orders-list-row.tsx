"use client";

import React, { useState } from "react";
import { BuyFractionalOrderForm } from "@/components/marketplace/buy-fractional-order-form";
import { MarketplaceOrder } from "@/marketplace/types";
import { StepProcessDialogProvider } from "@/components/global/step-process-dialog";

export const OrdersListRow = ({ order }: { order: MarketplaceOrder }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <div key={order.id} className="hover:bg-gray-200 cursor-pointer">
      <div
        className="flex items-center gap-2"
        onClick={() => setIsExpanded((val) => !val)}
      >
        <div className="flex-grow">
          <p className="text-sm text-gray-700 font-medium">{order.signer}</p>
        </div>
        <div className="flex-grow">
          <p className="text-sm text-gray-700 font-medium">{order.price}</p>
        </div>
      </div>
      {isExpanded && (
        <StepProcessDialogProvider>
          <BuyFractionalOrderForm order={order} />
        </StepProcessDialogProvider>
      )}
    </div>
  );
};

import { buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  type DialogStep,
  type StepData,
  type StepState,
} from "@/hooks/useProcessDialog";
import { cn } from "@/lib/utils";
import { Badge, BadgeCheck, Loader } from "lucide-react";
import { createElement, useState } from "react";

interface DialogProps {
  steps: DialogStep[];
  title: string;
  currentStep: StepData["id"];
  triggerLabel?: string;
  extraContent?: React.ReactNode;
}

const stepStateIcons: Record<StepState, React.ElementType> = {
  idle: Badge,
  active: Loader,
  completed: BadgeCheck,
};

const stateSpecificIconClasses: Record<StepState, string> = {
  idle: "text-slate-600",
  active: "text-slate-700 animate-spin bg-white rounded-full",
  completed: "text-slate-400",
};

const stateSpecificTextClasses: Record<StepState, string> = {
  idle: "text-slate-600 font-medium",
  active: "text-slate-700 animate-pulse font-semibold",
  completed: "text-slate-400 font-medium",
};

const StepProcessModal = ({
  steps,
  title,
  triggerLabel,
  extraContent,
  currentStep,
}: DialogProps) => {
  const lastStep = steps[steps.length - 1];
  const isLastStepCompleted = lastStep.state === "completed";
  const [open, setOpen] = useState(true);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {triggerLabel && (
        <DialogTrigger
          asChild
          className={buttonVariants({ variant: "secondary" })}
        >
          {triggerLabel}
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-serif text-3xl font-normal">
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col px-2 pt-3">
          {steps.map((step) => (
            <div
              key={step.description}
              className="flex items-center relative border-l-2 border-slate-300 pl-2 pb-6 last-of-type:pb-0"
            >
              <div
                className={cn(
                  "p-1 absolute -left-[14px] top-[2px] bg-slate-100 rounded-full",
                  stateSpecificIconClasses[step.state],
                  step === lastStep &&
                    isLastStepCompleted &&
                    "text-green-600 bg-green-100"
                )}
              >
                {createElement(stepStateIcons[step.state], {
                  size: 18,
                })}
              </div>
              <div className="flex flex-col pl-4 justify-center">
                <p
                  className={cn(
                    "text-lg",
                    stateSpecificTextClasses[step.state],
                    step === lastStep && isLastStepCompleted && "text-green-600"
                  )}
                >
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-col px-2 pt-3">{extraContent}</div>
      </DialogContent>
    </Dialog>
  );
};

export { StepProcessModal as default };

import { useCallback, useState } from "react";

export type StepState = "idle" | "active" | "completed";

export type StepData = {
  id: string;
  description: string;
};

export type DialogStep = {
  id: StepData["id"];
  description: StepData["description"];
  state: StepState;
};

const useProcessDialog = (steps: StepData[]) => {
  const createDialogSteps = () => {
    const dialogSteps: DialogStep[] = steps.map((step) => ({
      id: step.id,
      description: step.description,
      state: "idle",
    }));
    return dialogSteps;
  };

  const [dialogSteps, setDialogSteps] = useState<DialogStep[]>(
    createDialogSteps()
  );

  const setStep = useCallback(
    (step: DialogStep["id"]) => {
      const lastStep = dialogSteps[dialogSteps.length - 1];
      const updatedDialogSteps = dialogSteps.map((dialogStep) => {
        if (dialogStep.id === step) {
          return {
            ...dialogStep,
            state: dialogStep.id === lastStep.id ? "completed" : "active",
          };
        } else if (
          dialogSteps.indexOf(dialogStep) <
          dialogSteps.findIndex((ds) => ds.id === step)
        ) {
          return { ...dialogStep, state: "completed" };
        }
        return dialogStep;
      });
      setDialogSteps(updatedDialogSteps as DialogStep[]);
    },
    [dialogSteps]
  );

  return {
    dialogSteps,
    setStep,
  };
};

export default useProcessDialog;

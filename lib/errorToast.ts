import { toast } from "@/components/ui/use-toast";

export const errorToast = (message: string | undefined) => {
  toast({
    title: message,
    variant: "destructive",
    duration: 2000,
  });
};

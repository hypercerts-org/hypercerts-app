"use client";

import z from "zod";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import isURL from "validator/lib/isURL";
import { Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { useToast } from "@/components/ui/use-toast";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import revalidatePathServerAction from "@/app/actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAddOrUpdateUser, useGetUser } from "@/users/hooks";
import { useAccountDetails } from "@/hooks/useAccountDetails";
import { useAccountStore } from "@/lib/account-store";
import { useCancelSignatureRequest } from "@/safe/signature-requests/useCancelSignatureRequest";
import { errorHasMessage } from "@/lib/errorHasMessage";
import { errorHasReason } from "@/lib/errorHasReason";

import {
  parsePendingUserUpdate,
  type PendingUserUpdate,
} from "@/settings/pending-user-update-parser";
const formSchema = z.object({
  displayName: z.string().max(30, "Max. 30 characters").optional(),
  avatar: z.union([z.string().url("Invalid URL"), z.literal("")]).optional(),
});

export type SettingsFormValues = z.infer<typeof formSchema>;

const defaultValues = {
  displayName: "",
  avatar: "",
};

const ERROR_TOAST_DURATION = 5000;

export const SettingsForm = () => {
  const { selectedAccount } = useAccountStore();
  const {
    address,
    ensName,
    ensAvatar,
    isLoading: isLoadingDetails,
  } = useAccountDetails();
  const { data: userData, isFetching: isPendingGetUser } = useGetUser({
    address,
  });
  const [pendingUpdate, setPendingUpdate] = useState<PendingUserUpdate>();

  const { mutateAsync: addOrUpdateUser, isPending: isPendingUpdateUser } =
    useAddOrUpdateUser();

  const { toast } = useToast();

  const onSubmit = async (data: SettingsFormValues) => {
    try {
      await addOrUpdateUser(data);

      if (selectedAccount?.type === "safe") {
        setPendingUpdate({
          user: {
            displayName: data.displayName || "",
            avatar: data.avatar || "",
          },
          metadata: {
            timestamp: new Date().getTime(),
          },
        });
        revalidatePathServerAction("/settings");
      }
    } catch (error) {
      if (errorHasReason(error)) {
        toast({
          title: "Error",
          description: error.reason,
          variant: "destructive",
          duration: ERROR_TOAST_DURATION,
        });
      } else if (errorHasMessage(error)) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
          duration: ERROR_TOAST_DURATION,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update user settings",
          variant: "destructive",
          duration: ERROR_TOAST_DURATION,
        });
      }
      return;
    }
  };

  const cancelSignatureRequest = useCancelSignatureRequest();
  const isPending =
    isPendingGetUser ||
    isLoadingDetails ||
    isPendingUpdateUser ||
    cancelSignatureRequest.isPending;

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
    mode: "all",
    reValidateMode: "onChange",
  });

  const [displayName, avatar] = useWatch({
    control: form.control,
    name: ["displayName", "avatar"],
  });

  const [updatedUserName, setUpdatedUserName] = useState(false);
  const [updatedUserNameEns, setUpdatedUserNameEns] = useState(false);
  useEffect(() => {
    if (updatedUserName || isPending) return;

    if (userData?.user?.display_name) {
      console.log(
        "Setting display name from graphql",
        userData.user.display_name,
      );
      form.setValue("displayName", userData.user.display_name);
      setUpdatedUserName(true);
      return;
    }

    if (!updatedUserNameEns && ensName) {
      console.log("Setting display name from ENS", ensName);
      form.setValue("displayName", ensName);
      setUpdatedUserNameEns(true);
    }
  }, [
    displayName,
    ensName,
    form,
    userData,
    updatedUserName,
    updatedUserNameEns,
    isPending,
  ]);

  const [updatedAvatar, setUpdatedAvatar] = useState(false);
  const [updatedEnsAvatar, setUpdatedEnsAvatar] = useState(false);
  useEffect(() => {
    if (updatedAvatar || isPending) return;

    if (userData?.user?.avatar) {
      console.log("Setting avatar from graphql", userData?.user?.avatar);
      form.setValue("avatar", userData?.user?.avatar || "");
      setUpdatedAvatar(true);
      return;
    }

    if (!updatedEnsAvatar && ensAvatar) {
      console.log("Setting avatar from ENS", ensAvatar);
      form.setValue("avatar", ensAvatar);
      setUpdatedEnsAvatar(true);
    }
  }, [
    ensAvatar,
    avatar,
    form,
    userData,
    updatedAvatar,
    updatedEnsAvatar,
    isPending,
  ]);

  // Reset form state when account changes
  useEffect(() => {
    form.reset();
    setUpdatedUserName(false);
    setUpdatedAvatar(false);
  }, [selectedAccount, form]);

  useEffect(() => {
    const checkPendingUpdates = async () => {
      console.log("checking for pending updates");
      if (selectedAccount?.type !== "safe" || !selectedAccount?.address) {
        setPendingUpdate(undefined);
        return;
      }

      if (userData?.pendingSignatures.length === 0) {
        setPendingUpdate(undefined);
        return;
      }
      const pendingMessage = userData?.pendingSignatures[0]?.message;
      setPendingUpdate(
        pendingMessage ? parsePendingUserUpdate(pendingMessage) : undefined,
      );
    };

    checkPendingUpdates();
  }, [selectedAccount, userData]);

  const handleCancelUpdate = async () => {
    if (
      !selectedAccount?.address ||
      !userData?.pendingSignatures[0]?.message_hash
    )
      return;

    // Prevent any other operations while cancellation is in progress
    if (cancelSignatureRequest.isPending) return;

    try {
      await cancelSignatureRequest.mutateAsync({
        safeAddress: selectedAccount.address,
        messageHash: userData.pendingSignatures[0].message_hash,
      });
      setPendingUpdate(undefined);

      // Reset form with current values to make it editable again
      form.reset({
        displayName: form.getValues("displayName"),
        avatar: form.getValues("avatar"),
      });

      revalidatePathServerAction("/settings");
    } catch (error) {
      console.error("Failed to cancel signature request:", error);
    }
  };

  const submitDisabled =
    form.formState.isSubmitting ||
    !form.formState.isValid ||
    isPending ||
    !!pendingUpdate;

  const shouldShowAvatar =
    avatar &&
    isURL(avatar) &&
    !form.formState.isValidating &&
    !form.formState.errors.avatar;

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-y-4"
        >
          <FormField
            control={form.control}
            name="displayName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display name</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isPending || !!pendingUpdate} />
                </FormControl>
                <FormMessage />
                <FormDescription>Max. 30 characters</FormDescription>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="avatar"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isPending || !!pendingUpdate} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {shouldShowAvatar && (
            <>
              <FormLabel>Preview</FormLabel>
              <Image
                src={avatar}
                alt="Preview of the profile image"
                width={200}
                height={200}
                className="object-scale-down"
              />
            </>
          )}

          <Button disabled={submitDisabled}>
            {(form.formState.isSubmitting || isPendingUpdateUser) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save changes
          </Button>
        </form>
      </Form>

      {pendingUpdate && (
        <div className="mt-4 flex flex-col gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm dark:border-yellow-900 dark:bg-yellow-950">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">
              Pending Update
            </h3>
            <span className="rounded-full bg-purple-900 px-2 py-1 text-xs font-medium text-yellow-200">
              {formatDistanceToNow(new Date(pendingUpdate.metadata.timestamp), {
                addSuffix: true,
              })}
            </span>
          </div>

          <div className="space-y-3 py-2">
            <div className="flex flex-col">
              <span className="text-xs text-yellow-700 dark:text-yellow-300">
                Display Name
              </span>
              <span className="font-medium text-yellow-900 dark:text-yellow-100">
                {pendingUpdate.user.displayName}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-xs text-yellow-700 dark:text-yellow-300">
                Image URL
              </span>
              <span className="font-medium text-yellow-900 dark:text-yellow-100 break-all">
                {pendingUpdate.user.avatar}
              </span>
            </div>
          </div>

          <p className="text-yellow-800 dark:text-yellow-200">
            The changes will be applied once all required signatures are
            collected.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancelUpdate}
            className="mt-2 w-fit border-yellow-300 text-yellow-800 hover:bg-yellow-100 dark:border-yellow-800 dark:text-yellow-200 dark:hover:bg-yellow-900"
          >
            Cancel pending update
          </Button>
        </div>
      )}
    </div>
  );
};

"use client";

import z from "zod";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import isURL from "validator/lib/isURL";
import { Loader2 } from "lucide-react";

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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAddOrUpdateUser, useGetUser } from "@/users/hooks";
import { useAccountDetails } from "@/hooks/useAccountDetails";
import { useAccountStore } from "@/lib/account-store";
import { errorHasMessage } from "@/lib/errorHasMessage";
import { errorHasReason } from "@/lib/errorHasReason";

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

  const { mutateAsync: addOrUpdateUser, isPending: isPendingUpdateUser } =
    useAddOrUpdateUser();

  const { toast } = useToast();

  const onSubmit = async (data: SettingsFormValues) => {
    try {
      await addOrUpdateUser(data);
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

  const isPending = isPendingGetUser || isLoadingDetails || isPendingUpdateUser;

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

    if (userData?.display_name) {
      console.log("Setting display name from graphql", userData.display_name);
      form.setValue("displayName", userData.display_name);
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

    if (userData?.avatar) {
      console.log("Setting avatar from graphql", userData?.avatar);
      form.setValue("avatar", userData?.avatar || "");
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

  const submitDisabled =
    form.formState.isSubmitting || !form.formState.isValid || isPending;

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
                  <Input {...field} disabled={isPending} />
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
                  <Input {...field} disabled={isPending} />
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
    </div>
  );
};

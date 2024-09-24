"use client";

import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAccount, useEnsAvatar, useEnsName } from "wagmi";
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
import { normalize } from "viem/ens";
import { Button } from "@/components/ui/button";
import { mainnet } from "viem/chains";
import { useEffect, useState } from "react";
import { useAddOrUpdateUser, useGetUser } from "@/users/hooks";

const formSchema = z.object({
  displayName: z.string().max(30, "Max. 30 characters").optional(),
  avatar: z.union([z.string().url("Invalid URL"), z.literal("")]).optional(),
});

export type SettingsFormValues = z.infer<typeof formSchema>;

const defaultValues = {
  displayName: "",
  avatar: "",
};

export const SettingsForm = () => {
  const { address } = useAccount();
  const { data: user, isFetching: isPendingGetUser } = useGetUser({ address });
  const { data: ensName, isFetching: isPendingGetEnsName } = useEnsName({
    address: normalize(address || "") as `0x${string}`,
    chainId: mainnet.id,
  });
  const { data: ensAvatar, isFetching: isPendingGetEnsAvatar } = useEnsAvatar({
    name: ensName || undefined,
    chainId: mainnet.id,
  });

  const { mutateAsync: addOrUpdateUser, isPending: isPendingUpdateUser } =
    useAddOrUpdateUser();
  const onSubmit = async (data: SettingsFormValues) => {
    await addOrUpdateUser(data);
  };

  const isPending =
    isPendingGetUser ||
    isPendingUpdateUser ||
    isPendingGetEnsName ||
    isPendingGetEnsAvatar;

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
    disabled: isPending,
    reValidateMode: "onChange",
    mode: "onChange",
  });

  const { displayName, avatar } = form.watch();

  const [updatedUserName, setUpdatedUserName] = useState(false);
  const [updatedUserNameEns, setUpdatedUserNameEns] = useState(false);
  useEffect(() => {
    if (!updatedUserName && user?.display_name) {
      form.setValue("displayName", user.display_name);
      setUpdatedUserName(true);
      return;
    }

    if (!updatedUserNameEns && !updatedUserName && ensName) {
      form.setValue("displayName", ensName);
      setUpdatedUserNameEns(true);
    }
  }, [displayName, ensName, form, user]);

  const [updatedAvatar, setUpdatedAvatar] = useState(false);
  const [updatedEnsAvatar, setUpdatedEnsAvatar] = useState(false);
  useEffect(() => {
    if (!updatedAvatar && user?.avatar) {
      form.setValue("avatar", user.avatar);
      setUpdatedAvatar(true);
      return;
    }

    if (!updatedEnsAvatar && !updatedAvatar && ensAvatar) {
      form.setValue("avatar", ensAvatar);
      setUpdatedEnsAvatar(true);
    }
  }, [ensAvatar, avatar, form, user]);

  const submitDisabled =
    form.formState.isSubmitting || !form.formState.isValid || isPending;

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
                  <Input {...field} />
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
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {avatar && (
            <>
              <FormLabel>Preview</FormLabel>
              <img
                src={avatar}
                alt="Preview of the profile image"
                width={100}
                height={100}
                className="rounded-full"
              />
            </>
          )}

          <Button disabled={submitDisabled}>Save changes</Button>
        </form>
      </Form>
    </div>
  );
};
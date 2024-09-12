"use client";

import { z } from "zod";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { graphql, readFragment } from "@/lib/graphql";
import { HypercertFullFragment } from "@/hypercerts/fragments/hypercert-full.fragment";
import { HYPERCERTS_API_URL_GRAPH } from "@/configs/hypercerts";
import request from "graphql-request";
import { hypercertIdRegex, isValidHypercertId } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { parseClaimOrFractionId } from "@hypercerts-org/sdk";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ReactNode } from "react";
import { InfoIcon } from "lucide-react";

const formSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Title is required")
      .max(100, "Use at most 100 characters"),
    description: z
      .string()
      .trim()
      .min(10, "Use at least 10 characters")
      .max(500, "Use at most 500 characters"),
    hypercerts: z
      .array(
        z.object({
          hypercertId: z.string().trim().regex(hypercertIdRegex, {
            message: "Invalid hypercert ID",
          }),
          factor: z.number().int().min(1, "Factor must be greater than 0"),
        }),
      )
      .min(1, "At least one hypercert is required")
      .refine((hypercerts) => {
        const hypercertIds = hypercerts.map((hc) => hc.hypercertId);
        return hypercertIds.length === new Set(hypercertIds).size;
      }),
    backgroundImg: z.string().url("Background image URL is not valid"),
    borderColor: z
      .string()
      .regex(/^#(?:[0-9a-f]{3}){1,2}$/i, "Must be a color hex code")
      .min(1, "Border color is required"),
    newHypercertId: z
      .string()
      .trim()
      .refine(
        (value) => {
          if (!value || value === "") {
            return true;
          }

          return isValidHypercertId(value);
        },
        {
          message: "Invalid hypercert ID",
        },
      ),
    newFactor: z.number().int().min(1, "Factor must be greater than 0"),
  })

  .refine(
    (values) => {
      // Check if new hypercert is not already in the list
      const newHypercertId = values.newHypercertId;
      const hypercerts = values.hypercerts.map((hc) => hc.hypercertId);
      return !hypercerts.includes(newHypercertId);
    },
    {
      message: "Hypercert already added",
      path: ["newHypercertId"],
    },
  )
  .refine(
    (values) => {
      // Check if all chainsIds are the same
      try {
        const allHypercertIds = [
          values.newHypercertId,
          ...values.hypercerts.map((hc) => hc.hypercertId),
        ]
          .filter((x) => !!x && x !== "")
          .map((id) => parseClaimOrFractionId(id))
          .map((hc) => hc.chainId);

        if (allHypercertIds.length === 0) {
          return true;
        }

        return allHypercertIds.every((id) => id === allHypercertIds[0]);
      } catch (err) {
        console.error(err);
        return false;
      }
    },
    {
      message: "All hypercerts must be from the same chain",
      path: ["newHypercertId"],
    },
  );

export type CollectionCreateFormValues = z.infer<typeof formSchema>;

const formDefaultValues: CollectionCreateFormValues = {
  title: "This is a title",
  description: "This is a description",
  hypercerts: [
    {
      hypercertId:
        "11155111-0xa16DFb32Eb140a6f3F2AC68f41dAd8c7e83C4941-216419585361716862762706250326604582486016",
      factor: 1,
    },
    {
      hypercertId:
        "11155111-0xa16DFb32Eb140a6f3F2AC68f41dAd8c7e83C4941-215739020627874985835779501111741046063104",
      factor: 2,
    },
  ],
  backgroundImg: "https://placekitten.com/200/300",
  borderColor: "#000000",
  newHypercertId: "",
  newFactor: 1,
};

const query = graphql(
  `
    query Hypercert($hypercert_id: String) {
      hypercerts(where: { hypercert_id: { eq: $hypercert_id } }) {
        data {
          ...HypercertFullFragment
        }
      }
    }
  `,
  [HypercertFullFragment],
);

async function getHypercert(hypercertId: string) {
  const res = await request(HYPERCERTS_API_URL_GRAPH, query, {
    hypercert_id: hypercertId,
  });

  const hypercertFullFragment = res.hypercerts?.data?.[0];
  if (!hypercertFullFragment) {
    return undefined;
  }

  return readFragment(HypercertFullFragment, hypercertFullFragment);
}

const useHypercertsByIds = (hypercertIds: string[]) => {
  return useQuery({
    queryKey: ["hypercerts", hypercertIds],
    queryFn: () => {
      console.log("Fetching hypercerts", hypercertIds);
      return Promise.all(hypercertIds.map((id) => getHypercert(id)));
    },
    initialData: [],
    enabled: !!hypercertIds.length,
    placeholderData: (prev) => prev,
    select: (data) => {
      return data.reduce(
        (acc, hypercert) => {
          if (hypercert?.hypercert_id) {
            acc[hypercert.hypercert_id] = hypercert;
          }
          return acc;
        },
        {} as Record<string, any>,
      );
    },
  });
};

export const CollectionCreateForm = ({
  collectionId,
}: {
  collectionId?: string;
}) => {
  const form = useForm<CollectionCreateFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: formDefaultValues,
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "hypercerts",
  });

  const newHypercertId = form.watch("newHypercertId");
  const hypercerts = form.watch("hypercerts");
  const newFactor = form.watch("newFactor");
  const backgroundImg = form.watch("backgroundImg");

  const onAddHypercert = () => {
    append({ hypercertId: newHypercertId, factor: newFactor });
    form.setValue("newHypercertId", formDefaultValues.newHypercertId);
    form.setValue("newFactor", formDefaultValues.newFactor);
  };

  const onSubmit = (values: CollectionCreateFormValues) => {
    console.log(values, collectionId);
  };

  const allHypercertIds = [
    ...hypercerts.map((hc) => hc.hypercertId),
    newHypercertId,
  ].filter(isValidHypercertId);

  const { data: fetchedHypercerts, isLoading } =
    useHypercertsByIds(allHypercertIds);
  const newHypercert = fetchedHypercerts?.[newHypercertId];
  const canAddHypercert =
    newHypercert && form.formState.errors["newHypercertId"] === undefined;
  console.log(form.formState.errors["newHypercertId"]);

  const canCreateCollection =
    form.formState.isValid &&
    !isLoading &&
    (!newHypercertId || newHypercertId === "");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <section className="space-y-8">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
                <FormDescription>Max. 100 characters</FormDescription>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />

                <FormDescription>Max. 500 characters</FormDescription>
              </FormItem>
            )}
          />

          <div className="flex-col space-y-2">
            {fields.map((field, index) => {
              const hypercert = fetchedHypercerts?.[field.hypercertId];
              return (
                <div key={field.id}>
                  <div className="flex space-x-2 items-end mt-2">
                    <FormField
                      control={form.control}
                      name={`hypercerts.${index}.hypercertId`}
                      render={({ field }) => (
                        <FormItem>
                          {index === 0 && (
                            <FormLabel>
                              Hypercert ID{" "}
                              <InfoTooltip>
                                You can find the Hypercert ID on the view page
                                of the hypercert.
                              </InfoTooltip>
                            </FormLabel>
                          )}
                          <FormControl>
                            <Input {...field} readOnly />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`hypercerts.${index}.factor`}
                      render={({ field }) => (
                        <FormItem>
                          {index === 0 && (
                            <FormLabel>
                              Factor{" "}
                              <InfoTooltip>
                                You can adjust the relative importance of a
                                hypercert within this collection, which will be
                                visually represented on the hyperboard. The
                                default is 1 for each hypercert.
                              </InfoTooltip>
                            </FormLabel>
                          )}
                          <FormControl>
                            <Input {...field} type="number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="button"
                      onClick={() => remove(index)}
                      variant="destructive"
                    >
                      Remove
                    </Button>
                  </div>
                  {hypercert && (
                    <FormDescription className="mt-2 ml-2">
                      {hypercert.metadata.name}
                    </FormDescription>
                  )}
                </div>
              );
            })}
            <div className="flex space-x-2 items-end mt-2">
              <FormField
                control={form.control}
                name={"newHypercertId"}
                render={({ field }) => (
                  <FormItem>
                    {!fields.length && <FormLabel>Hypercert ID</FormLabel>}
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={"newFactor"}
                render={({ field }) => (
                  <FormItem>
                    {!fields.length && <FormLabel>Factor</FormLabel>}
                    <FormControl>
                      <Input {...field} type="number" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button
                type="button"
                onClick={onAddHypercert}
                disabled={!canAddHypercert}
              >
                Add
              </Button>
            </div>
            {newHypercert && (
              <FormDescription className="mt-2 ml-2">
                {newHypercert.metadata.name}
              </FormDescription>
            )}
            {!newHypercert && newHypercertId && (
              <FormMessage>Hypercert not found</FormMessage>
            )}
            {form.formState.errors["newHypercertId"] && (
              <FormMessage>
                {form.formState.errors["newHypercertId"].message}
              </FormMessage>
            )}
            {form.formState.errors["newFactor"] && (
              <FormMessage>
                {form.formState.errors["newFactor"].message}
              </FormMessage>
            )}
          </div>

          <FormField
            control={form.control}
            name="backgroundImg"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Background image URL{" "}
                  <InfoTooltip>
                    For best results use an aspect ratio of 16:9. The best
                    resolution depends on where it will be shown; we recommend
                    at least 1600x900 px.
                  </InfoTooltip>
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {backgroundImg && <img src={backgroundImg} className="max-h-80" />}

          <FormField
            control={form.control}
            name="borderColor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Border color</FormLabel>
                <FormControl>
                  <Input {...field} type="color" className="max-w-32" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={!form.formState.isValid}>
            Create collection
          </Button>
        </section>
      </form>
    </Form>
  );
};

const InfoTooltip = ({ children }: { children: ReactNode }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <InfoIcon
            size={"16px"}
            style={{ marginBottom: "-3px", marginLeft: "4px" }}
          />
        </TooltipTrigger>
        <TooltipContent>{children}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

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
import {
  HypercertFull,
  HypercertFullFragment,
} from "@/hypercerts/fragments/hypercert-full.fragment";
import { HYPERCERTS_API_URL_GRAPH } from "@/configs/hypercerts";
import request from "graphql-request";
import { isValidHypercertId } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { parseClaimOrFractionId } from "@hypercerts-org/sdk";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import React, { ReactNode } from "react";
import { ExternalLink, InfoIcon, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useCreateHyperboard, useUpdateHyperboard } from "@/collections/hooks";
import { useBlueprintsByIds } from "@/blueprints/hooks/useBlueprintsByIds";
import { BlueprintFragment } from "@/blueprints/blueprint.fragment";
import { isParseableNumber } from "@/lib/isParseableInteger";

const idSchema = z
  .string()
  .trim()
  .refine((value) => {
    if (!value || value === "") {
      return true;
    }

    if (isParseableNumber(value)) {
      return true;
    }

    try {
      return isValidHypercertId(value);
    } catch (e) {
      console.error(e);
      return false;
    }
  }, "Invalid hypercert ID");

const formSchema = z
  .object({
    id: z.string().uuid().optional(),
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
    collectionId: z.string().uuid().optional(),
    entries: z
      .array(
        z.object({
          entryId: idSchema,
          factor: z.union([
            z
              .number()
              .int("Enter whole numbers only")
              .min(1, "Factor must be greater than 0")
              .max(100_000_000, "Factor must be less than 100,000,000"),
            z.literal("").refine((value) => {
              return value !== "";
            }, "Factor is required"),
          ]),
        }),
      )
      .min(1, "At least one hypercert or blueprint is required")
      .refine(
        (entries) => {
          const hypercertIds = entries.map((entry) => entry.entryId);
          return hypercertIds.length === new Set(hypercertIds).size;
        },
        {
          message: "Hypercerts must be unique",
          path: ["hypercerts"],
        },
      ),
    backgroundImg: z.union([z.literal(""), z.string().trim().url()]).optional(),
    borderColor: z
      .string()
      .regex(/^#(?:[0-9a-f]{3}){1,2}$/i, "Must be a color hex code")
      .min(1, "Border color is required"),
    newId: idSchema,
    newFactor: z.union([
      z
        .number()
        .int("Enter whole numbers only")
        .min(1, "Factor must be greater than 0")
        .max(100_000_000, "Factor must be less than 100,000,000"),
      z.literal("").refine((value) => {
        return value !== "";
      }, "Factor is required"),
    ]),
  })

  .refine(
    (values) => {
      // Check if new hypercert is not already in the list
      const newHypercertId = values.newId;
      const hypercerts = values.entries.map((entry) => entry.entryId);
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
          values.newId,
          ...values.entries.map((entry) => entry.entryId),
        ]
          .filter((x) => !!x)
          .filter((x) => !isParseableNumber(x))
          .filter((x) => x !== "")
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
  title: "",
  description: "",
  entries: [],
  backgroundImg: "",
  borderColor: "#000000",
  newId: "",
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
      return Promise.all(hypercertIds.map((id) => getHypercert(id)));
    },
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

export const CollectionForm = ({
  presetValues,
}: {
  presetValues?: CollectionCreateFormValues;
}) => {
  const form = useForm<CollectionCreateFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: presetValues || formDefaultValues,
    mode: "onChange",
    reValidateMode: "onChange",
  });
  const { mutateAsync: createHyperboard } = useCreateHyperboard();
  const { mutateAsync: updateHyperboard } = useUpdateHyperboard();

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "entries",
  });

  const newId = form.watch("newId");
  const entries = form.watch("entries");
  const newFactor = form.watch("newFactor");
  const backgroundImg = form.watch("backgroundImg");

  const onAddHypercert = () => {
    append({ entryId: newId, factor: newFactor });
    form.setValue("newId", formDefaultValues.newId);
    form.setValue("newFactor", formDefaultValues.newFactor);
  };

  const onSubmit = async (values: CollectionCreateFormValues) => {
    if (values.id) {
      await updateHyperboard(values);
    } else {
      await createHyperboard(values);
    }
  };

  const allHypercertIds = [...entries.map((entry) => entry.entryId), newId]
    .filter((x) => typeof x === "string")
    .filter(isValidHypercertId);

  const { data: fetchedHypercerts, isFetching: isFetchingHypercerts } =
    useHypercertsByIds(allHypercertIds);

  const allBlueprintsIds = [...entries.map((entry) => entry.entryId), newId]
    .filter((x) => isParseableNumber(x))
    .map((x) => parseInt(x, 10));
  const { data: blueprints, isFetching: isFetchingBlueprints } =
    useBlueprintsByIds(allBlueprintsIds);
  const newHypercert = fetchedHypercerts?.[newId];
  const newBlueprint = blueprints?.[parseInt(newId, 10)];
  const isFetching = isFetchingHypercerts || isFetchingBlueprints;
  const canAddHypercert =
    !isFetching &&
    (newHypercert || newBlueprint) &&
    form.formState.errors["newId"] === undefined &&
    form.formState.errors["newFactor"] === undefined;

  const canCreateCollection =
    form.formState.isValid && !isFetching && (!newId || newId === "");

  const buttonText = form.watch("id")
    ? "Update collection"
    : "Create collection";

  return (
    <section className="flex flex-col-reverse md:flex-row space-x-4 items-stretch md:justify-start">
      <section className="flex flex-col space-y-4 flex-1 md:pr-5 md:border-r-[1.5px] md:border-slate-200">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <section className="space-y-8">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title*</FormLabel>
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
                    <FormLabel>Description*</FormLabel>
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
                  const hypercert = fetchedHypercerts?.[field.entryId];
                  const blueprint = blueprints?.[parseInt(field.entryId, 10)];
                  return (
                    <div key={field.id}>
                      <div className="flex space-x-2 items-end mt-2 mb-2">
                        <FormField
                          control={form.control}
                          name={`entries.${index}.entryId`}
                          render={({ field }) => (
                            <FormItem className="w-full">
                              {index === 0 && (
                                <FormLabel>
                                  Hypercert ID{" "}
                                  <InfoTooltip>
                                    You can find the Hypercert ID on the view
                                    page of the hypercert.
                                  </InfoTooltip>
                                </FormLabel>
                              )}
                              <FormControl>
                                <Input
                                  {...field}
                                  disabled
                                  className="grow w-full"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`entries.${index}.factor`}
                          render={({ field }) => (
                            <FormItem>
                              {index === 0 && (
                                <FormLabel>
                                  Factor{" "}
                                  <InfoTooltip>
                                    You can adjust the relative importance of a
                                    hypercert within this collection, which will
                                    be visually represented on the hyperboard.
                                    The default is 1 for each hypercert.
                                  </InfoTooltip>
                                </FormLabel>
                              )}
                              <FormControl>
                                <Input
                                  {...field}
                                  className="w-20"
                                  onChange={(e) => {
                                    const value = e.target.valueAsNumber;
                                    if (Number.isNaN(value)) {
                                      field.onChange({
                                        target: { value: "" },
                                      });
                                      return;
                                    }
                                    field.onChange({
                                      target: { value },
                                    });
                                  }}
                                  type="number"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <Button
                          type="button"
                          onClick={() => remove(index)}
                          variant="destructive"
                          className="w-28"
                        >
                          Remove
                        </Button>
                      </div>
                      <HypercertErrorMessages
                        isFetching={isFetching}
                        errorMessages={[
                          form.formState.errors[`entries`]?.[index]?.["entryId"]
                            ?.message,
                          form.formState.errors[`entries`]?.[index]?.["factor"]
                            ?.message,
                        ]}
                        hypercert={hypercert}
                        blueprint={blueprint}
                      />
                    </div>
                  );
                })}
                <div className="flex space-x-2 items-end mt-2">
                  <FormField
                    control={form.control}
                    name={"newId"}
                    render={({ field }) => (
                      <FormItem className="w-full">
                        {!fields.length && (
                          <FormLabel>
                            Hypercert or blueprint ID*{" "}
                            <InfoTooltip>
                              You can find the Hypercert or blueprint ID on the
                              view page of the hypercert or in the profile
                              blueprints overview.
                            </InfoTooltip>
                          </FormLabel>
                        )}
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
                      <FormItem className="w-20">
                        {!fields.length && (
                          <FormLabel>
                            Factor*{" "}
                            <InfoTooltip>
                              You can adjust the relative importance of a
                              hypercert within this collection, which will be
                              visually represented on the hyperboard. The
                              default is 1 for each hypercert.
                            </InfoTooltip>
                          </FormLabel>
                        )}
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            className="w-20"
                            onChange={(e) => {
                              const value = e.target.valueAsNumber;
                              if (Number.isNaN(value)) {
                                field.onChange({
                                  target: { value: "" },
                                });
                                return;
                              }
                              field.onChange({
                                target: { value },
                              });
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    onClick={onAddHypercert}
                    disabled={!canAddHypercert}
                    className="w-28"
                  >
                    Add
                  </Button>
                </div>
                <HypercertErrorMessages
                  errorMessages={[
                    form.formState.errors["newId"]?.message,
                    form.formState.errors["newFactor"]?.message,
                  ]}
                  hypercert={newHypercert}
                  blueprint={newBlueprint}
                  hideNotFound={!newId}
                  isFetching={isFetching}
                />
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
                        resolution depends on where it will be shown; we
                        recommend at least 1600x900 px.
                      </InfoTooltip>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {backgroundImg && (
                <img
                  src={backgroundImg}
                  className="max-h-80"
                  alt="Background for hyperboard"
                />
              )}

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

              <Button type="submit" disabled={!canCreateCollection}>
                {buttonText}
              </Button>
            </section>
          </form>
        </Form>
      </section>
      <div className="hidden md:flex flex-col p-6 items-center w-[336px] gap-y-4 italic opacity-50">
        <p>
          A collection can, for instance, represent a project with multiple
          hypercerts or a funding program comprising various projects.
        </p>

        <p>
          For each collection, a hyperboard is automatically generated, showing
          owners in proportion to their shares.
        </p>

        <p>
          You can embed the hyperboard on your website or share it on social
          media to publicly recognize the owners.
        </p>

        <p>All fields and settings can be edited afterwards.</p>
      </div>
    </section>
  );
};

const HypercertErrorMessages = ({
  hypercert,
  blueprint,
  errorMessages = [],
  hideNotFound = false,
  isFetching = false,
}: {
  hypercert?: HypercertFull;
  blueprint?: BlueprintFragment;
  errorMessages: (string | boolean | undefined)[];
  hideNotFound?: boolean;
  isFetching?: boolean;
}) => {
  return (
    <div className="mt-2">
      {hypercert?.metadata && (
        <Link href={`/hypercerts/${hypercert.hypercert_id}`} target="_blank">
          <div className="flex items-center gap-2 content-center cursor-pointer px-1 py-0.5 bg-slate-100 rounded-md w-full text-sm ml-2 mb-2">
            <span className="text-clip">HC: {hypercert.metadata.name}</span>
            <ExternalLink className="w-4 h-4 bg-transparent focus:opacity-70 focus:scale-90" />
          </div>
        </Link>
      )}
      {blueprint?.form_values?.title && (
        <Link href={`/blueprints/${blueprint.id}`} target="_blank">
          <div className="flex items-center gap-2 content-center cursor-pointer px-1 py-0.5 bg-slate-100 rounded-md w-full text-sm ml-2 mb-2">
            <span className="text-clip">BP: {blueprint.form_values.title}</span>
            <ExternalLink className="w-4 h-4 bg-transparent focus:opacity-70 focus:scale-90" />
          </div>
        </Link>
      )}
      {isFetching && !hypercert && !blueprint && (
        <LoaderCircle className="h-6 w-6 animate-spin opacity-70" />
      )}
      {!isFetching && !hideNotFound && !hypercert && !blueprint && (
        <FormMessage className="ml-2">Entry not found</FormMessage>
      )}
      {errorMessages
        .filter((message) => !!message)
        .map((message, index) => (
          <FormMessage className="ml-2" key={index}>
            {message}
          </FormMessage>
        ))}
    </div>
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

"use client";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CalendarIcon,
  Plus,
  Trash2Icon,
  X,
} from "lucide-react";
import { RefObject, useState } from "react";

import CreateAllowlistDialog from "@/components/allowlist/create-allowlist-dialog";
import ConnectDialog from "@/components/connect-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { cn, truncateText } from "@/lib/utils";
import { format } from "date-fns";
import Link from "next/link";
import { UseFormReturn } from "react-hook-form";
import { useAccount } from "wagmi";
import { AllowlistEntry } from "@hypercerts-org/sdk";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toPng } from "html-to-image";
import { FormattedUnits } from "@/components/formatted-units";
import {
  DEFAULT_NUM_FRACTIONS,
  HYPERCERTS_API_URL_REST,
} from "@/configs/hypercerts";
import {
  HyperCertFormKeys,
  HypercertFormValues,
} from "@/components/hypercert/hypercert-minting-form/index";
import { TooltipInfo } from "@/components/tooltip-info";
import {
  FileUploadResult,
  MAX_FILE_SIZE,
} from "@/components/creator-feed/creator-feed-drawer";
import { useStepProcessDialogContext } from "@/components/global/step-process-dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  CollapsibleTrigger,
  CollapsibleContent,
  Collapsible,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

// import Image from "next/image";

interface FormStepsProps {
  form: UseFormReturn<HypercertFormValues>;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  cardRef: RefObject<HTMLDivElement>;
  reset: () => void;
  isBlueprint?: boolean;
}

const GeneralInformation = ({ form }: FormStepsProps) => {
  return (
    <section className="space-y-8">
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Title</FormLabel>
            <FormControl>
              <Input {...field} maxLength={100} />
            </FormControl>
            <FormMessage />
            <FormDescription>Keep it short but descriptive!</FormDescription>
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
              <Textarea {...field} maxLength={5000} />
            </FormControl>
            <FormMessage />
            <FormDescription>
              Describe your project: why it was created, and how it works
            </FormDescription>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="link"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Link (optional)</FormLabel>
            <FormControl>
              <Input {...field} placeholder="https://" />
            </FormControl>
            <FormMessage />
            <FormDescription>
              Paste a link to your impact report or your project
            </FormDescription>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="logo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Logo</FormLabel>
            <FormControl>
              <Input {...field} placeholder="https://" />
            </FormControl>
            <FormMessage />
            <FormDescription>The URL to your project logo</FormDescription>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="banner"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Banner image</FormLabel>
            <FormControl>
              <Input {...field} placeholder="https://" />
            </FormControl>
            <FormMessage />
            <FormDescription>
              The URL to an image to be displayed as the banner
            </FormDescription>
          </FormItem>
        )}
      />
    </section>
  );
};

const formatNumber = (num: number | bigint): string => {
  const formatted = Number(num).toFixed(4);
  return formatted.replace(/\.?0+$/, "");
};

const DatesAndPeople = ({ form }: FormStepsProps) => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const setAllowlistEntries = (allowlistEntries: AllowlistEntry[]) => {
    form.setValue("allowlistEntries", allowlistEntries);
  };
  const allowlistEntries = form.watch("allowlistEntries");
  return (
    <section className="space-y-8">
      <FormField
        control={form.control}
        name="projectDates"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Time of work</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full max-w-[280px] pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground",
                    )}
                  >
                    {field.value.from ? (
                      field.value.to ? (
                        <>
                          {format(field.value.from, "LLL dd, y")} &mdash;{" "}
                          {format(field.value.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(field.value.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={{
                    from: field.value.from!,
                    to: field.value.to,
                  }}
                  defaultMonth={field.value.from}
                  onSelect={(selectedDates) => {
                    field.onChange(selectedDates);
                    field.onBlur();
                  }}
                  disabled={(date) => date < new Date("1900-01-01")}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
            <FormDescription>
              The start and end date of the work represented by the hypercert
            </FormDescription>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="tags"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Work scope</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                className="resize-none h-4"
                placeholder="Separate tags with commas"
                onChange={(e) => {
                  const tags = e.target.value
                    .split(",")
                    .map((tag) => tag.slice(0, 50));
                  field.onChange(tags.length > 0 ? tags.slice(0, 20) : []);
                }}
              />
            </FormControl>
            <FormMessage />
            <FormDescription>
              Tags are used to categorize your project. (Max: 20)
            </FormDescription>
            {field.value &&
              field.value.filter((tag: string) => tag !== "").length > 0 && (
                <div className="flex flex-wrap gap-0.5">
                  {field?.value?.map((tag: string) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="contributors"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Contributors</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                className="resize-none h-8"
                placeholder="Separate contributors with commas"
                onChange={(e) => {
                  const contributors = e.target.value
                    .split(",")
                    .map((contributor) => contributor.slice(0, 50));
                  field.onChange(contributors.length > 0 ? contributors : []);
                }}
              />
            </FormControl>
            <FormMessage />
            <FormDescription>
              Add contributor addresses, names or pseudonyms, whose work is
              represented by the hypercert. All information is public.
            </FormDescription>
            {field.value &&
              field.value.filter((contributor) => contributor !== "").length >
                0 && (
                <div className="flex flex-wrap gap-0.5">
                  <Badge variant="secondary">
                    {
                      field.value.filter((contributor) => contributor !== "")
                        .length
                    }{" "}
                    {field.value.length > 1 ? "contributors" : "contributor"}{" "}
                    added
                  </Badge>
                </div>
              )}
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="confirmContributorsPermission"
        render={({ field }) => (
          <FormItem>
            <div className="flex flex-row items-center space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked);
                    if (checked === true) {
                      field.onBlur();
                    }
                  }}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  I confirm that all listed contributors have permitted their
                  works&apos; inclusion in this hypercert.
                </FormLabel>
              </div>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="allowlistURL"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Allowlist (optional)</FormLabel>
            <FormControl>
              <Input
                {...field}
                value={field.value}
                placeholder="https:// | ipfs://"
              />
            </FormControl>
            <FormMessage />
            <FormDescription>
              Allowlists determine the number of units each address is allowed
              to mint. You can create a new allowlist, or prefill from an
              existing, already uploaded file. If you want to keep any fraction,
              include yourself in the allowlist.
            </FormDescription>
            <div className="flex text-xs space-x-2 w-full justify-end">
              <Button
                type="button"
                disabled={!!field.value}
                variant="outline"
                onClick={() => setCreateDialogOpen(true)}
              >
                {allowlistEntries ? "Edit allowlist" : "Create allowlist"}
              </Button>

              <CreateAllowlistDialog
                setAllowlistEntries={setAllowlistEntries}
                open={createDialogOpen}
                setOpen={setCreateDialogOpen}
              />
            </div>
            {!!allowlistEntries?.length && (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-inherit">
                    <TableHead className="pl-0">Address</TableHead>
                    <TableHead>Percentage</TableHead>
                    <TableHead className="pr-0">Units</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allowlistEntries?.map((entry, index) => (
                    <TableRow
                      key={`${entry.address}-${entry.units}-${index}`}
                      className="hover:bg-inherit"
                    >
                      <TableCell className="pl-0">{entry.address}</TableCell>
                      <TableCell>
                        {formatNumber(calculatePercentageBigInt(entry.units))}%
                      </TableCell>
                      <TableCell className="pr-0">
                        <FormattedUnits decimals={2}>
                          {formatNumber(entry.units)}
                        </FormattedUnits>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </FormItem>
        )}
      />
    </section>
  );
};

const calculatePercentageBigInt = (
  units: bigint,
  total: bigint = DEFAULT_NUM_FRACTIONS,
) => {
  return Number((units * BigInt(10000)) / total) / 100;
};

const ReviewAndSubmit = ({ form, isBlueprint }: FormStepsProps) => {
  const { toast } = useToast();
  const {
    setDialogStep: setStep,
    setSteps,
    setOpen,
    setTitle,
  } = useStepProcessDialogContext();
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const errorToast = (message: string | undefined) => {
    toast({
      title: message,
      variant: "destructive",
      duration: 2000,
    });
  };

  async function validateFile(file: File) {
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File size must be less than 10MB",
        variant: "destructive",
      });
      return false;
    }

    if (file.type !== "application/geo+json") {
      errorToast("Invalid file type. Only GeoJSON files are allowed");
      return false;
    }

    return true;
  }

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("files", file);

    setIsUploading(true);
    setTitle("Uploading GeoJSON File");
    setSteps([{ id: "upload", description: "Uploading to IPFS" }]);
    setOpen(true);
    setStep("upload");

    try {
      const response = await fetch(`${HYPERCERTS_API_URL_REST}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const result = await response.json();

      if (result.success && result.data.results.length > 0) {
        const uploadResult = result.data.results[0];
        form.setValue("geoJSON", {
          src: `ipfs://${uploadResult.cid}`,
          name: file.name,
        });
        await setStep("upload", "completed");
        // Add delay to show completion state
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      await setStep("upload", "error");
      toast({
        title: "Failed to upload file",
        variant: "destructive",
      });
      // Add delay to show error state
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } finally {
      setIsUploading(false);
      setOpen(false); // Close the dialog in all cases
      setSelectedFile(null); // Clear selected file
    }
  };

  return (
    <section className="space-y-8">
      {isBlueprint && (
        <FormField
          control={form.control}
          name="blueprint_minter_address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Recipient of blueprint</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <Collapsible
        open={isAdvancedOpen}
        onOpenChange={setIsAdvancedOpen}
        className="space-y-2"
      >
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold">Advanced Options</h4>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-9 p-0">
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  isAdvancedOpen ? "rotate-180" : "",
                )}
              />
              <span className="sr-only">Toggle advanced options</span>
            </Button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent className="space-y-4">
          <FormField
            control={form.control}
            name="geoJSON"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2">
                  <FormLabel className="uppercase">GeoJSON File</FormLabel>
                  <TooltipInfo
                    tooltipText="Upload a geoJSON file to attach geographical data to your hypercert."
                    className="w-4 h-4"
                  />
                </div>

                {field.value && (
                  <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-md">
                    <span className="text-sm">
                      {truncateText(field.value.name, 20)}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => {
                        form.setValue("geoJSON", undefined);
                        setSelectedFile(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {selectedFile && !field.value && (
                  <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-md">
                    <span className="text-sm">
                      {truncateText(selectedFile.name, 20)}
                    </span>
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      disabled={isUploading}
                      onClick={() => uploadFile(selectedFile)}
                    >
                      {isUploading ? "Uploading..." : "Confirm Upload"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setSelectedFile(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                <input
                  type="file"
                  id="geojson-upload"
                  className="hidden"
                  accept=".geojson,application/geo+json"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file && (await validateFile(file))) {
                      setSelectedFile(file);
                    }
                    e.target.value = "";
                  }}
                />

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  disabled={isUploading || !!selectedFile}
                  onClick={() =>
                    document.getElementById("geojson-upload")?.click()
                  }
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Select GeoJSON
                </Button>

                <FormMessage />
              </FormItem>
            )}
          />
        </CollapsibleContent>
      </Collapsible>

      <FormField
        control={form.control}
        name="acceptTerms"
        render={({ field }) => (
          <FormItem>
            <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked);
                    if (checked === true) {
                      field.onBlur();
                    }
                  }}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  I have read and agree to the{" "}
                  <Link
                    href="https://hypercerts.org/terms/"
                    target="_blank"
                    rel="noreferrer"
                    className="underline text-slate-500"
                  >
                    terms and conditions
                  </Link>
                </FormLabel>
              </div>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </section>
  );
};

type FormStep = {
  title: string;
  fields: HyperCertFormKeys[];
};

export const hypercertFormSteps = new Map([
  [
    1,
    {
      title: "General",
      fields: ["title", "banner", "description", "logo"],
    } as FormStep,
  ],
  [
    2,
    {
      title: "Who did what & when",
      fields: ["contributors", "confirmContributorsPermission", "tags"],
    } as FormStep,
  ],
  [3, { title: "Mint", fields: ["acceptTerms"] } as FormStep],
]);

const FormSteps = ({
  form,
  currentStep,
  setCurrentStep,
  cardRef,
  reset,
  isBlueprint,
}: FormStepsProps) => {
  const isLastStep = currentStep === hypercertFormSteps.size;
  const { address } = useAccount();
  const [isOpen, setIsOpen] = useState(false);

  const takeCardSnapshot = async () => {
    if (cardRef.current === null) {
      return;
    }

    console.log(cardRef.current);
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        fetchRequestInit: { mode: "cors" },
      });
      form.setValue("cardImage", dataUrl);
    } catch (err) {
      console.log(err);
    }
  };

  const isCurrentStepValid = () => {
    const currentStepFields = hypercertFormSteps.get(currentStep)?.fields ?? [];
    const allFieldsValid = currentStepFields.every(
      (field) => form.getFieldState(field)?.invalid === false,
    );
    return allFieldsValid;
  };

  const handleNextClick = async () => {
    if (currentStep === 2) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await takeCardSnapshot();
    }
    const currentStepFields = hypercertFormSteps.get(currentStep)?.fields ?? [];
    await form.trigger(currentStepFields);
    if (!isCurrentStepValid()) {
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  return (
    <section className="space-y-5">
      {/* {form.watch("cardImage") && (
        <div className="border-2 border-slate-300 rounded-lg p-4 mb-4">
          <h3 className="text-lg font-semibold mb-2">Card Preview</h3>
          <div className="relative w-[336px] h-[420px] mx-auto">
            <Image
              src={form.watch("cardImage")}
              alt="Hypercert Card Preview"
              layout="fill"
              objectFit="contain"
            />
          </div>
        </div>
      )} */}
      <div className="space-y-3">
        <Progress value={(currentStep / 3) * 100} className="h-[6px]" />

        <div className="flex justify-between gap-2">
          {Array.from(hypercertFormSteps.entries()).map(([step, { title }]) => (
            <div
              className={`text-sm md:text-base text-center md:text-left px-3 py-2 rounded-md space-y-1 md:space-y-0 md:space-x-2 flex flex-col md:flex-row items-center ${
                step === currentStep
                  ? "text-slate-700 font-semibold bg-slate-100"
                  : "text-slate-700/60"
              }`}
              key={step}
            >
              <Badge
                variant={step === currentStep ? "default" : "outline"}
                className={
                  step === currentStep ? "text-slate-50" : "text-slate-700/60"
                }
              >
                {step}
              </Badge>
              <p className="md:ml-2">{title}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="p-1" />
      {currentStep === 1 && (
        <GeneralInformation
          form={form}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          cardRef={cardRef}
          reset={reset}
        />
      )}
      {currentStep === 2 && (
        <DatesAndPeople
          form={form}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          cardRef={cardRef}
          reset={reset}
        />
      )}
      {currentStep === 3 && (
        <ReviewAndSubmit
          form={form}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          cardRef={cardRef}
          reset={reset}
          isBlueprint={isBlueprint}
        />
      )}

      <div className="relative flex items-center py-3 justify-between">
        <Button
          onClick={() => setCurrentStep(currentStep - 1)}
          className={currentStep === 1 ? "hidden" : ""}
          variant={"outline"}
          type="button"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Previous
        </Button>
        <Button onClick={reset} type="button">
          <Trash2Icon className="w-4 h-4 mr-2" />
          Reset
        </Button>
        {!isLastStep && (
          <Button
            onClick={handleNextClick}
            disabled={!isCurrentStepValid()}
            type="button"
          >
            Next
            <ArrowRightIcon className="w-4 h-4 ml-2" />
          </Button>
        )}
        {isLastStep && address && (
          <Button type="submit" disabled={!isCurrentStepValid()}>
            {isBlueprint ? "Create blueprint" : "Mint hypercert"}
            <ArrowRightIcon className="w-4 h-4 ml-2" />
          </Button>
        )}
        {isLastStep && !address && isCurrentStepValid() && (
          <ConnectDialog isOpen={isOpen} setIsOpen={setIsOpen} />
        )}
      </div>
    </section>
  );
};

export default FormSteps;

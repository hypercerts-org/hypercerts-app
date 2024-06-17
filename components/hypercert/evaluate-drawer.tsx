"use client";

import "@yaireo/tagify/dist/tagify.css"; // Tagify CSS

import { ArrowUpRight, LoaderCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { AllEvaluationStates } from "../../eas/types/all-evaluation-states.type";
import { Button } from "../ui/button";
import { Drawer } from "vaul";
import EvaluateToggle from "./evaluate-toggle";
import { HypercertFull } from "../../hypercerts/fragments/hypercert-full.fragment";
import Tags from "@yaireo/tagify/dist/react.tagify";
import { Textarea } from "../ui/textarea";
import { cn } from "../../lib/utils";
import { createAttestation } from "../../eas/createAttestation";
import { errorHasMessage } from "../../lib/errorHasMessage";
import { errorHasReason } from "../../lib/errorHasReason";
import { getEasConfig } from "../../eas/getEasConfig";
import { isChainIdSupported } from "../../lib/isChainIdSupported";
import { useAccount } from "wagmi";
import { useEthersSigner } from "../../ethers/hooks/useEthersSigner";
import { useGlobalState } from "../../lib/state";
import { useToast } from "../ui/use-toast";

function isAnySectionEvaluated(state: AllEvaluationStates) {
  return (
    state.basics !== "not-evaluated" ||
    state.work !== "not-evaluated" ||
    state.properties !== "not-evaluated" ||
    state.contributors !== "not-evaluated"
  );
}

function isAnySectionInvalid(state: AllEvaluationStates) {
  return (
    state.basics === "invalid" ||
    state.work === "invalid" ||
    state.properties === "invalid" ||
    state.contributors === "invalid"
  );
}

export function EvaluateDrawer({ hypercert }: { hypercert: HypercertFull }) {
  const { chainId } = useAccount();
  const { toast } = useToast();
  const tagifyRef = useRef<Tagify<Tagify.BaseTagData>>();
  const rpcSigner = useEthersSigner({ chainId });

  // Global state
  const whitelistAttestTags = useGlobalState(
    (state) => state.whitelistAttestTags
  );
  const addWhitelistAttestTag = useGlobalState(
    (state) => state.addWhitelistAttestTag
  );

  // Local state
  const [isAttesting, setIsAttesting] = useState(false);
  const [allEvaluationStates, setAllEvaluationStates] =
    useState<AllEvaluationStates>({
      basics: "not-evaluated",
      work: "not-evaluated",
      properties: "not-evaluated",
      contributors: "not-evaluated",
    });
  const [comments, setComments] = useState<string>("");
  const [uid, setUid] = useState<string>();

  // Save tags to global state for use with next evaluation
  useEffect(() => {
    if (tagifyRef.current) {
      tagifyRef.current.on("add", (e) => {
        if (e.detail.data?.value) {
          addWhitelistAttestTag(e.detail.data.value);
        }
      });
    }
  }, [tagifyRef, addWhitelistAttestTag]);

  const errorToast = (message: string | undefined) => {
    toast({
      title: message,
      variant: "destructive",
      duration: 2000,
    });
  };

  const attest = async () => {
    if (!rpcSigner || !chainId || !hypercert.contract?.contract_address) {
      return;
    }
    setIsAttesting(true);
    try {
      const { uid } = await createAttestation({
        chainId: chainId,
        contractAddress: hypercert.contract.contract_address,
        rpcSigner,
        tokenId: hypercert.token_id as string,
        allEvaluationStates,
        tags: tagifyRef.current?.value.map((tag) => tag.value) || [],
        comments,
      });
      setUid(uid);
    } catch (e) {
      if (errorHasReason(e)) {
        errorToast(e.reason);
      } else if (errorHasMessage(e)) {
        errorToast(e.message);
      } else {
        errorToast("An error occurred while creating the attestation.");
      }
      console.error(e);
    }
    setIsAttesting(false);
  };

  if (!isChainIdSupported(chainId)) {
    return (
      <div>
        Please connect to a supported chain to attest. Attestation is open to
        listed trusted evaluators, see{" "}
        <a
          href="https://github.com/hypercerts-org/hypercerts-attestor-registry"
          target="_blank"
        >
          {" "}
          Hypercerts Attestor Registry
        </a>{" "}
        for more information.
      </div>
    );
  }

  if (uid) {
    const easConfig = getEasConfig(chainId);
    const url = `${easConfig?.explorerUrl}/attestation/view/${uid}`;
    return (
      <>
        <Drawer.Title className="font-serif text-3xl lg:text-5xl tracking-tight">
          Evaluate Hypercert
        </Drawer.Title>
        <p>Your attestation has been created!</p>
        <a
          href={url}
          title={url}
          target="_blank"
          rel="norefferer"
          className="flex items-center group text-blue-600 px-2 py-1 bg-blue-50 hover:bg-blue-100 w-max rounded-lg text-sm font-medium"
        >
          <span>
            {uid.slice(0, 6)}...{uid.slice(-4)}
          </span>
          <ArrowUpRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 duration-200" />
        </a>
        <p>
          Attestations will not be immediately visible on the Hypercerts page
          but will be visible in 5-10 minutes.
        </p>
      </>
    );
  }

  // At least one of the sections must be evaluated, and if any section is invalid,
  // a comment is required.
  let isDisabled =
    !isAnySectionEvaluated(allEvaluationStates) ||
    (isAnySectionInvalid(allEvaluationStates) && comments === "") ||
    isAttesting;

  return (
    <>
      <Drawer.Title className="font-serif text-3xl lg:text-5xl tracking-tight">
        Evaluate Hypercert
      </Drawer.Title>

      <p>
        Review and evaluate the information in the Hypercert. Create
        attestations where you mark sections as <strong>valid</strong> or{" "}
        <strong>invalid</strong>. You also have the option to leave a comment
        that will be displayed along with your evaluation.
      </p>
      <p>
        All attestation fields are optional. Review only those sections where
        you confidently can attest to the correctness of the data.
      </p>

      <div className="flex justify-between w-full items-center border-b border-black/10 pb-4">
        <p>Evaluate all</p>
        <EvaluateToggle
          setState={(state) =>
            setAllEvaluationStates({
              ...allEvaluationStates,
              basics: state,
              work: state,
              properties: state,
              contributors: state,
            })
          }
        />
      </div>

      <div className="flex flex-col items-start w-full">
        <h5 className="uppercase text-sm text-gray-500 font-medium tracking-wider">
          Basics
        </h5>
        <div className="flex justify-between w-full items-center">
          <p>Name, description, URL, creator, owner</p>
          <EvaluateToggle
            state={allEvaluationStates.basics}
            setState={(state) =>
              setAllEvaluationStates({
                ...allEvaluationStates,
                basics: state,
              })
            }
          />
        </div>
      </div>

      <div className="flex flex-col items-start w-full">
        <h5 className="uppercase text-sm text-gray-500 font-medium tracking-wider">
          Work
        </h5>
        <div className="flex justify-between w-full items-center">
          <p>Work scope and timeframe</p>
          <EvaluateToggle
            state={allEvaluationStates.work}
            setState={(state) =>
              setAllEvaluationStates({
                ...allEvaluationStates,
                work: state,
              })
            }
          />
        </div>
      </div>

      <div className="flex flex-col items-start w-full">
        <h5 className="uppercase text-sm text-gray-500 font-medium tracking-wider">
          Contributors
        </h5>
        <div className="flex justify-between w-full items-center">
          <p>The contributors involved in the work</p>
          <EvaluateToggle
            state={allEvaluationStates.contributors}
            setState={(state) =>
              setAllEvaluationStates({
                ...allEvaluationStates,
                contributors: state,
              })
            }
          />
        </div>
      </div>

      <div className="flex flex-col items-start w-full">
        <h5 className="uppercase text-sm text-gray-500 font-medium tracking-wider">
          Tags
        </h5>
        <p>Tags add context to the attestation and makes it easier to find.</p>
        <Tags
          className="tags"
          whitelist={whitelistAttestTags}
          tagifyRef={tagifyRef}
        />
      </div>

      <div className="flex flex-col items-start w-full">
        <h5 className="uppercase text-sm text-gray-500 font-medium tracking-wider pb-2">
          Comment
        </h5>
        <Textarea
          placeholder="Any comments entered here are saved with the attestation. A comment is required when a section has been dismissed."
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          className="w-full h-28 border-slate-500 bg-slate-50 py-2 text-sm md:text-base font-medium placeholder:text-slate-500/60 ring-offset-white focus-visible:ring-offset-2 focus-visible:ring-slate-400 focus-visible:ring-2"
          maxLength={280}
        />
      </div>

      <div className="flex gap-5 justify-center w-full">
        <Drawer.Close asChild>
          <Button variant="outline" className="w-1/2">
            Cancel
          </Button>
        </Drawer.Close>
        <Button
          disabled={isDisabled}
          onClick={attest}
          className={cn("w-1/2", {
            "opacity-50 cursor-not-allowed": isDisabled,
          })}
        >
          {isAttesting && (
            <LoaderCircle className="h-4 w-4 animate-spin mr-1" />
          )}
          {isAttesting ? "Creating attestation" : "Create attestation"}
        </Button>
      </div>
    </>
  );
}

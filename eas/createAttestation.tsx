import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { EVALUATIONS_SCHEMA, EVALUATIONS_SCHEMA_UID } from "../configs/eas";

import { AllEvaluationStates } from "./types/all-evaluation-states.type";
import { JsonRpcSigner } from "ethers";
import { evaluationStateToUint8 } from "./evaluationStateToUint8";
import { getEasConfig } from "./getEasConfig";

export async function createAttestation({
  chainId,
  contractAddress,
  tokenId,
  rpcSigner,
  allEvaluationStates,
  tags,
  comments,
}: {
  chainId: number;
  contractAddress: string;
  tokenId: string;
  rpcSigner: JsonRpcSigner;
  allEvaluationStates: AllEvaluationStates;
  tags: string[];
  comments: string;
}) {
  const easConfig = getEasConfig(chainId);
  if (!easConfig) {
    throw new Error("EAS config not found");
  }

  // Initialize EAS API with the EAS contract address
  const eas = new EAS(easConfig.address);
  eas.connect(rpcSigner);

  // Initialize SchemaEncoder with the schema string
  const schemaEncoder = new SchemaEncoder(EVALUATIONS_SCHEMA);

  // Encode the data according to schema
  const encodedData = schemaEncoder.encodeData([
    { name: "chain_id", value: chainId, type: "uint256" },
    { name: "contract_address", value: contractAddress, type: "address" },
    { name: "token_id", value: tokenId, type: "uint256" },
    {
      name: "evaluate_basic",
      value: evaluationStateToUint8(allEvaluationStates.basics),
      type: "uint8",
    },
    {
      name: "evaluate_work",
      value: evaluationStateToUint8(allEvaluationStates.work),
      type: "uint8",
    },
    {
      name: "evaluate_contributors",
      value: evaluationStateToUint8(allEvaluationStates.contributors),
      type: "uint8",
    },
    {
      name: "evaluate_properties",
      value: evaluationStateToUint8(allEvaluationStates.properties),
      type: "uint8",
    },
    { name: "comments", value: comments, type: "string" },
    { name: "tags", value: tags, type: "string[]" },
  ]);

  const tx = await eas.attest({
    schema: EVALUATIONS_SCHEMA_UID,
    data: {
      recipient: "0x0000000000000000000000000000000000000000",
      expirationTime: BigInt(0),
      revocable: false,
      data: encodedData,
    },
  });

  const uid = await tx.wait();
  return {
    tx,
    uid,
  };
}

import EnsName from "../ens-name";
import EthAddress from "../eth-address";
import EvaluatorEvaluationsList from "./evaluator-evaluations-list";
import OrgItems from "./org-items";
import { UserIcon } from "../user-icon";
import { getTrustedAttestor } from "../../github/getTrustedAttestor";
import { isAddress } from "viem";

export default async function EvaluatorDetails({
  evaluatorId,
}: {
  evaluatorId: string;
}) {
  if (!isAddress(evaluatorId)) {
    throw new Error("Invalid address");
  }

  const attestor = await getTrustedAttestor({ address: evaluatorId });

  if (!attestor) {
    throw new Error("Attestor not found");
  }

  return (
    <div className="flex flex-col gap-5 w-full items-start">
      <h1 className="font-serif text-3xl lg:text-5xl tracking-tight">
        <EnsName address={attestor.eth_address} />
      </h1>
      <UserIcon address={attestor.eth_address} size="huge" />
      <EthAddress address={attestor.eth_address} />{" "}
      <h5 className="uppercase text-sm text-slate-500 font-medium tracking-wider">
        Organisations
      </h5>
      <OrgItems orgs={attestor.orgs} />
      <h5 className="uppercase text-sm text-slate-500 font-medium tracking-wider">
        Evaluations
      </h5>
      <EvaluatorEvaluationsList address={attestor.eth_address} />
    </div>
  );
}

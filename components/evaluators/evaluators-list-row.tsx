import EnsName from "../ens-name";
import EthAddress from "../eth-address";
import EvaluationsCount from "../evaluator/evaluations-count";
import Link from "next/link";
import OrgIcons from "../evaluator/org-icons";
import { TrustedAttestor } from "../../github/types/trusted-attestor.type";
import { UserIcon } from "../user-icon";

export default function EvaluatorsListRow({
  attestor,
  ...props
}: {
  attestor: TrustedAttestor;
  [key: string]: any;
}) {
  return (
    <Link
      href={`/evaluators/${attestor.eth_address}`}
      className="w-full hover:bg-secondary rounded-md transition-colors duration-200"
    >
      <div className="flex gap-2 w-full p-2" {...props}>
        <UserIcon address={attestor.eth_address} size="large" />
        <div className="flex flex-col justify-center items-start w-52">
          <EnsName address={attestor.eth_address} />
          <EthAddress address={attestor.eth_address} />{" "}
        </div>
        <div className="flex-grow" />
        <div className="flex flex-col justify-center">
          <OrgIcons orgIds={attestor.orgs} />
        </div>
        <div className="flex-grow" />
        <div className="flex flex-col justify-center">
          <EvaluationsCount address={attestor.eth_address} />
        </div>
      </div>
    </Link>
  );
}

import { isContract } from "@/lib/isContract";

export async function ContractAccountBanner({ address }: { address: string }) {
  const isContractAddress = await isContract(address);

  if (!isContractAddress) return null;

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
      <div className="text-sm text-yellow-700">
        This is a smart contract address. Contract ownership may vary across
        networks. Please verify ownership details for each network.
      </div>
    </div>
  );
}

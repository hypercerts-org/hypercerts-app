"use client";

import ConnectDialog from "@/components/connect-dialog";
import { useHypercertClient } from "@/hooks/use-hypercert-client";
import { truncateEthereumAddress } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { ReactNode, useState } from "react";
import { useAccount } from "wagmi";

const EmptySection = () => {
  return (
    <div className="flex items-center justify-center h-40">
      <p>Nothing here yet</p>
    </div>
  );
};

const InfoSection = ({ children }: { children: ReactNode }) => {
  return (
    <section className="h-40 container mx-auto max-w-screen-md bg-slate-50 border-slate-300 border-2 p-3 rounded-lg flex flex-col items-center justify-center gap-3">
      {children}
    </section>
  );
};

const Profile = () => {
  const { address } = useAccount();
  const { client: hypercertClient } = useHypercertClient();
  const [isConnectOpen, setIsConnectOpen] = useState(false);

  const accountFromPath = usePathname().split("/")[2];
  const isAccountProfile =
    address && accountFromPath && address === accountFromPath;

  const getBatchHypercertMetadata = async (hypercertURIs: string[]) =>
    await Promise.allSettled(
      hypercertURIs.map(async (hypercertURI) => {
        return await hypercertClient.indexer.metadataByUri({
          uri: hypercertURI,
        });
      })
    );

  const {
    data: hypercertsResponse,
    isLoading: isHypercertsLoading,
    error: hypercertsError,
  } = useQuery({
    queryKey: ["hypercerts", address],
    queryFn: async () =>
      await hypercertClient.indexer.hypercertsByOwner({
        owner: address,
        first: 10,
      }),
    enabled: !!address,
  });

  const {
    data: hypercertMetadataResponse,
    isLoading: isHypercertMetadataLoading,
    error: hypercertMetadataError,
  } = useQuery({
    queryKey: ["hypercerts", address, "owned"],
    queryFn: async () =>
      await getBatchHypercertMetadata(
        hypercertsResponse?.hypercerts?.data?.map(
          (hypercert) => hypercert.uri
        ) as string[]
      ),
    enabled: !!address && !!hypercertsResponse?.hypercerts?.data?.length,
  });

  if (!isAccountProfile) {
    return (
      <InfoSection>
        <h5 className="text-lg font-medium">
          Connect your wallet to view your profile
        </h5>
        <ConnectDialog isOpen={isConnectOpen} setIsOpen={setIsConnectOpen} />
      </InfoSection>
    );
  }

  if (isHypercertsLoading) {
    return (
      <InfoSection>
        <div>Loading...</div>
      </InfoSection>
    );
  }

  if (hypercertsError || !hypercertsResponse) {
    return (
      <InfoSection>
        <div>Error loading hypercerts</div>
      </InfoSection>
    );
  }

  if (isHypercertMetadataLoading) {
    return (
      <InfoSection>
        <div>Getting hypercert metadata...</div>
      </InfoSection>
    );
  }

  if (hypercertMetadataError || !hypercertMetadataResponse) {
    return (
      <InfoSection>
        <div>Sorry, we couldn&apos;t load your hypercerts</div>
      </InfoSection>
    );
  }

  const ownedHypercerts = hypercertMetadataResponse.map((response) => {
    if (response.status === "fulfilled" && response.value) {
      return response.value.metadata.data;
    }
  });

  console.log({ ownedHypercerts });

  return (
    <section>
      <div className="flex items-center gap-1 px-2 py-1 bg-slate-100 w-max rounded-lg">
        <div className="h-2 w-2 bg-green-400 rounded-full"></div>
        {address && (
          <p className="text-sm">
            Connected as {truncateEthereumAddress(address)}
          </p>
        )}
      </div>
      <div className="p-3" />
      <h1 className="font-serif text-3xl lg:text-5xl tracking-tight">
        Profile
      </h1>
      <section className="space-y-2 pt-6">
        <div className="flex flex-col">
          <h1 className="text-xl font-semibold tracking-tight">
            My hypercerts
          </h1>
          <hr className="border-t border-gray-300 my-4" />
          {/* {ownedHypercerts && ownedHypercerts.length > 0 ? (
            <div className="flex flex-row flex-wrap gap-5 justify-center md:justify-start">
              {ownedHypercerts.map((hypercert) => {
                const props: HypercertMiniDisplayProps = {
                  // hypercertId: hypercert.hypercert_id as string,
                  name: hypercert?.name as string,
                  chainId: Number(hypercert?.contract?.chain_id),
                };
                return (
                  <HypercertMiniDisplay
                    {...props}
                    key={hypercert.hypercert_id}
                  />
                );
              })}
            </div>
          ) : (
            <EmptySection />
          )} */}
        </div>
      </section>
      <section className="space-y-2">
        <div className="flex flex-col">
          <h1 className="text-xl font-semibold tracking-tight">
            My hyperboards
          </h1>
          <hr className="border-t border-gray-300 my-4" />
        </div>
        <EmptySection />
      </section>
    </section>
  );
};

export { Profile as default };

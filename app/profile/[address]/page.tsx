"use client";

import { InfoSection } from "@/app/profile/[address]/sections";
import {
  ProfileTabButton,
  ProfileTabContent,
  profileTabs,
  type ProfileTabKey,
} from "@/app/profile/[address]/tabs";
import ConnectDialog from "@/components/connect-dialog";
import { Separator } from "@/components/ui/separator";
import { useHypercertClient } from "@/hooks/use-hypercert-client";
import { truncateEthereumAddress } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { Fragment, useState } from "react";
import { useAccount } from "wagmi";
import { supabaseData } from "@/lib/supabase";

const Profile = () => {
  const { address } = useAccount();
  const { client: hypercertClient } = useHypercertClient();
  const [isConnectOpen, setIsConnectOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<ProfileTabKey>("hypercerts");

  const accountFromRoutePath = usePathname().split("/")[2];
  const isAccountProfile =
    address && accountFromRoutePath && address === accountFromRoutePath;

  // const getBatchHypercertMetadata = async (hypercertURIs: string[]) =>
  //   await Promise.allSettled(
  //     hypercertURIs.map(async (hypercertURI) => {
  //       return await hypercertClient.indexer.metadataByUri({
  //         uri: hypercertURI,
  //       });
  //     })
  //   );

  const {
    data: hypercertsByOwnerResponse,
    isLoading: isHypercertsByOwnerLoading,
    error: hypercertsByOwnerError,
  } = useQuery({
    queryKey: ["hypercerts", address],
    queryFn: async () =>
      await hypercertClient.indexer.hypercertsByOwner({
        owner: address,
        first: 10,
      }),
    enabled: !!address && !!activeTab && activeTab === "hypercerts",
  });

  const {
    data: hyperboardsByOwnerResponse,
    isLoading: isHyperboardsByOwnerLoading,
    error: hyperboardsByOwnerError,
  } = useQuery({
    queryKey: ["hyperboards", address],
    queryFn: async () => {
      return await supabaseData
        .from("hyperboards")
        .select("id")
        .eq("admin_id", address!.toLowerCase());
    },
    enabled: !!address,
  });

  // const {
  //   data: hypercertMetadataResponse,
  //   isLoading: isHypercertMetadataLoading,
  //   error: hypercertMetadataError,
  // } = useQuery({
  //   queryKey: ["hypercerts", address, "owned"],
  //   queryFn: async () =>
  //     await getBatchHypercertMetadata(
  //       hypercertsResponse?.hypercerts?.data?.map(
  //         (hypercert) => hypercert.uri
  //       ) as string[]
  //     ),
  //   enabled: !!address && !!hypercertsResponse?.hypercerts?.data?.length,
  // });

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

  if (isHypercertsByOwnerLoading) {
    return (
      <InfoSection>
        <div>Loading...</div>
      </InfoSection>
    );
  }

  console.log({ hypercertsByOwnerResponse });

  if (hypercertsByOwnerError) {
    return (
      <InfoSection>
        <div>Error loading hypercerts...</div>
      </InfoSection>
    );
  }

  if (!hypercertsByOwnerResponse) {
    return <InfoSection>No hypercerts found...</InfoSection>;
  }

  // if (isHypercertMetadataLoading) {
  //   return (
  //     <InfoSection>
  //       <div>Getting hypercert metadata...</div>
  //     </InfoSection>
  //   );
  // }

  // if (hypercertMetadataError || !hypercertMetadataResponse) {
  //   return (
  //     <InfoSection>
  //       <div>Sorry, we couldn&apos;t load your hypercerts</div>
  //     </InfoSection>
  //   );
  // }

  // if (!hypercertMetadataResponse) {
  //   if (!hypercertsResponse?.hypercerts?.data?.length) {
  //     return <InfoSection>No hypercerts found</InfoSection>;
  //   }
  //   return <InfoSection>Loading hypercerts...</InfoSection>;
  // }

  // const ownedHypercerts = hypercertMetadataResponse.map((response) => {
  //   if (response.status === "fulfilled" && response.value) {
  //     return response.value.metadata.data;
  //   }
  // });

  // console.log({ ownedHypercerts });

  return (
    <Fragment>
      <section className="flex space-x-2 items-center">
        <h1 className="font-serif text-4xl lg:text-5xl tracking-tight">
          Profile
        </h1>
        <div className="flex items-center gap-1 px-2 py-1 bg-slate-100 w-max rounded-lg h-max">
          <div className="h-2 w-2 bg-green-400 rounded-full"></div>
          {address && (
            <p className="text-xs">
              Connected as {truncateEthereumAddress(address)}
            </p>
          )}
        </div>
      </section>
      <Separator className="my-4" />
      <section className="flex space-x-2">
        <ProfileTabButton
          tabLabel="Hypercerts"
          tabKey="hypercerts"
          count={hypercertsByOwnerResponse?.hypercerts.count || 0}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
        <ProfileTabButton
          tabLabel="Hyperboards"
          tabKey="hyperboards"
          count={hyperboardsByOwnerResponse?.data?.length || 0}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </section>
      <ProfileTabContent
        activeTab={activeTab}
        data={{
          hyperboardIds:
            hyperboardsByOwnerResponse?.data?.map(
              (hyperboard) => hyperboard.id,
            ) || [],
          //@ts-ignore
          ownedHypercerts: hypercertsByOwnerResponse?.hypercerts.data || [],
        }}
      />
    </Fragment>
  );
};

export { Profile as default };

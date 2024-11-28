import { useMutation, useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import request from "graphql-request";

import { SettingsFormValues } from "@/components/settings/settings-form";
import { HYPERCERTS_API_URL_GRAPH } from "@/configs/hypercerts";
import { graphql, readFragment } from "@/lib/graphql";
import { UserFragment } from "@/users/fragments/user.fragments";
import { useSettingsSigningStrategy } from "@/hooks/useSettingsSigningStrategy";

export const useAddOrUpdateUser = () => {
  const { address } = useAccount();
  const getStrategy = useSettingsSigningStrategy();

  return useMutation({
    mutationKey: ["addOrUpdateUser", address],
    mutationFn: async (user: SettingsFormValues) => {
      await getStrategy().sign(user);
    },
  });
};

export const useGetUser = ({ address }: { address?: string }) => {
  const chainId = useAccount().chainId;
  return useQuery({
    queryKey: ["user", address],
    queryFn: async () => {
      if (!address) {
        return null;
      }

      if (!chainId) {
        return null;
      }
      const query = graphql(
        `
          query UserQuery($address: String!, $chainId: BigInt!) {
            users(
              where: { address: { eq: $address }, chain_id: { eq: $chainId } }
            ) {
              count
              data {
                ...UserFragment
              }
            }
          }
        `,
        [UserFragment],
      );
      const res = await request(HYPERCERTS_API_URL_GRAPH, query, {
        address,
        chainId: chainId.toString(),
      });
      const userFragment = res.users?.data?.[0];
      if (!userFragment) {
        return null;
      }

      return readFragment(UserFragment, userFragment);
    },
    enabled: !!address,
  });
};

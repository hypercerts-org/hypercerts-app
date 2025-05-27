import { useMutation, useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import request from "graphql-request";

import { SettingsFormValues } from "@/components/settings/settings-form";
import { HYPERCERTS_API_URL_GRAPH } from "@/configs/hypercerts";
import { graphql, readFragment } from "@/lib/graphql";
import { UserFragment } from "@/users/fragments/user.fragments";
import { revalidatePathServerAction } from "@/app/actions/revalidatePathServerAction";
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
      if (!address || !chainId) return null;

      const query = graphql(
        `
          query UserQuery($address: String!, $chainId: Int!) {
            users(
              where: { address: { eq: $address }, chain_id: { eq: $chainId } }
            ) {
              data {
                ...UserFragment
              }
            }
            signatureRequests(
              where: { safe_address: { eq: $address }, status: { eq: PENDING } }
            ) {
              data {
                message_hash
                safe_address
                message
              }
            }
          }
        `,
        [UserFragment],
      );

      const res = await request(HYPERCERTS_API_URL_GRAPH, query, {
        address,
        chainId: chainId,
      });

      const userFragment = res.users?.data?.[0];
      const pendingSignatures = res.signatureRequests?.data || [];

      return {
        user: readFragment(UserFragment, userFragment),
        pendingSignatures,
      };
    },
    enabled: !!address,
  });
};

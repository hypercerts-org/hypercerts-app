"use client";

import { useQuery } from "@tanstack/react-query";
import { graphql, readFragment } from "@/lib/graphql";
import { BlueprintFragment } from "@/blueprints/blueprint.fragment";
import { COLLECTIONS_PER_PAGE } from "@/configs/ui";
import { HYPERCERTS_API_URL_GRAPH } from "@/configs/hypercerts";
import request from "graphql-request";

const query = graphql(
  `
    query Blueprint($ids: [Int!], $first: Int, $offset: Int) {
      blueprints(where: { id: { in: $ids } }, first: $first, offset: $offset) {
        count
        data {
          ...BlueprintFragment
        }
      }
    }
  `,
  [BlueprintFragment],
);

export async function getBlueprints({
  filters,
  first = COLLECTIONS_PER_PAGE,
  offset = 0,
}: {
  filters: {
    minterAddress?: string;
    minted?: boolean;
    ids?: number[];
  };
  first?: number;
  offset?: number;
}) {
  const res = await request(HYPERCERTS_API_URL_GRAPH, query, {
    minter_address: filters.minterAddress,
    minted: filters.minted,
    ids: filters.ids,
    first,
    offset,
  });

  const blueprintsFragment = res.blueprints?.data;
  const count = res.blueprints?.count;
  if (!blueprintsFragment) {
    return undefined;
  }

  return {
    count,
    blueprints: readFragment(
      BlueprintFragment,
      blueprintsFragment,
    ) as BlueprintFragment[],
  };
}

export const useBlueprintsByIds = (blueprintIds: number[]) => {
  return useQuery({
    queryKey: ["blueprints", blueprintIds],
    queryFn: () => {
      console.log("blueprints ids", blueprintIds);
      return getBlueprints({
        filters: {
          ids: blueprintIds,
        },
      });
    },
    enabled: !!blueprintIds.length,
    placeholderData: (prev) => prev,
    select: (data) => {
      return data?.blueprints?.reduce(
        (acc, blueprint) => {
          if (blueprint?.id) {
            acc[blueprint.id] = blueprint;
          }
          return acc;
        },
        {} as Record<string, any>,
      );
    },
  });
};

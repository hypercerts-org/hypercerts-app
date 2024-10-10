import "server-only";

import { graphql, readFragment } from "@/lib/graphql";

import { HYPERCERTS_API_URL_GRAPH } from "@/configs/hypercerts";
import { BlueprintFragment } from "./blueprint.fragment";
import request from "graphql-request";
import { COLLECTIONS_PER_PAGE } from "@/configs/ui";

const query = graphql(
  `
    query Blueprint(
      $minter_address: String
      $minted: Boolean
      $first: Int
      $offset: Int
    ) {
      blueprints(
        where: {
          minter_address: { eq: $minter_address }
          minted: { eq: $minted }
        }
        first: $first
        offset: $offset
      ) {
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
  };
  first?: number;
  offset?: number;
}) {
  const res = await request(HYPERCERTS_API_URL_GRAPH, query, {
    minter_address: filters.minterAddress,
    minted: filters.minted,
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

const queryForBlueprintById = graphql(
  `
    query Blueprint($id: Int, $first: Int, $offset: Int) {
      blueprints(where: { id: { eq: $id } }, first: $first, offset: $offset) {
        count
        data {
          ...BlueprintFragment
        }
      }
    }
  `,
  [BlueprintFragment],
);

export async function getBlueprintById(id: number) {
  const res = await request(HYPERCERTS_API_URL_GRAPH, queryForBlueprintById, {
    id,
  });

  const blueprintsFragment = res.blueprints?.data?.[0];
  if (!blueprintsFragment) {
    return undefined;
  }

  return readFragment(
    BlueprintFragment,
    blueprintsFragment,
  ) as BlueprintFragment;
}

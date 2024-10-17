import "server-only";

import { graphql, readFragment } from "@/lib/graphql";

import { HYPERCERTS_API_URL_GRAPH } from "@/configs/hypercerts";
import { BlueprintFragment } from "./blueprint.fragment";
import request from "graphql-request";
import { COLLECTIONS_PER_PAGE } from "@/configs/ui";
import { HypercertFormValues } from "@/components/hypercert/hypercert-minting-form";

const query = graphql(
  `
    query Blueprint($where: BlueprintWhereInput, $first: Int, $offset: Int) {
      blueprints(where: $where, first: $first, offset: $offset) {
        count
        data {
          ...BlueprintFragment
        }
      }
    }
  `,
  [BlueprintFragment],
);

const buildFilters = (filters: {
  minterAddress?: string;
  adminAddress?: string;
  minted?: boolean;
}) => {
  const where: Record<string, unknown> = {};
  if (filters.minterAddress) {
    where["minter_address"] = { eq: filters.minterAddress };
  }
  if (filters.adminAddress) {
    where["admin_address"] = { eq: filters.adminAddress };
  }
  if (filters.minted !== undefined) {
    where["minted"] = { eq: filters.minted };
  }
  if (Object.keys(where).length === 0) {
    return undefined;
  }
  return where;
};

export async function getBlueprints({
  filters,
  first = COLLECTIONS_PER_PAGE,
  offset = 0,
}: {
  filters: {
    minterAddress?: string;
    adminAddress?: string;
    minted?: boolean;
    ids?: number[];
  };
  first?: number;
  offset?: number;
}) {
  const res = await request(HYPERCERTS_API_URL_GRAPH, query, {
    where: buildFilters(filters) as any,
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

  const result = readFragment(BlueprintFragment, blueprintsFragment);
  return result as BlueprintFragment & {
    form_values: HypercertFormValues;
  };
}

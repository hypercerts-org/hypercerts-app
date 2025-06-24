import "server-only";

import { VariablesOf, graphql, readFragment } from "@/lib/graphql";

import { HYPERCERTS_API_URL_GRAPH } from "@/configs/hypercerts";
import { HypercertListFragment } from "@/hypercerts/fragments/hypercert-list.fragment";
import request from "graphql-request";

export type ClaimsOrderBy =
  | "created_asc"
  | "created_desc"
  | "attestations_count_asc"
  | "attestations_count_desc";

export function isClaimsOrderBy(value: string): value is ClaimsOrderBy {
  return [
    "created_asc",
    "created_desc",
    "attestations_count_asc",
    "attestations_count_desc",
  ].includes(value);
}

export type ClaimsFilter = "all" | "evaluated";

export function isClaimsFilter(value: string): value is ClaimsFilter {
  return ["all", "evaluated"].includes(value);
}

const query = graphql(
  `
    query AllHypercerts(
      $where: HypercertWhereInput
      $sortBy: HypercertSortOptions
      $first: Int
      $offset: Int
    ) {
      hypercerts(
        where: $where
        first: $first
        offset: $offset
        sortBy: $sortBy
      ) {
        count

        data {
          ...HypercertListFragment
        }
      }
    }
  `,
  [HypercertListFragment],
);

type VariableTypes = VariablesOf<typeof query>;

function createOrderBy({
  orderBy,
}: {
  orderBy?: ClaimsOrderBy;
}): VariableTypes["sortBy"] {
  if (orderBy) {
    const directionDivider = orderBy.lastIndexOf("_");
    const orderByAttribute = orderBy.substring(0, directionDivider);
    const orderByDirection = orderBy.substring(directionDivider + 1);
    if (orderByAttribute === "created") {
      return {
        creation_block_timestamp:
          orderByDirection === "asc" ? "ascending" : "descending",
      };
    }
    if (orderByAttribute === "attestations_count") {
      return {
        attestations_count:
          orderByDirection === "asc" ? "ascending" : "descending",
      };
    }
  }
  return {
    creation_block_timestamp: "descending",
  };
}

function createFilter({
  filter,
  search,
  chainId,
  burned,
}: {
  filter?: ClaimsFilter;
  search?: string;
  chainId?: number;
  burned?: boolean;
}): VariableTypes["where"] {
  const where: VariableTypes["where"] = {};
  if (search && search.length > 2) {
    where.metadata = { name: { contains: search } };
  }
  if (filter === "evaluated") {
    where.attestations_count = { gte: 1 };
    // TODO: Specify evaluations schemaId so that '/explore' page can only filter evaluation attestations
    // where.eas_schema = { uid: { eq: EVALUATIONS_SCHEMA_UID } };
  }
  if (chainId) {
    where.contract = {
      chain_id: {
        eq: chainId.toString(),
      },
    };
  }
  where.burned = {
    eq: burned,
  };

  return where;
}

export type GetAllHypercertsParams = {
  first: number;
  offset: number;
  orderBy?: ClaimsOrderBy;
  search?: string;
  filter?: ClaimsFilter;
  chainId?: number;
  burned?: boolean;
};

export async function getAllHypercerts({
  first,
  offset,
  orderBy,
  search,
  filter,
  chainId,
  burned = false,
}: GetAllHypercertsParams) {
  const res = await request(HYPERCERTS_API_URL_GRAPH, query, {
    first,
    offset,
    sort: createOrderBy({ orderBy }),
    where: createFilter({ search, filter, chainId, burned }),
  });

  if (!res.hypercerts?.data) {
    return {
      count: 0,
      data: [],
    };
  }

  const data = res.hypercerts.data.reduce<NonNullable<HypercertListFragment>[]>(
    (acc, hypercert) => {
      const hcData = readFragment(HypercertListFragment, hypercert);
      if (hcData?.hypercert_id) {
        acc.push(hcData);
      }
      return acc;
    },
    [],
  );

  return {
    count: res.hypercerts?.count ?? 0,
    data,
  };
}

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
      $where: HypercertsWhereArgs
      $sort: HypercertFetchInput
      $first: Int
      $offset: Int
    ) {
      hypercerts(where: $where, first: $first, offset: $offset, sort: $sort) {
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
}): VariableTypes["sort"] {
  if (orderBy) {
    const directionDivider = orderBy.lastIndexOf("_");
    const orderByAttribute = orderBy.substring(0, directionDivider);
    const orderByDirection = orderBy.substring(directionDivider + 1);
    if (orderByAttribute === "created") {
      return {
        by: {
          creation_block_timestamp:
            orderByDirection === "asc" ? "ascending" : "descending",
        },
      };
    }
    if (orderByAttribute === "attestations_count") {
      return {
        by: {
          attestations_count:
            orderByDirection === "asc" ? "ascending" : "descending",
        },
      };
    }
  }
  return {
    by: {
      creation_block_timestamp: "descending",
    },
  };
}

function createFilter({
  filter,
  search,
  chainId,
}: {
  filter?: ClaimsFilter;
  search?: string;
  chainId?: number;
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

  return where;
}

export type GetAllHypercertsParams = {
  first: number;
  offset: number;
  orderBy?: ClaimsOrderBy;
  search?: string;
  filter?: ClaimsFilter;
  chainId?: number;
};

// TODO: Remove this once we have a proper way to filter out hypercerts that have been burned
const filteredIds = new Set<string>();
filteredIds.add(
  "42220-0x16bA53B74c234C870c61EFC04cD418B8f2865959-24840612785228507832826346342519079436288",
);
filteredIds.add(
  "42220-0x16bA53B74c234C870c61EFC04cD418B8f2865959-24500330418307569369362971735087311224832",
);
filteredIds.add(
  "42220-0x16bA53B74c234C870c61EFC04cD418B8f2865959-24160048051386630905899597127655543013376",
);
filteredIds.add(
  "42220-0x16bA53B74c234C870c61EFC04cD418B8f2865959-23819765684465692442436222520223774801920",
);
filteredIds.add(
  "42220-0x16bA53B74c234C870c61EFC04cD418B8f2865959-25180895152149446296289720949950847647744",
);
filteredIds.add(
  "42220-0x16bA53B74c234C870c61EFC04cD418B8f2865959-23139200950623815515509473305360238379008",
);
filteredIds.add(
  "42220-0x16bA53B74c234C870c61EFC04cD418B8f2865959-23479483317544753978972847912792006590464",
);
filteredIds.add(
  "42220-0x16bA53B74c234C870c61EFC04cD418B8f2865959-27222589353675077077069968594541456916480",
);
filteredIds.add(
  "10-0x822F17A9A5EeCFd66dBAFf7946a8071C265D1d07-16604758658641034201622290718847993414418432 ",
);

export async function getAllHypercerts({
  first,
  offset,
  orderBy,
  search,
  filter,
  chainId,
}: GetAllHypercertsParams) {
  const res = await request(HYPERCERTS_API_URL_GRAPH, query, {
    first,
    offset,
    sort: createOrderBy({ orderBy }),
    where: createFilter({ search, filter, chainId }),
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
      if (hcData?.hypercert_id && !filteredIds.has(hcData.hypercert_id)) {
        acc.push(hcData);
      }
      return acc;
    },
    [],
  );

  const totalCount = Math.max(
    0,
    (res.hypercerts.count ?? 0) - filteredIds.size,
  );

  return {
    count: totalCount,
    data,
  };
}

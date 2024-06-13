import "server-only";

import { HYPERCERTS_API_URL } from "../configs/hypercerts";
import { graphql } from "@/lib/graphql";
import request from "graphql-request";

const query = graphql(`
  query hypercertsTotal {
    hypercerts(count: COUNT) {
      count
    }
  }
`);

export async function getHypercertsTotal() {
  const res = await request(HYPERCERTS_API_URL, query);
  return res.hypercerts.count;
}

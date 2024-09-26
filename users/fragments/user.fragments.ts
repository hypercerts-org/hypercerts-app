import { ResultOf, graphql } from "@/lib/graphql";

export const UserFragment = graphql(`
  fragment UserFragment on User {
    address
    avatar
    display_name
  }
`);

export type UserFragment = ResultOf<typeof UserFragment>;

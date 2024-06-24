import { ResultOf, graphql } from "@/lib/graphql";

export const CollectionFragment = graphql(`
  fragment CollectionFragment on Collection {
    id
    name
    admin_id
    chain_id
    tile_border_color
    grayscale_image
    tile_border_color
  }
`);

export type CollectionFragment = ResultOf<typeof CollectionFragment>;

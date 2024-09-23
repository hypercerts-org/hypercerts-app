import { ResultOf, graphql } from "@/lib/graphql";

export const HyperboardFragment = graphql(`
  fragment HyperboardFragment on Hyperboard {
    id
    name
    admin_id
    chain_id
    background_image
    grayscale_image
    tile_border_color
    collections {
      id
      created_at
      name
      description
      admin_id
      hidden
      chain_id
      hypercerts {
        id
        hypercert_id
        display_size
        admin_id
        chain_id
      }
    }
  }
`);

export type HyperboardFragment = ResultOf<typeof HyperboardFragment>;

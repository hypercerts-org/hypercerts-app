import { ResultOf, graphql } from "@/lib/graphql";

export const HyperboardFragment = graphql(`
  fragment HyperboardFragment on Hyperboard {
    id
    admins {
      address
      chain_id
    }
    name
    background_image
    grayscale_images
    tile_border_color
    sections {
      count
      data {
        label
        collection {
          name
          admins {
            address
            display_name
          }
          description
          id
        }
        entries {
          is_blueprint
          id
          percentage_of_section
          display_size
          name
          total_units
          owners {
            percentage
            address
            units
            avatar
            display_name
          }
        }
        owners {
          percentage_owned
          address
          display_name
          avatar
        }
      }
    }
  }
`);

export type HyperboardFragment = ResultOf<typeof HyperboardFragment>;

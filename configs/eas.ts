export const EVALUATIONS_SCHEMA_UID =
  "0x2f4f575d5df78ac52e8b124c4c900ec4c540f1d44f5b8825fac0af5308c91449";

export const EVALUATIONS_SCHEMA =
  "uint256 chain_id,address contract_address,uint256 token_id,uint8 evaluate_basic,uint8 evaluate_work,uint8 evaluate_contributors,uint8 evaluate_properties,string comments,string[] tags";

type EasConfig = {
  id: number;
  address: string;
  registryAddress: string;
  explorerUrl: string;
  graphqlUrl: string;
};

export const EAS_CONFIG: EasConfig[] = [
  {
    id: 1, // Ethereum
    address: "0xA1207F3BBa224E2c9c3c6D5aF63D0eb1582Ce587",
    registryAddress: "0xA7b39296258348C78294F95B872b282326A97BDF",
    explorerUrl: "https://easscan.org",
    graphqlUrl: "https://easscan.org/graphql",
  },
  {
    id: 11155111, // Ethereum Sepolia
    address: "0xC2679fBD37d54388Ce493F1DB75320D236e1815e",
    registryAddress: "0x0a7E2Ff54e76B8E6659aedc9103FB21c038050D0",
    explorerUrl: "https://sepolia.easscan.org",
    graphqlUrl: "https://sepolia.easscan.org/graphql",
  },
];

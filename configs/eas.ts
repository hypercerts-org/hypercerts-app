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
  {
    id: 10,
    address: "0x4200000000000000000000000000000000000021",
    registryAddress: "0x4200000000000000000000000000000000000020",
    explorerUrl: "https://optimism.easscan.org",
    graphqlUrl: "https://optimism.easscan.org/graphql",
  },
  {
    id: 42220,
    address: "0x72E1d8ccf5299fb36fEfD8CC4394B8ef7e98Af92",
    registryAddress: "0x5ece93bE4BDCF293Ed61FA78698B594F2135AF34",
    explorerUrl: "https://celo.easscan.org",
    graphqlUrl: "https://celo.easscan.org/graphql",
  },
  {
    id: 42161,
    address: "0xbD75f629A22Dc1ceD33dDA0b68c546A1c035c458",
    registryAddress: "0xA310da9c5B885E7fb3fbA9D66E9Ba6Df512b78eB",
    explorerUrl: "https://arbitrum.easscan.org",
    graphqlUrl: "https://arbitrum.easscan.org/graphql",
  },
  {
    id: 8453,
    address: "0x4200000000000000000000000000000000000021",
    registryAddress: "0x4200000000000000000000000000000000000020",
    explorerUrl: "https://base.easscan.org",
    graphqlUrl: "https://base.easscan.org/graphql",
  },
];

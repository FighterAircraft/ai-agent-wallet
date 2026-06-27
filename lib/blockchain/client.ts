import { createPublicClient, http, PublicClient } from 'viem';
import { mainnet, sepolia } from 'viem/chains';

const RPC_URLS = {
  mainnet: process.env.NEXT_PUBLIC_MAINNET_RPC || 'https://eth.public.syfl.io',
  sepolia: process.env.NEXT_PUBLIC_SEPOLIA_RPC || 'https://rpc.sepolia.org',
};

export function getPublicClient(chain: 'mainnet' | 'sepolia' = 'sepolia'): PublicClient {
  const rpcUrl = RPC_URLS[chain];
  const viemChain = chain === 'mainnet' ? mainnet : sepolia;

  return createPublicClient({
    chain: viemChain,
    transport: http(rpcUrl),
  });
}

export const publicClient = getPublicClient();

export const CHAINLINK_FEEDS = {
  'ETH/USD': {
    mainnet: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
    sepolia: '0x694AA1769357215DE4FAC081bf1f309aDC325306',
  },
} as const;

export const CHAINLINK_ABI = [
  {
    inputs: [],
    name: 'latestRoundData',
    outputs: [
      { name: 'roundId', type: 'uint80' },
      { name: 'answer', type: 'int256' },
      { name: 'startedAt', type: 'uint256' },
      { name: 'updatedAt', type: 'uint256' },
      { name: 'answeredInRound', type: 'uint80' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

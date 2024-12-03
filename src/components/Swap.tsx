import { useEffect, useState } from "react";
import sdk, { type FrameContext } from "@farcaster/frame-sdk";
import {
  useAccount,
  useSendTransaction,
  useSignMessage,
  useSignTypedData,
  useWaitForTransactionReceipt,
  useDisconnect,
  useConnect,
} from "wagmi";
import Image from "next/image";


import { truncateAddress } from "~/lib/truncateAddress";

interface Token {
  symbol: string;
  name: string;
  image: string;
  address: string;
  decimals: number;
}

const ETH = {
  symbol: "ETH",
  name: "Ethereum",
  image: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
  address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  decimals: 18,
};

const DEMO_TOKENS: Token[] = [
  {
    symbol: "USDC",
    name: "USD Coin",
    image:
      "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png",
    address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    decimals: 6,
  },
  {
    symbol: "CLANKER",
    name: "Clanker",
    image:
      "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/295953fa-15ed-4d3c-241d-b6c1758c6200/original",
    address: "0x1bc0c42215582d5A085795f4baDbaC3ff36d1Bcb",
    decimals: 18,
  },
];


export default function Swap() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<FrameContext>();
  const { address, isConnected } = useAccount();


  useEffect(() => {
    const load = async () => {
      setContext(await sdk.context);
      sdk.actions.ready();
    };
    if (sdk && !isSDKLoaded) {
      setIsSDKLoaded(true);
      load();
    }
  }, [isSDKLoaded]);

  if (!isSDKLoaded) {
    return <div>Loading...</div>;
  }


  return (
    <div className="w-[300px] mx-auto py-4 px-2">
      
      {/* Wallet Address Display */}
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-2 mb-4 text-center">
        <span className="text-sm text-gray-600 dark:text-gray-400">Wallet: </span>
        <span className="text-sm text-gray-700 dark:text-gray-200 font-mono">{truncateAddress(address) || 'Not connected'}</span>
      </div>

      <h2 className="text-2xl font-bold mb-4">Swap v2 Frame</h2>
      
      {/* Swap Container */}
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 space-y-4">
        {/* From Token */}
        <div className="bg-white dark:bg-gray-700 rounded-lg p-3">
          <div className="flex justify-between mb-2">
            <span className="text-gray-500 dark:text-gray-400">From</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">Balance: 0.0</span>
          </div>
          <div className="relative">
            <input 
              type="number" 
              placeholder="0.0"
              className="w-full bg-transparent text-lg outline-none"
            />
            <div className="absolute right-0 top-1 bottom-1 flex items-center gap-2 bg-white dark:bg-gray-600 px-2 py-1 rounded-md">
              <Image
                src={ETH.image}
                alt={ETH.symbol}
                width={100}
                height={100}
                className="w-6 h-6 rounded-full"
              />
              <div className="bg-transparent border-none outline-none">
                {ETH.symbol}
              </div>
            </div>
          </div>
        </div>

        {/* Swap Direction Button */}
        <button className="mx-auto block bg-gray-200 dark:bg-gray-600 p-2 rounded-full">
          ↓
        </button>

        {/* To Token */}
        <div className="bg-white dark:bg-gray-700 rounded-lg p-3">
          <div className="flex justify-between mb-2">
            <span className="text-gray-500 dark:text-gray-400">To</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">Balance: 0.0</span>
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="number" 
              placeholder="0.0"
              className="w-full bg-transparent text-lg outline-none"
            />
            <button className="bg-gray-200 dark:bg-gray-600 px-3 py-1 rounded-lg">
              Select ▼
            </button>
          </div>
        </div>

        {/* Swap Button */}
        <button className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600">
          Swap
        </button>
      </div>

      {/* User Info (moved to bottom) */}
      <div className="mt-4 text-center">
        <div className="text-lg">Hello {context?.user.username}!</div>
        <img src={context?.user.pfpUrl} alt="avatar" className="w-12 h-12 mt-2 rounded-full mx-auto" />
      </div>
      <div className="p-4 mt-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <pre className="font-mono text-xs whitespace-pre-wrap break-words max-w-[260px] overflow-x-">
          {JSON.stringify(context, null, 2)}
        </pre>
      </div>
    </div>
  );
}

import { useEffect, useCallback, useState } from "react";
import sdk, { type FrameContext } from "@farcaster/frame-sdk";
import moment from "moment";
import {
  useAccount,
  useSendTransaction,
  useWaitForTransactionReceipt
} from "wagmi";
import Image from "next/image";

import { Button } from "~/components/ui/Button";
import { truncateAddress } from "~/lib/truncateAddress";


interface Cast {
  castedAtTimestamp: string;
  text: string;
  hash: string;
  url: string;
  socialCapitalValue: {
    formattedValue: string;
  };
}

interface QueryResponse {
  data: {
    FarcasterCasts: {
      Cast: Cast[];
    };
  };
}

// import { config } from "~/components/providers/WagmiProvider";

interface CastEarningStatsProps {
  title?: string;
}

export default function CastEarningStats({ title = "Cast Earning Stats by @nikolaiii" }: CastEarningStatsProps) {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<FrameContext>();

  const [casts, setCasts] = useState<Cast[]>([]);
  const [moxieRate, setMoxieRate] = useState<number | null>(null);

  const [txHash, setTxHash] = useState<string | null>(null);
  
  //const { address, isConnected } = useAccount();
  const { isConnected } = useAccount();

  const [isContentLoading, setIsContentLoading] = useState(false);

  const {
    sendTransaction,
    error: sendTxError,
    isError: isSendTxError,
    isPending: isSendTxPending,
  } = useSendTransaction();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: txHash as `0x${string}`,
    });

  const openFollowUrl = useCallback(() => {
    sdk.actions.openUrl("https://www.warpcast.com/nikolaiii");
    sdk.actions.close();
  }, []);

  const sendTx = useCallback(() => {
    const amount = BigInt(100n * 10n ** 18n); // 100 DEGEN with 18 decimals
    const data = `0xa9059cbb000000000000000000000000909A24643089b0b64D7150573951AB47b8eba8E1${amount.toString(16).padStart(64, '0')}` as `0x${string}`;
    
    sendTransaction(
      {
        to: "0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed" as `0x${string}`, // DEGEN token contract
        data: data,
      },
      {
        onSuccess: (hash) => {
          setTxHash(hash);
        },
      }
    );
  }, [sendTransaction]);

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

  useEffect(() => {
    const fetchCasts = async () => {
      const fid = context?.user.fid;

      if (!fid) return;
      
      setIsContentLoading(true);
      try {
        const response = await fetch('https://api.airstack.xyz/graphql', {
          method: 'POST',
          headers: {
            'Authorization': '1b51d9a58bf6a4ae7822bf9aadffb2e32',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: `
              query GetLatestCastsForUser {
                FarcasterCasts(
                  input: {blockchain: ALL, filter: {castedBy: {_eq: "fc_fid:${fid}"}}, limit: 20}
                ) {
                  Cast {
                    castedAtTimestamp
                    text
                    hash
                    url
                    socialCapitalValue {
                      formattedValue
                    }
                  }
                }
              }
            `
          }),
        });
        const data: QueryResponse = await response.json();
        setCasts(data.data.FarcasterCasts.Cast);
      } finally {
        setIsContentLoading(false);
      }
    };

    fetchCasts();
  }, [context?.user.fid]);

  const fetchMoxieRate = async () => {
    try {
      const response = await fetch('https://base.blockscout.com/api/v2/search?q=0x8C9037D1Ef5c6D1f6816278C7AAF5491d24CD527');
      const data = await response.json();
      const rate = data.items[0]?.exchange_rate;
      setMoxieRate(rate);
    } catch (error) {
      console.error('Error fetching Moxie rate:', error);
    }
  };

  useEffect(() => {
    fetchMoxieRate();
    const interval = setInterval(fetchMoxieRate, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const renderError = (error: Error | null) => {
    if (!error) return null;
  
    // Check for user rejection message in the error details
    if (error.message.includes("User rejected")) {
      return <div className="text-red-500 text-xs mt-1">User Rejected</div>;
    }
  
    // For other errors, show the full message
    return <div className="text-red-500 text-xs mt-1">{error.message}</div>;
  };

  if (!isSDKLoaded) {
    return <div className="w-full h-full dark:bg-gray-900">Loading...</div>;
  }

  return (
    <div className="w-full mx-auto py-4 px-4 relative dark:bg-gray-900">
        <div className="sticky top-0 left-0 right-0 px-2 pt-4 pb-1 bg-white dark:bg-gray-900">
          <div className="flex items-center gap-2">
            <Image 
              src={context?.user.pfpUrl ?? 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'} 
              alt={context?.user.username ?? ''} 
              width={80} 
              height={80}
              className="flex-none rounded-full" 
            />
            <div className="flex-1 flex-col gap-0">
                <div className="text-2xl font-bold m-0">
                    @{context?.user.username}
                    {/* <a href={`https://warpcast.com/${context?.user.username}`} target="_blank">
                        <span className="text-xs ml-2 align-super text-purple-500">W</span>
                    </a> */}
                </div>
                <div className="text-normal text-gray-500 m-0">{context?.user.fid}</div>
            </div>
            
          </div>
          <div className="flex flex-row gap-4 mt-2">
            <button onClick={openFollowUrl} className="flex-1 border-2 font-bold border-purple-900 dark:border-purple-700 text-purple-900 dark:text-purple-500 px-2 py-2 rounded-md my-1 text-sm">Follow @nikolaiii</button>
            <Button
                onClick={sendTx}
                disabled={!isConnected || isSendTxPending}
                isLoading={isSendTxPending}
                className="flex-1 w-full bg-purple-900 dark:bg-purple-700 font-bold text-white px-2 py-2 rounded-md my-1 text-sm">
              Send 100 $degen
              </Button>
          </div>
          {isSendTxError && renderError(sendTxError)}
          {txHash && (
            <div className="mt-2 text-xs overflow-x-hidden">
              <div>Hash: {truncateAddress(txHash)}</div>
              <div>
                Status:{" "}
                {isConfirming
                  ? "Confirming..."
                  : isConfirmed
                  ? "Confirmed! Thank you for Your Support!"
                  : "Pending"}
              </div>
            </div>
          )}
        </div>      

      <h2 className="text-2xl font-black mt-2 px-2">Casts Ⓜ️ Earning Stats</h2>
      
      {isContentLoading ? (
        <div className="flex justify-center p-4 mt-12">
          <div className="animate-spin rounded-full h-24 w-24 border-b-2 border-purple-900 dark:border-purple-700"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left p-2">Time</th>
                <th className="text-left p-2">Cast</th>
                <th className="text-right p-2 text-nowrap">
                  Ⓜ️ Earned
                  <br/>
                  <span className="text-xs text-gray-500">USD</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {casts.map((cast, index) => (
                <tr key={index} className="border-b border-gray-200 dark:border-gray-700">
                  <td className="px-1">
                    {moment(cast.castedAtTimestamp).fromNow()}
                  </td>
                  <td className="px-1">
                    {cast.text.length > 50 ? cast.text.substring(0, 50) + '...' : cast.text}
                  </td>
                  <td className="px-1 text-right text-lg">
                    {Number(cast.socialCapitalValue?.formattedValue || 0).toFixed(2)}
                    <br/>
                    <span className="text-sm text-gray-500">
                      ${moxieRate 
                        ? (Number(cast.socialCapitalValue?.formattedValue || 0) * moxieRate).toFixed(2)
                        : '-.--'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>   
          <div className="px-4 py-2 text-center text-sm text-gray-500 w-full">{title}</div>
        </div>
      )}
    </div>
  );
}

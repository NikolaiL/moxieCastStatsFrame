import { useEffect, useCallback, useState } from "react";
import sdk, { type FrameContext } from "@farcaster/frame-sdk";
import moment from "moment";
import {
  useAccount,
  useSendTransaction,
  useWaitForTransactionReceipt
} from "wagmi";
import Image from "next/image";
import { UserPlusIcon, ShareIcon, PlusCircleIcon } from "@heroicons/react/24/outline";

import { Button } from "~/components/ui/Button";
import { truncateAddress } from "~/lib/truncateAddress";
import { LoadingSpinner } from '~/components/ui/LoadingSpinner';
import { LoadingDots } from '~/components/ui/LoadingDots';


interface Cast {
  castedAtTimestamp: string;
  text: string;
  hash: string;
  url: string;
  socialCapitalValue: {
    formattedValue: string;
  };
  degenTips?: DegenTip[];
  totalDegenTips?: number | null;
}

interface QueryResponse {
  data: {
    FarcasterCasts: {
      Cast: Cast[];
      pageInfo: PageInfo;
    };
  };
}

// import { config } from "~/components/providers/WagmiProvider";

interface CastEarningStatsProps {
  title?: string;
}

interface DegenTip {
  snapshot_day: string;
  timestamp: string;
  cast_hash: string;
  cast_parent_hash: string;
  fid: string;
  recipient_fid: string;
  tip_status: string;
  tip_type: string;
  tip_amount: string;
  rolling_daily_tip_amount: string;
  tip_allowance: string;
}

// Add interface for page info
interface PageInfo {
  hasNextPage: boolean;
  nextCursor: string;
}

export default function CastEarningStats({ title = "Cast Earning Stats by @nikolaiii" }: CastEarningStatsProps) {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<FrameContext>();

  const [casts, setCasts] = useState<Cast[]>([]);
  const [moxieRate, setMoxieRate] = useState<number | null>(null);
  const [degenRate, setDegenRate] = useState<number | null>(null);

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

  const openShareUrl = useCallback(() => {
    const shareText = encodeURIComponent("See Your Cast Earnings.\nFrame by @nikolaiii 🚀");
    const embedUrl = encodeURIComponent("https://moxie-cast-stats-frame.vercel.app/");
    const shareUrl = `https://warpcast.com/~/compose?text=${shareText}&embeds[]=${embedUrl}`;
    sdk.actions.openUrl(shareUrl);
  }, []);

  const openTipUrl = useCallback(() => {
    const shareText = encodeURIComponent("100 $degen");
    const embedUrl = encodeURIComponent("0xeb54be0d0f94c1f01d4cde36351c86ad8f6f5872");
    const shareUrl = `https://warpcast.com/~/compose?text=${shareText}&parentCastHash=${embedUrl}`;
    sdk.actions.openUrl(shareUrl);
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

  // Add state for cursor and hasNextPage
  const [nextCursor, setNextCursor] = useState<string>("");
  const [hasNextPage, setHasNextPage] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Function to fetch casts with pagination
  const fetchCasts = useCallback(async (cursor: string = "") => {
    const fid = context?.user.fid;
    if (!fid) return;
    
    const isInitialLoad = cursor === "";
    if (isInitialLoad) {
      setIsContentLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const response = await fetch('https://api.airstack.xyz/graphql', {
        method: 'POST',
        headers: {
          'Authorization': process.env.NEXT_AIRSTACK_API_KEY || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query GetLatestCastsForUser {
              FarcasterCasts(
                input: {blockchain: ALL, filter: {castedBy: {_eq: "fc_fid:${fid}"}}, limit: 20, cursor: "${cursor}"}
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
                pageInfo {
                  hasNextPage
                  nextCursor
                }
              }
            }
          `
        }),
      });
      const data: QueryResponse = await response.json();
      
      const newCasts = data.data.FarcasterCasts.Cast.map(cast => ({ ...cast, degenTips: [], totalDegenTips: null }));
      
      // Update pagination info
      setHasNextPage(data.data.FarcasterCasts.pageInfo.hasNextPage);
      setNextCursor(data.data.FarcasterCasts.pageInfo.nextCursor);

      // Append new casts to existing ones
      setCasts(prev => cursor === "" ? newCasts : [...prev, ...newCasts]);
    } finally {
      if (isInitialLoad) {
        setIsContentLoading(false);
      } else {
        setIsLoadingMore(false);
      }
    }
  }, [context?.user.fid]);

  // Initial load
  useEffect(() => {
    if (context?.user.fid) {
      fetchCasts();
    }
  }, [context?.user.fid, fetchCasts]);

  // Intersection Observer for infinite scrolling
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isLoadingMore && !isContentLoading) {
          fetchCasts(nextCursor);
        }
      },
      { 
        rootMargin: '400px', // Load when element is 100px below viewport
        threshold: 0
      }
    );

    const loadMoreTrigger = document.getElementById('load-more-trigger');
    if (loadMoreTrigger) {
      observer.observe(loadMoreTrigger);
    }

    return () => {
      if (loadMoreTrigger) {
        observer.unobserve(loadMoreTrigger);
      }
    };
  }, [hasNextPage, nextCursor, isLoadingMore, isContentLoading, fetchCasts]);

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

  const fetchDegenRate = async () => {
    try {
      const response = await fetch('https://base.blockscout.com/api/v2/search?q=0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed');
      const data = await response.json();
      const rate = data.items[0]?.exchange_rate;
      setDegenRate(rate);
    } catch (error) {
      console.error('Error fetching DEGEN rate:', error);
    }
  };

  useEffect(() => {
    fetchMoxieRate();
    fetchDegenRate();
    const interval = setInterval(() => {
      fetchMoxieRate();
      fetchDegenRate();
    }, 5 * 60 * 1000);
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

  // Add this with the other state declarations at the top of the component
  const [isLoadingDegenTips, setIsLoadingDegenTips] = useState(false);

  // Function to fetch DEGEN tips for a cast
  const fetchDegenTipsForCasts = useCallback(async (castsToFetch: Cast[]) => {
    setIsLoadingDegenTips(true);
    try {
      const updatedCasts = await Promise.all(
        castsToFetch.map(async (cast) => {
          try {
            const formattedHash = cast.hash.replace('0x', '\\x');
            const tipsResponse = await fetch(
              `https://api.degen.tips/airdrop2/tips?limit=500&offset=0&parent_hash=${formattedHash}`
            );
            const tips: DegenTip[] = await tipsResponse.json();
            const totalTips = tips
              .filter(tip => tip.tip_status === "valid")
              .reduce((acc, tip) => acc + Number(tip.tip_amount), 0);
            return {
              ...cast,
              degenTips: tips,
              totalDegenTips: totalTips
            };
          } catch (error) {
            console.error('Error fetching tips for cast:', error);
            return {
              ...cast,
              degenTips: [],
              totalDegenTips: null
            };
          }
        })
      );
      setCasts(prevCasts => {
        const newCasts = [...prevCasts];
        updatedCasts.forEach(updatedCast => {
          const index = newCasts.findIndex(c => c.hash === updatedCast.hash);
          if (index !== -1) {
            newCasts[index] = updatedCast;
          }
        });
        return newCasts;
      });
    } finally {
      setIsLoadingDegenTips(false);
    }
  }, []);

  // Add useEffect to trigger DEGEN tips fetch when new casts are loaded
  useEffect(() => {
    const castsWithoutTips = casts.filter(cast => !cast.degenTips || cast.degenTips.length === 0);
    if (castsWithoutTips.length > 0 && !isLoadingDegenTips) {
      fetchDegenTipsForCasts(castsWithoutTips);
    }
  }, [casts, isLoadingDegenTips, fetchDegenTipsForCasts]);

  const [addFrameResult, setAddFrameResult] = useState("");
  
  const [isFrameAdded, setIsFrameAdded] = useState(false);

  // In your useEffect where you initialize the SDK, check if frame is added
  useEffect(() => {
    const load = async () => {
      const ctx = await sdk.context;
      setContext(ctx);
      setIsFrameAdded(ctx?.client?.added ?? false);
      //setIsFrameAdded(true);
      sdk.actions.ready();
    };
    if (sdk && !isSDKLoaded) {
      setIsSDKLoaded(true);
      load();
    }
  }, [isSDKLoaded]);

  const addFrame = useCallback(async () => {
    try {
      if (!sdk?.actions?.addFrame) {
        setAddFrameResult("SDK not initialized properly");
        return;
      }

      const result = await sdk.actions.addFrame();

      if (result.added) {
        setIsFrameAdded(true);
        if (result.notificationDetails) {
          setAddFrameResult(
            `Added with notifications enabled`
          );
        } else {
          setAddFrameResult("Added successfully");
        }
      } else {
        setAddFrameResult(`Not added: ${result.reason}`);
      }
    } catch (error) {
      console.error('Error adding frame:', error);
      setAddFrameResult(`Error: ${error}`);
    }
  }, []);

  // Add new state for following status
  const [isFollowing, setIsFollowing] = useState(false);
  const [isCheckingFollow, setIsCheckingFollow] = useState(true);

  // Add function to check follow status
  const checkFollowStatus = useCallback(async (userFid: number) => {
    try {
      const response = await fetch('https://api.airstack.xyz/graphql', {
        method: 'POST',
        headers: {
          'Authorization': process.env.NEXT_AIRSTACK_API_KEY || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query CheckFollowing {
              SocialFollowings(
                input: {
                  filter: {
                    followingProfileId: {_eq: "366713"},
                    followerProfileId: {_eq: "${userFid}"}
                  },
                  blockchain: ALL
                }
              ) {
                Following {
                  followingProfileId
                }
              }
            }
          `
        }),
      });
      
      const data = await response.json();
      
      // Check if Following array exists and has items
      setIsFollowing(!!data.data?.SocialFollowings?.Following?.length || userFid === 366713);
      //setIsFollowing(false);
      console.log('Following status:', !!data.data?.SocialFollowings?.Following?.length);
    } catch (error) {
      console.error('Error checking follow status:', error);
      setIsFollowing(false);
    } finally {
      setIsCheckingFollow(false);
    }
  }, []);

  // Check follow status when context (user) changes
  useEffect(() => {
    if (context?.user.fid) {
      checkFollowStatus(context.user.fid);
    }
  }, [context?.user.fid, checkFollowStatus]);

  if (!isSDKLoaded) {
    return <div className="w-full h-full dark:bg-gray-900">Loading...</div>;
  }

  return (
    <div className="w-full mx-auto py-4 px-4 relative dark:bg-gray-900">
        <div className="sticky top-0 left-0 right-0 pt-4 pb-1 bg-white dark:bg-gray-900 z-10">
          <div className="flex justify-between">
            <div className="flex items-center gap-1">
              <Image 
                src={context?.user.pfpUrl ?? 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'} 
                alt={context?.user.username ?? ''} 
                width= {60} 
                height={60}
                className='flex-none rounded-full object-cover transition-all duration-200 w-[60px] h-[60px]'
              />
              <div className="flex-1 flex-col gap-0">
                <div className="text-2xl font-bold m-0">
                  @{context?.user.username}
                </div>
                <div className="text-normal text-gray-500 m-0">{context?.user.fid}</div>
              </div>
            </div>

            <div className="mt-1 absolute right-0 top-0 flex flex-col gap-1 text-xs">
              {isCheckingFollow ? (
                <div className="flex justify-end p-3 h-6">
                  <LoadingDots className="bg-purple-500" />
                </div>
              ) : isFollowing ? (
                <div className="text-purple-900 p-1 dark:text-purple-500 h-6">
                  Thank you for following!
                </div>
              ) : (
                <button
                  onClick={openFollowUrl}
                  className="flex flex-row-reverse gap-1 p-1 h-6 text-purple-900 dark:text-purple-500 hover:bg-purple-100 dark:hover:bg-gray-800 rounded-full"
                >
                  <UserPlusIcon className="h-4 w-4" /><span className="mt-px">Follow</span>
                </button>
              )}

              <button
                onClick={addFrame}
                disabled={isFrameAdded}
                className={`flex flex-row-reverse gap-1 p-1 text-purple-900 dark:text-purple-500 hover:bg-purple-100 dark:hover:bg-gray-800 rounded-full ${
                  isFrameAdded ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <PlusCircleIcon className="h-4 w-4" />
                <span className="mt-px">{isFrameAdded ? 'Frame Added' : 'Add Frame'}</span>
              </button>

              <button
                onClick={openShareUrl}
                className="flex flex-row-reverse gap-1 p-1 text-purple-900 dark:text-purple-500 hover:bg-purple-100 dark:hover:bg-gray-800 rounded-full"
              >
                <ShareIcon className="h-4 w-4" /><span className="mt-px">Share</span>
              </button>

            </div>
          </div>

          {/* DEGEN buttons */}
          <div className="flex flex-row gap-2 mt-6 pb-4">
            <Button
              onClick={sendTx}
              disabled={!isConnected || isSendTxPending}
              isLoading={isSendTxPending}
              className="hover:bg-purple-700 dark:hover:bg-purple-600 hover:border-purple-700 dark:hover:border-purple-600 basis-1/2 w-full border-2 font-bold border-purple-900 dark:border-purple-700 bg-purple-900 dark:bg-purple-700 font-bold text-white px-2 py-2 rounded-md text-sm">
              Send 100 $degen
            </Button>
            <Button
              onClick={openTipUrl}
              className="hover:bg-purple-700 dark:hover:bg-purple-600 hover:border-purple-700 dark:hover:border-purple-600 basis-1/2 w-full border-2 font-bold border-purple-900 dark:border-purple-700 bg-purple-900 dark:bg-purple-700 font-bold text-white px-2 py-2 rounded-md text-sm">
              Tip 100 $degen
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
          {addFrameResult && (
            <div className="text-sm text-center mt-2 text-gray-600 dark:text-gray-400">
              {addFrameResult}
            </div>
          )}
        </div>      

      <h2 className="text-2xl font-black mt-2 px-2">Casts Earning Stats</h2>
      
      {isContentLoading ? (
        <div className="mt-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="overflow-x-auto relative">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left p-2">Time</th>
                <th className="text-left p-2">Cast</th>
                <th className="text-right p-2 text-nowrap">
                  $Moxie
                  <br/>
                  <span className="text-xs text-gray-500">USD</span>
                </th>
                <th className="text-right p-2 text-nowrap">
                  $Degen
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
                  <td className="px-1 text-right text-lg">
                    {(isLoadingDegenTips && cast.totalDegenTips === null) ? (
                      <div className="flex justify-end">
                        <LoadingDots className="bg-gray-500" />
                      </div>
                    ) : cast.totalDegenTips && cast.totalDegenTips > 0 ? (
                      <span>
                        {Number(cast.totalDegenTips).toFixed(0)}
                        <br/>
                        <span className="text-sm text-gray-500">
                          ${Number(cast.totalDegenTips * (degenRate || 0)).toFixed(2)}
                        </span>
                      </span>
                    ) : (
                      <span></span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>   
          
          {/* Loading trigger for infinite scroll */}
          <div id="load-more-trigger">
            {isLoadingMore && (
              <div className="flex justify-center">
                <LoadingSpinner size="md" />
              </div>
            )}
          </div>
          
          <div className="text-center text-sm text-gray-500 w-full">{title}</div>
        </div>
      )}
    </div>
  );
}

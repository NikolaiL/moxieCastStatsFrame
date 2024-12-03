import { useEffect, useState } from "react";
import sdk, { type FrameContext } from "@farcaster/frame-sdk";
import moment from "moment";

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

export default function CastEarningStats() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<FrameContext>();
  const [casts, setCasts] = useState<Cast[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [moxieRate, setMoxieRate] = useState<number | null>(null);

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
      
      setIsLoading(true);
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
                  input: {blockchain: ALL, filter: {castedBy: {_eq: "fc_fid:${fid}"}}, limit: 50}
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
        setIsLoading(false);
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

  if (!isSDKLoaded) {
    return <div>Loading...</div>;
  }


  return (
    <div className="w-full mx-auto py-4 px-4">

        <div className="mt-4 flex items-center gap-2">
            <img src={context?.user.pfpUrl} alt={context?.user.username} className="w-16 h-16 rounded-full" />
            <div className="flex flex-col gap-0">
                <div className="text-2xl font-bold m-0">
                    @{context?.user.username}
                    {/* <a href={`https://warpcast.com/${context?.user.username}`} target="_blank">
                        <span className="text-xs ml-2 align-super text-purple-500">W</span>
                    </a> */}
                </div>
                <div className="text-normal text-gray-500 m-0">{context?.user.fid}</div>
            </div>
        </div>      

      <h2 className="text-2xl font-bold my-4">Casts Ⓜ️ Earning Stats</h2>
      
      {isLoading ? (
        <div className="flex justify-center p-4 mt-8">
          <div className="animate-spin rounded-full h-24 w-24 border-b-2 border-purple-500"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
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
                <tr key={index} className="border-b">
                  <td className="p-2">
                    {moment(cast.castedAtTimestamp).fromNow()}
                  </td>
                  <td className="p-2">
                    {cast.text.length > 50 ? cast.text.substring(0, 50) + '...' : cast.text}
                  </td>
                  <td className="p-2 text-right">
                    {Number(cast.socialCapitalValue?.formattedValue || 0).toFixed(2)}
                    <br/>
                    <span className="text-xs text-gray-500">
                      ${moxieRate 
                        ? (Number(cast.socialCapitalValue?.formattedValue || 0) * moxieRate).toFixed(2)
                        : '-.--'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

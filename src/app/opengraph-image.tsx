import { ImageResponse } from "next/og";

export const alt = "Casts Ⓜ️ Earning Stats";
export const size = {
  width: 600,
  height: 400,
};

export const contentType = "image/png";



export default async function Image() {

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC'  // or your preferred timezone
  });

  return new ImageResponse(
    (
      <div
        tw="h-full w-full bg-purple-900 text-white flex flex-col justify-center items-center relative"
      >
        <h1 tw="text-5xl font-bold">Casts Ⓜ️ Earnings Stats</h1>
        <h3 tw="mt-4 text-3xl">by <span tw="ml-2 text-fuchsia-400 font-bold"> @nikolaiii</span></h3>
        <p tw="absolute bottom-0 opacity-40">{currentDate} UTC</p>
      </div>
    ),
    {
      ...size,
    }
  );
}

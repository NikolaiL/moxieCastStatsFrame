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
        tw="h-full w-full text-white flex flex-col justify-center items-center relative"
        style={{
          backgroundImage: `url(${process.env.NEXT_PUBLIC_URL}/bg.png)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <p tw="absolute bottom-0 opacity-40">{currentDate} UTC</p>
      </div>
    ),
    {
      ...size,
    }
  );
}

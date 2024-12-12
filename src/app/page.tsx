import { Metadata } from "next";
import App from "./app";

const appUrl = process.env.NEXT_PUBLIC_URL;

const frame = {
  version: "next",
  imageUrl: `${appUrl}/opengraph-image`,
  button: {
    title: "See My Earnings",
    action: {
      type: "launch_frame",
      name: "Casts Earnings Stats",
      url: appUrl,
      splashImageUrl: `${appUrl}/splash.png`,
      splashBackgroundColor: "#581C87",
    },
  },
};

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Casts Earnings Stats",
    openGraph: {
      title: "Casts Earnings Stats",
      description: "Track the $Moxie and $Degen Earnings of Your Latest Casts",
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}

export default function Home() {
  return (<App />);
}

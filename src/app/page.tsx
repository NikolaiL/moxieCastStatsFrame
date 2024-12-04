import { Metadata } from "next";
import App from "./app";

const appUrl = process.env.NEXT_PUBLIC_URL;

const frame = {
  version: "next",
  imageUrl: `${appUrl}/opengraph-image`,
  button: {
    title: "See My Ⓜ️ Earnings",
    action: {
      type: "launch_frame",
      name: "Casts Ⓜ️ Earning Stats",
      url: appUrl,
      splashImageUrl: `${appUrl}/splash.png`,
      splashBackgroundColor: "#581C87",
    },
  },
};

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Casts Ⓜ️ Earning Stats",
    openGraph: {
      title: "Casts Ⓜ️ Earning Stats",
      description: "Track the Moxie Earnings of Your Latest Casts",
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}

export default function Home() {
  return (<App />);
}

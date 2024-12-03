"use client";

import dynamic from "next/dynamic";

const CastEarningStats = dynamic(() => import("~/components/CastEarningStats"), {
  ssr: false,
});

export default function App(
  { title }: { title?: string } = { title: "Cast Earning Stats" }
) {
  return <CastEarningStats title={title} />;
}

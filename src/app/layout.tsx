import type { Metadata } from "next";

import "~/app/globals.css";
import { Providers } from "~/app/providers";

export const metadata: Metadata = {
  title: "Casts Earnings Stats",
  description: "Track the $Moxie and $Degen Earnings of Your Latest Casts",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-white dark:bg-gray-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

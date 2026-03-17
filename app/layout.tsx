import type { Metadata } from "next";
import { League_Spartan } from "next/font/google";
import {NextIntlClientProvider} from 'next-intl';
import "./globals.css";
import { Providers } from "./providers";
import { detectIOS } from "./support/useViewportHeight";


const leagueSpartan = League_Spartan({
  subsets: ["latin"],
  variable: "--font-league",
  weight: ["100","200","300","400","500","600","700","800","900"],
});

export const metadata: Metadata = {
  title: "Sinersys",
  description: "New Energy Frontiers",
};

type Props = {
  children: React.ReactNode;
};

export default async function RootLayout({children}: Props) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8"/>
        <meta name="next-size-adjust" content=""/>
        <meta 
          name="viewport" 
          content="width=device-width, initial-scale=1, viewport-fit=cover" 
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body
        className={`
          antialiased pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] h-[100vh] h-[100dvh] h-[100lvh]
        `}
      >
        <Providers>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
        </Providers>
      </body>
    </html>
  );
}
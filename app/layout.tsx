import type { Metadata } from "next";
import { League_Spartan } from "next/font/google";
import {NextIntlClientProvider} from 'next-intl';
import "./globals.css";
import { Providers } from "./providers"; 
import LandscapeBlock from "./components/LandscapeBlock";


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
    <html>
      <head>
        <meta charSet="utf-8"/>
        <meta name="next-size-adjust" content=""/>
        <meta 
          name="viewport" 
          content="width=device-width, initial-scale=1, viewport-fit=cover" 
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        {/* <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link href="https://fonts.googleapis.com/css2?family=Gilda+Display&display=swap" rel="stylesheet"></link> */}
        {/* <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..900;1,6..96,400..900&family=Gilda+Display&display=swap" rel="stylesheet"></link> */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..900;1,6..96,400..900&family=Gilda+Display&family=Rufina:wght@400;700&display=swap" rel="stylesheet"></link>
      </head>
      <body
        className={`
          antialiased pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] h-[100vh] h-[100dvh] h-[100lvh]
        `}
      >
        <LandscapeBlock />
        <Providers>
        <NextIntlClientProvider>
          {children}
        </NextIntlClientProvider>
        </Providers>
      </body>
    </html>
  );
}
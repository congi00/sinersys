import type { Metadata } from "next";
import { League_Spartan } from "next/font/google";
import {NextIntlClientProvider} from 'next-intl';
import "./globals.css";
import { Providers } from "./providers";


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
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body
        className={`
          ${leagueSpartan.variable} 
          antialiased
          min-h-dvh pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]
        `}
      >
        <Providers>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
        </Providers>
      </body>
    </html>
  );
}

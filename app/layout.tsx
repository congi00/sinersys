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
        <meta name="apple-mobile-web-app-capable" content="yes"></meta>
        <meta name="apple-mobile-web-app-status-bar-style" content="rgba(255,255,255,0"></meta>
        <meta name="theme-color" content="rgba(255,255,255,0)" />
      </head>
      <body
        className={`
          ${leagueSpartan.variable} 
          antialiased
        `}
      >
        <Providers>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
        </Providers>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import {NextIntlClientProvider} from 'next-intl';
import "./globals.css";
import { Providers } from "./providers"; 
import LandscapeBlock from "./components/LandscapeBlock";
import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const { locale } = await params;

  const t = await getTranslations({
    locale,
    namespace: "homepage",
  });

  const title = "Sinersys — New Energy Frontiers";

  const description =
    t("slide0.subtitle")
      .replace(/\n/g, " ")
      .trim();

  return {
    title: {
      default: title,
      template: "%s | Sinersys",
    },

    description,

    keywords: [
      "motore elettrico",
      "six phase motor",
      "APWEC",
      "energia rinnovabile",
      "Sinersys",
      "motore a 6 fasi",
      "generatore energia rinnovabile",
      "energia continua",
    ],

    authors: [{ name: "Sinersys" }],
    creator: "Sinersys",

    metadataBase: new URL("https://sinersys.it"),

    openGraph: {
      type: "website",
      locale:
        locale === "it"
          ? "it_IT"
          : locale === "en"
          ? "en_US"
          : locale === "de"
          ? "de_DE"
          : "fr_FR",

      alternateLocale: ["it_IT", "en_US", "de_DE", "fr_FR"],

      title,

      description,

      siteName: "Sinersys",

      images: [
        {
          url: "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: "Sinersys",
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.jpg"],
    },

    robots: {
      index: true,
      follow: true,
    },

    alternates: {
      canonical:
        locale === "it"
          ? "https://sinersys.it/it"
          : `https://sinersys.it/${locale}`,

      languages: {
        it: "/it",
        en: "/en",
        de: "/de",
        fr: "/fr",
      },
    },
    icons: {
      icon: [{ url: "/favicon-32x32.png", sizes: "32x32" }, { url: "/favicon-16x16.png", sizes: "16x16" }],
      apple: "/apple-touch-icon.png",
    },
    manifest: "/site.webmanifest",
  };
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function RootLayout({children}: Props) {
  const locale = (await cookies()).get('locale')?.value || 'en';
  return (
    <html lang={locale}>
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
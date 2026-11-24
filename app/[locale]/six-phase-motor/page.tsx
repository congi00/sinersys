import { getTranslations } from "next-intl/server";
import SixPhasePage from "../../containers/SixPhasePage";
import { buildBreadcrumb } from "@/app/utilities";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale, namespace: "motore6fasi" });
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "SixPhaseMotor",
    name: "Six Phase Motor",
    description: t("slide0.subtitle"),
    brand: { "@type": "Brand", name: "Sinersys" },
    manufacturer: {
      "@type": "Organization",
      name: "Sinersys",
      url: "https://www.sinersys.it",
    },
    category: "Renewable Energy Technology",
  };

  const breadcrumb = buildBreadcrumb(locale, [
    { name: "Home", path: "/" },
    { name: "Six Phase Motor", path: "/six-phase-motor" },
  ]);

  return {
    title: t("slide0.title"),
    description: t("slide0.subtitle"),
    keywords: t("keywords"),
    authors: [{ name: "Sinersys" }],
    creator: "Sinersys",
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large" },
    },
    alternates: {
      canonical: `https://www.sinersys.it/${locale}/six-phase-motor`,
      languages: {
        it: "/it/six-phase-motor",
        en: "/en/six-phase-motor",
        de: "/de/six-phase-motor",
        fr: "/fr/six-phase-motor",
      },
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "motore6fasi" });
  const product = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: t("slide0.title"),
    description: t("slide0.subtitle"),
    brand: { "@type": "Brand", name: "Sinersys" },
    manufacturer: {
      "@type": "Organization",
      name: "Sinersys",
      url: "https://www.sinersys.it",
    },
    category: "Renewable Energy Technology",
  };
  const breadcrumb = buildBreadcrumb(locale, [
    { name: "Home", path: "/" },
    { name: "Six Phase Motor", path: "/six-phase-motor" },
  ]);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(product) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <SixPhasePage />
    </>
  );
}

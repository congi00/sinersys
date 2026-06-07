import { getTranslations } from "next-intl/server";
import CookiePage from "../../containers/CookiePage";

export async function generateMetadata({ params }: { params: { locale: string } }) {
    const { locale } = await params;
    const t = await getTranslations({ locale: locale, namespace: 'cookies' });
    return {
      title: t('title'),   // es. 'APWEC — Autonomous Perpetual Wave Energy Converter'
      description: t('subtitle'),
      alternates: {
        canonical: `https://www.sinersys.it/${locale}/cookies`,
        languages: { it: '/it/cookies', en: '/en/cookies', de: '/de/cookies', fr: '/fr/cookies' },
      },
    };
  }
  
export default function Page() { return <CookiePage />; }
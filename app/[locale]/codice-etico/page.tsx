import { getTranslations } from "next-intl/server";
import EthicsPage from "../../containers/EthicsPage";

export async function generateMetadata({ params }: { params: { locale: string } }) {
    const { locale } = await params;
    const t = await getTranslations({ locale: locale, namespace: 'ethics' });
    return {
      title: t('title'),   // es. 'APWEC — Autonomous Perpetual Wave Energy Converter'
      description: t('subtitle'),
      alternates: {
        canonical: `https://www.sinersys.it/${locale}/codice-etico`,
        languages: { it: '/it/codice-etico', en: '/en/codice-etico', de: '/de/codice-etico', fr: '/fr/codice-etico' },
      },
    };
  }
  
export default function Page() { return <EthicsPage />; }
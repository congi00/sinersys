import { getTranslations } from "next-intl/server";
import PrivacyPage from "../../containers/PrivacyPage";

export async function generateMetadata({ params }: { params: { locale: string } }) {
    const t = await getTranslations({ locale: params.locale, namespace: 'privacy' });
    return {
      title: t('title'),
      description: t('subtitle'),
      alternates: {
        canonical: `https://sinersys.it/${params.locale}/privacy`,
        languages: { it: '/it/privacy', en: '/en/privacy', de: '/de/privacy', fr: '/fr/privacy' },
      },
    };
  }
  
export default function Page() { return <PrivacyPage />; }
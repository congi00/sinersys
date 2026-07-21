import { getTranslations } from "next-intl/server";
import PrivacyPage from "../../containers/PrivacyPage";

export async function generateMetadata({ params }: { params: { locale: string } }) {
    const { locale } = await params;
    const t = await getTranslations({ locale: locale, namespace: 'privacy' });
    return {
      title: t('title'),
      description: t('subtitle'),
      alternates: {
        canonical: `https://www.sinersys.it/${locale}/privacy`,
        languages: {
          it: 'https://www.sinersys.it/it/privacy',
          en: 'https://www.sinersys.it/en/privacy',
          de: 'https://www.sinersys.it/de/privacy',
          fr: 'https://www.sinersys.it/fr/privacy',
          'x-default': 'https://www.sinersys.it/it/privacy',
        },
      },
    };
  }
  
export default function Page() { return <PrivacyPage />; }
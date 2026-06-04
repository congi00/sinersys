import { Metadata } from "next";
import HomeClient from "../HomeClient"; // sposta tutto il codice attuale qui
import { getTranslations } from "next-intl/server";
import WorkInProgressPage from "../WorkInProgressPage";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'homepage' });

  return {
    title: "Sinersys - New Energy Frontiers",
    description: t("slide0.title"),
  };
}

export default function Page() {
  const inProgress = 1
  
  return <>
    {inProgress && <WorkInProgressPage /> }
    {!inProgress && <HomeClient />}
  </>
}
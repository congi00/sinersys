import { Metadata } from "next";
import HomeClient from "./HomeClient"; // sposta tutto il codice attuale qui
import { getTranslations } from "next-intl/server";


export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("homepage");

  return {
    title: "Sinersys - New Energy Frontiers",
    description: t("slide0.title"),
  };
}

export default function Page() {
  return <HomeClient />;
}
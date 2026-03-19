"use client";

import { useTranslations } from "next-intl";
import LegalPage, { P, UL, LI, Strong } from "../components/LegalPage";

export default function CookiePage() {
  const t = useTranslations("cookies");

  const sections = [
    {
      heading: t("s1.heading"),
      body: (
        <>
          <P>{t("s1.p1")}</P>
          <P>{t("s1.p2")}</P>
        </>
      ),
    },
    {
      heading: t("s2.heading"),
      body: (
        <>
          <P>{t("s2.p1")}</P>
          <UL>
            <LI>
              <Strong>{t("s2.c1.title")}</Strong> — {t("s2.c1.body")}
            </LI>
            <LI>
              <Strong>{t("s2.c2.title")}</Strong> — {t("s2.c2.body")}
            </LI>
            <LI>
              <Strong>{t("s2.c3.title")}</Strong> — {t("s2.c3.body")}
            </LI>
            <LI>
              <Strong>{t("s2.c4.title")}</Strong> — {t("s2.c4.body")}
            </LI>
          </UL>
        </>
      ),
    },
    {
      heading: t("s3.heading"),
      body: (
        <>
          <P>{t("s3.p1")}</P>
          <UL>
            <LI><Strong>Google Analytics</Strong> — {t("s3.ga")}</LI>
            <LI><Strong>Google Tag Manager</Strong> — {t("s3.gtm")}</LI>
          </UL>
          <P>{t("s3.p2")}</P>
        </>
      ),
    },
    {
      heading: t("s4.heading"),
      body: (
        <>
          <P>{t("s4.p1")}</P>
          <UL>
            <LI>{t("s4.l1")}</LI>
            <LI>{t("s4.l2")}</LI>
            <LI>{t("s4.l3")}</LI>
            <LI>{t("s4.l4")}</LI>
          </UL>
        </>
      ),
    },
    {
      heading: t("s5.heading"),
      body: (
        <>
          <P>{t("s5.p1")}</P>
          <P>{t("s5.p2")}</P>
        </>
      ),
    },
    {
      heading: t("s6.heading"),
      body: (
        <>
          <P>{t("s6.p1")}</P>
          <P>{t("s6.p2")}</P>
        </>
      ),
    },
  ];

  return (
    <LegalPage
      label={t("label")}
      title={t("title")}
      subtitle={t("subtitle")}
      updated={t("updated")}
      sections={sections}
      accent="#0f4c81"
    />
  );
}
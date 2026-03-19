"use client";

import { useTranslations } from "next-intl";
import LegalPage, { P, UL, LI, Strong } from "../components/LegalPage";

export default function EthicsPage() {
  const t = useTranslations("ethics");

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
            <LI><Strong>{t("s2.v1.title")}</Strong> — {t("s2.v1.body")}</LI>
            <LI><Strong>{t("s2.v2.title")}</Strong> — {t("s2.v2.body")}</LI>
            <LI><Strong>{t("s2.v3.title")}</Strong> — {t("s2.v3.body")}</LI>
            <LI><Strong>{t("s2.v4.title")}</Strong> — {t("s2.v4.body")}</LI>
            <LI><Strong>{t("s2.v5.title")}</Strong> — {t("s2.v5.body")}</LI>
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
            <LI>{t("s3.l1")}</LI>
            <LI>{t("s3.l2")}</LI>
            <LI>{t("s3.l3")}</LI>
            <LI>{t("s3.l4")}</LI>
          </UL>
        </>
      ),
    },
    {
      heading: t("s4.heading"),
      body: (
        <>
          <P>{t("s4.p1")}</P>
          <P>{t("s4.p2")}</P>
        </>
      ),
    },
    {
      heading: t("s5.heading"),
      body: (
        <>
          <P>{t("s5.p1")}</P>
          <UL>
            <LI>{t("s5.l1")}</LI>
            <LI>{t("s5.l2")}</LI>
            <LI>{t("s5.l3")}</LI>
            <LI>{t("s5.l4")}</LI>
          </UL>
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
    {
      heading: t("s7.heading"),
      body: (
        <>
          <P>{t("s7.p1")}</P>
          <UL>
            <LI>{t("s7.l1")}</LI>
            <LI>{t("s7.l2")}</LI>
            <LI>{t("s7.l3")}</LI>
          </UL>
        </>
      ),
    },
    {
      heading: t("s8.heading"),
      body: <P>{t("s8.p1")}</P>,
    },
  ];

  return (
    <LegalPage
      label={t("label")}
      title={t("title")}
      subtitle={t("subtitle")}
      updated={t("updated")}
      sections={sections}
      accent="#2a52c9"
    />
  );
}
"use client";

import { useTranslations } from "next-intl";
import LegalPage, { P, UL, LI, Strong } from "../components/LegalPage";

export default function PrivacyPage() {
  const t = useTranslations("privacy");

  const sections = [
    {
      heading: t("s1.heading"),
      body: (
        <>
          <P>{t("s1.p1")}</P>
          <P><Strong>{t("s1.controller")}</Strong>{t("s1.controllerVal")}</P>
          <P><Strong>{t("s1.address")}</Strong>{t("s1.addressVal")}</P>
          <P><Strong>{t("s1.email")}</Strong>{t("s1.emailVal")}</P>
        </>
      ),
    },
    {
      heading: t("s2.heading"),
      body: (
        <>
          <P>{t("s2.p1")}</P>
          <UL>
            <LI><Strong>{t("s2.d1.title")}</Strong> — {t("s2.d1.body")}</LI>
            <LI><Strong>{t("s2.d2.title")}</Strong> — {t("s2.d2.body")}</LI>
            <LI><Strong>{t("s2.d3.title")}</Strong> — {t("s2.d3.body")}</LI>
            <LI><Strong>{t("s2.d4.title")}</Strong> — {t("s2.d4.body")}</LI>
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
            <LI>{t("s3.l5")}</LI>
          </UL>
        </>
      ),
    },
    {
      heading: t("s4.heading"),
      body: (
        <>
          <P>{t("s4.p1")}</P>
          <UL>
            <LI><Strong>{t("s4.b1.title")}</Strong> — {t("s4.b1.body")}</LI>
            <LI><Strong>{t("s4.b2.title")}</Strong> — {t("s4.b2.body")}</LI>
            <LI><Strong>{t("s4.b3.title")}</Strong> — {t("s4.b3.body")}</LI>
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
          <UL>
            <LI><Strong>{t("s6.r1.title")}</Strong> — {t("s6.r1.body")}</LI>
            <LI><Strong>{t("s6.r2.title")}</Strong> — {t("s6.r2.body")}</LI>
            <LI><Strong>{t("s6.r3.title")}</Strong> — {t("s6.r3.body")}</LI>
            <LI><Strong>{t("s6.r4.title")}</Strong> — {t("s6.r4.body")}</LI>
            <LI><Strong>{t("s6.r5.title")}</Strong> — {t("s6.r5.body")}</LI>
          </UL>
          <P>{t("s6.contact")}</P>
        </>
      ),
    },
    {
      heading: t("s7.heading"),
      body: (
        <>
          <P>{t("s7.p1")}</P>
          <P>{t("s7.p2")}</P>
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
      accent="#1c398e"
    />
  );
}
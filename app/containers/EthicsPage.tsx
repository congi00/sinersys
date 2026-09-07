"use client";

import { useTranslations } from "next-intl";
import LegalPage, { P, UL, LI } from "../components/LegalPage";

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
            <LI>{t("s2.l1")}</LI>
            <LI>{t("s2.l2")}</LI>
          </UL>
        </>
      ),
    },
    {
      heading: t("s3.heading"),
      body: (
        <>
          <P>{t("s3.p1")}</P>
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
          </UL>
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
          </UL>
        </>
      ),
    },
    {
      heading: t("s6.heading"),
      body: (
        <>
          <P>{t("s6.p1")}</P>
          <UL>
            <LI>{t("s6.l1")}</LI>
            <LI>{t("s6.l2")}</LI>
          </UL>
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
          </UL>
        </>
      ),
    },
    {
      heading: t("s8.heading"),
      body: (
        <>
          <P>{t("s8.p1")}</P>
          <UL>
            <LI>{t("s8.l1")}</LI>
            <LI>{t("s8.l2")}</LI>
          </UL>
        </>
      ),
    },
    {
      heading: t("s9.heading"),
      body: (
        <>
          <P>{t("s9.p1")}</P>
          <UL>
            <LI>{t("s9.l1")}</LI>
            <LI>{t("s9.l2")}</LI>
          </UL>
        </>
      ),
    },
    {
      heading: t("s10.heading"),
      body: (
        <>
          <P>{t("s10.p1")}</P>
          <UL>
            <LI>{t("s10.l1")}</LI>
            <LI>{t("s10.l2")}</LI>
          </UL>
        </>
      ),
    },
    {
      heading: t("s11.heading"),
      body: (
        <>
          <P>{t("s11.p1")}</P>
          <P>{t("s11.p2")}</P>
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
      accent="#2a52c9"
    />
  );
}
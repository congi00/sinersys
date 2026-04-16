"use client";

import React, { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  Variants,
} from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 80 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, staggerChildren: 0.12 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function GlowLink({ href, children }: { href: string; children: React.ReactNode }) {
  const isExternal = href.startsWith("http") || href.startsWith("mailto") || href.startsWith("tel");
  const props = isExternal
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};

  return (
    <motion.a
      href={href}
      {...props}
      className="block relative text-[#f4f7fa]/80 mb-2 transition-colors"
      whileHover={{
        color: "#f4f7fa",
        textShadow: "0px 0px 8px rgba(255,255,255,0.8), 0px 0px 20px rgba(99,102,241,0.6)",
      }}
      whileTap={{ scale: 0.96 }}
    >
      {children}
    </motion.a>
  );
}

export default function Footer() {
  const t   = useTranslations("footer");
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: "-100px" });

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const glowOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 0.6, 0.3]);

  // Quick links — label + href from translations
  const quickLinks = [
    { label: t("quick.home"),    href: "/" },
    { label: t("quick.apwec"),   href: "/apwec" },
    { label: t("quick.about"),   href: "/about-us" },
    { label: t("quick.certs"),   href: "/certificazioni" },
    { label: t("quick.faq"),     href: "/#faq" },
  ];

  const otherLinks = [
    { label: t("other.gallery"),  href: "/galleria" },
    { label: t("other.ethics"),   href: "/codice-etico" },
    { label: t("other.privacy"),  href: "/privacy" },
    { label: t("other.cookies"),  href: "/cookie-policy" },
  ];

  const contactLinks = [
    { label: t("contact.email"),   href: `mailto:${t("contact.emailVal")}` },
    { label: t("contact.address"), href: `https://maps.google.com/?q=${encodeURIComponent(t("contact.addressVal"))}` },
    { label: t("contact.phone"),   href: `tel:${t("contact.phoneVal")}` },
    { label: t("contact.web"),     href: `https://${t("contact.webVal")}` },
  ];

  return (
    <footer ref={ref} className="relative overflow-hidden pt-28 pb-12 text-[#f4f7fa]">

      {/* Background */}
      <motion.div className="absolute inset-0" style={{background:"linear-gradient(160deg, rgb(28, 57, 142) 10%, rgb(0 86 191) 40%, rgb(5, 11, 38) 100%)",}} />

      {/* Glow */}
      <motion.div
        style={{ opacity: glowOpacity }}
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full blur-[180px]"
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="relative max-w-6xl mx-auto px-6"
      >
        {/* Logo */}
        <motion.div variants={itemVariants} className="text-center mb-16">
          <div className="flex justify-center mb-2">
            <Image src="/full-logo-sinersys.png" alt="Sinersys Logo" width={260} height={80} priority />
          </div>
          <motion.h2 variants={itemVariants} className="text-l font-semibold tracking-widest">
            NEW ENERGY FRONTIERS
          </motion.h2>
        </motion.div>

        {/* Card */}
        <motion.div
          variants={itemVariants}
          className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 border border-white/20 shadow-2xl"
        >
          <div className="grid md:grid-cols-3 gap-12">

            {/* Quick Links */}
            <div>
              <h3 className="font-bold mb-4 text-lg">{t("quick.title")}</h3>
              {quickLinks.map((link, i) => (
                <GlowLink key={i} href={link.href}>{link.label}</GlowLink>
              ))}
            </div>

            {/* Other Links */}
            <div>
              <h3 className="font-bold mb-4 text-lg">{t("other.title")}</h3>
              {otherLinks.map((link, i) => (
                <GlowLink key={i} href={link.href}>{link.label}</GlowLink>
              ))}
            </div>

            {/* Contatti */}
            <div>
              <h3 className="font-bold mb-4 text-lg">{t("contact.title")}</h3>
              {contactLinks.map((link, i) => (
                <GlowLink key={i} href={link.href}>{link.label}</GlowLink>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Bottom bar */}
        <motion.div
          variants={itemVariants}
          className="flex justify-between items-center mt-16 text-sm opacity-80 border-t border-white/20 pt-6"
        >
          <p>{t("legal.company")}</p>
          <div className="flex gap-6">
            <GlowLink href="/privacy">{t("legal.privacy")}</GlowLink>
            <GlowLink href="/cookie-policy">{t("legal.cookies")}</GlowLink>
            <GlowLink href="/codice-etico">{t("legal.ethics")}</GlowLink>
          </div>
        </motion.div>
      </motion.div>
    </footer>
  );
}
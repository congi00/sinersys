"use client";

import { AlignCenter, ChevronDown } from "@deemlol/next-icons";
import {
  setMenuVisibility,
  setNavigationState,
  setOpenContact,
} from "../features/counterSlice";
import { useAppDispatch, useAppSelector } from "../hooks";
import clsx from "clsx";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import Link from "next/link";
import LanguageSwitcher from "./LanguageSwitcher";
import { motion, MotionValue } from "framer-motion";
import { useRef } from "react";
import SocialSwitcher from "./SocialSwitcher";

interface Props {
  menuTheme?: MotionValue<number>;
  hiddenMenu?: MotionValue<number>
}

export default function MenuButton({ menuTheme, hiddenMenu }: Props) {
  const menuVisibility  = useAppSelector((state) => state.siteState.menuVisible);
  const navigationState = useAppSelector((state) => state.siteState.navigationState);
  const dispatch        = useAppDispatch();
  const menuVoices      = useTranslations("menu");
  const [hidden, setHidden] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const items = ["homepage", "products", "motor" , "about", "contacts"];
  const links = ["/", "apwec", "/six-phase-motor" , "about-us", ""];
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("navState");
    if (saved !== null) {
      dispatch(setNavigationState(Number(saved)));
    }
  }, [dispatch]);

  useEffect(() => {
    if (!menuTheme) return;
    // Read initial value
    setIsDark(menuTheme.get() < 0.5);
    // Subscribe to changes
    const unsubscribe = menuTheme.on("change", (v) => {
      setIsDark(v < 0.5);
    });
    return unsubscribe;
  }, [menuTheme]);

  useEffect(() => {
    if (!hiddenMenu) return;
    // Read initial value
    setHidden(hiddenMenu.get() < 0.5);
    // Subscribe to changes
    const unsubscribe = hiddenMenu.on("change", (v) => {
      setHidden(v < 0.5);
    });
    return unsubscribe;
  }, [hiddenMenu]);
  
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!menuVisibility) return;
  
      const el = menuRef.current;
      if (!el) return;
  
      if (!el.contains(e.target as Node)) {
        dispatch(setMenuVisibility(false));
      }
    };
  
    document.addEventListener("pointerdown", handleClickOutside);
    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
    };
  }, [menuVisibility, dispatch]);

  return (
    !hidden && <div
      ref={menuRef}
      className={clsx(
        "fixed bottom-4 left-1/2 -translate-x-1/2 z-50 overflow-visible", // overflow-visible so dropdown isn't clipped
        "p-4 pt-8",
        "flex flex-col items-center justify-center",
        "bg-[#F4F7FA]/20 backdrop-blur-xl backdrop-saturate-150",
        "items-center",
        "transition-all duration-700 ease-[cubic-bezier(.22,1,.36,1)] ease-[cubic-bezier(.16,1,.3,1)]",
        "after:absolute after:inset-0",
        "after:rounded-3xl",
        "after:pointer-events-none",
        !menuVisibility &&
          "min-h-[70px] min-w-[70px] max-h-[70px] max-w-[70px] mb-6 rounded-[999px]",
        menuVisibility &&
          "min-h-[340px] md:min-w-[550px] max-h-[380px] min-w-[350px] mb-6 bg-[#1A2127]/20 rounded-[28px]"
      )}
      style={{
        background:           "rgba(255, 255, 255, 0.18)",
        backdropFilter:       "blur(32px) saturate(180%)",
        WebkitBackdropFilter: "blur(32px) saturate(180%)",
        border:               "1px solid rgba(255,255,255,0.22)",
        boxShadow:            "0 8px 40px rgba(12,24,70,0.35), inset 0 1px 0 rgba(255,255,255,0.18)",
      }}
    >
      {/* ── Expanded content ──────────────────────────────────────────── */}
      <div
        className={clsx(
          "relative z-10 flex flex-col gap-4 mt-6 w-full items-center mb-20 text-sm/6",
          "transition-all duration-700 ease-[cubic-bezier(.22,1,.36,1)]",
          menuVisibility
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-6 pointer-events-none"
        )}
      >
        {/* Logo */}
        <div
          className={clsx(
            "flex flex-col items-center w-full",
            "transition-all duration-700 ease-[cubic-bezier(.22,1,.36,1)] mb-2",
            menuVisibility
              ? "opacity-100 translate-y-0 delay-[400ms]"
              : "opacity-0 translate-y-6"
          )}
        >
         {isDark && <img
            src="/full-logo-sinersys.png"
            alt="Logo Sinersys Full"
            className="h-12 object-contain"
          />}
          {!isDark && <img
            src="/full-logo-sinersys_blu.png"
            alt="Logo Sinersys Full"
            className="h-12 object-contain"
          />}
          <motion.h4 className="text-xs tracking-widest" style={{color: isDark ? "#F4F7FA" : "#1c398e"}}>
            NEW ENERGY FRONTIERS
          </motion.h4>
        </div>

        {/* Nav items */}
        <div className="flex flex-col items-center w-full gap-1">
          {items.map((item, index, array) => {
            const reverseIndex = array.length - 1 - index;
            return (
              <Link key={item} href={links[index]}>
                <motion.span
                  className={clsx(
                    "text-lg cursor-pointer",
                    "transition-[opacity,transform] duration-700 ease-[cubic-bezier(.22,1,.36,1)]",
                    "transition-[font-weight] duration-200",
                    menuVisibility
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-6",
                    index === navigationState ? "font-extrabold" : "font-light"
                  )}
                  style={{
                    transitionDelay: menuVisibility
                      ? `${reverseIndex * 120}ms`
                      : "0ms",
                    color: isDark ? "#F4F7FA" : "#1c398e"
                  }}
                  onClick={() => {
                    dispatch(setNavigationState(index));
                    localStorage.setItem("navState", String(index));

                    dispatch(setMenuVisibility(!menuVisibility));
                    if (item === "contacts") dispatch(setOpenContact(true));
                  }}
                >
                  {menuVoices(item)}
                </motion.span>
              </Link>
            );
          })}
        </div>

        {/* ── Language switcher ──────────────────────────────────────── */}
        {/*
          overflow-visible on the parent container is required so the dropdown
          (which opens upward) is not clipped by the menu card.
        */}
        <div className="flex mb-4">
          <div
            className={clsx(
              "transition-all duration-700 ease-[cubic-bezier(.22,1,.36,1)]",
              menuVisibility
                ? "opacity-100 translate-y-0 delay-[200ms]"
                : "opacity-0 translate-y-4"
            )}
            // Stop click from toggling the menu when interacting with the switcher
            onClick={(e) => e.stopPropagation()}
          >
            <LanguageSwitcher isDark={isDark} />
          </div>
          <div
            className={clsx(
              "transition-all duration-700 ease-[cubic-bezier(.22,1,.36,1)]",
              "ml-12",
              menuVisibility
                ? "opacity-100 translate-y-0 delay-[200ms]"
                : "opacity-0 translate-y-4"
            )}
            // Stop click from toggling the menu when interacting with the switcher
            onClick={(e) => e.stopPropagation()}
          >
            <SocialSwitcher isDark={isDark} />
          </div>
        </div>
      </div>

      {/* ── Toggle icon ───────────────────────────────────────────────── */}
      <div className={clsx("z-10", "absolute bottom-4 left-1/2 -translate-x-1/2")}>
        {!menuVisibility && (
          <AlignCenter
            size="40px"
            color={isDark ? "#F4F7FA" : "#1c398e"}
            className="cursor-pointer mt-1"
            onClick={() => dispatch(setMenuVisibility(!menuVisibility))}
          />
        )}
        {menuVisibility && (
          <ChevronDown
            size="40px"
            color={isDark ? "#F4F7FA" : "#1c398e"}
            className="cursor-pointer"
            onClick={() => dispatch(setMenuVisibility(!menuVisibility))}
          />
        )}
      </div>
    </div>
  );
}

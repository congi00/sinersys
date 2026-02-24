"use client";

import { AlignCenter, ChevronDown } from "@deemlol/next-icons";
import {
  setMenuVisibility,
  setNavigationState,
} from "../features/counterSlice";
import { useAppDispatch, useAppSelector } from "../hooks";
import clsx from "clsx";
import {useTranslations} from 'next-intl';

export default function MenuButton() {
  const menuVisibility = useAppSelector((state) => state.siteState.menuVisible);
  const navigationState = useAppSelector(
    (state) => state.siteState.navigationState
  );
  const dispatch = useAppDispatch();
  const menuVoices = useTranslations('menu');
  const items = [
    'homepage',
    'products',
    'about',
    'contacts'
  ];

  return (
    <div
      className={clsx(
        "fixed bottom-4 left-1/2 -translate-x-1/2 z-50 overflow-hidden",
        "p-4",
        "pt-8",
        "flex flex-col items-center justify-center",
        "bg-[#F4F7FA]/20 backdrop-blur-xl backdrop-saturate-150",
        "border border-[#F4F7FA]/30",
        "shadow-[12px_12px_32px_rgba(0,0,0,0.18)]",
        "items-center",
        "transition-all duration-700 ease-[cubic-bezier(.22,1,.36,1)] ease-[cubic-bezier(.16,1,.3,1)]",
        "after:absolute after:inset-0",
        "after:rounded-3xl",
        "after:border after:border-white/20",
        "after:pointer-events-none",
        "before:absolute before:inset-0",
        "before:bg-[linear-gradient(135deg,rgba(255,255,255,0.45)_0%,rgba(255,255,255,0.15)_10%,rgba(255,255,255,0)_20%)]",
        "before:pointer-events-none",
        !menuVisibility &&
          "min-h-[70px] min-w-[70px] max-h-[70px] max-w-[70px] mb-6 rounded-[999px]",
        menuVisibility &&
          "min-h-[280px] md:min-w-[550px] max-h-[320px] min-w-[350px] mb-6 bg-[#1A2127]/20 rounded-[28px]"
      )}
    >
      <div
        className={clsx(
          "relative z-10 flex flex-col gap-6 mt-6 w-full items-center mb-20 text-sm/6",
          "transition-all duration-700 ease-[cubic-bezier(.22,1,.36,1)]",
          menuVisibility
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-6 pointer-events-none"
        )}
      >
        <div
          className={clsx(
            "flex flex-col items-center w-full ",
            "transition-all duration-700 ease-[cubic-bezier(.22,1,.36,1)] mb-2",
            menuVisibility
              ? "opacity-100 translate-y-0 delay-[400ms]"
              : "opacity-0 translate-y-6"
          )}
        >
          <img
            src="/full-logo-sinersys.png"
            alt="Logo Sinersys Full"
            className="h-12 object-contain"
          />
          <h4 className="text-white text-xs tracking-widest">
            NEW ENERGY FRONTIERS
          </h4>
        </div>

        {/* Menu items */}
        <div className="flex flex-col items-center w-full gap-1 mb-4">
          {items.map((item, index, array) => {
            const reverseIndex = array.length - 1 - index;

            return (
              <span
                key={item}
                className={clsx(
                  "text-white text-xl",
                  "cursor-pointer",
                  "transition-[opacity,transform] duration-700 ease-[cubic-bezier(.22,1,.36,1)]",
                  "transition-[font-weight] duration-200",
                  menuVisibility
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-6",
                  index === navigationState ? "font-bold" : "font-light"
                )}
                style={{
                  transitionDelay: menuVisibility
                    ? `${reverseIndex * 120}ms`
                    : "0ms",
                }}
                onClick={() => {
                    dispatch(setNavigationState(index))
                    dispatch(setMenuVisibility(!menuVisibility))
                }}
              >
                {menuVoices(item)}
              </span>
            );
          })}
        </div>
      </div>
      <div
        className={clsx("z-10", "absolute bottom-4 left-1/2 -translate-x-1/2")}
      >
        {!menuVisibility && (
          <AlignCenter
            size="40px"
            color="#F4F7FA"
            className="cursor-pointer mt-1"
            onClick={() => dispatch(setMenuVisibility(!menuVisibility))}
          />
        )}
        {menuVisibility && (
          <ChevronDown
            size="40px"
            color="#F4F7FA"
            className="cursor-pointer"
            onClick={() => dispatch(setMenuVisibility(!menuVisibility))}
          />
        )}
      </div>
    </div>
  );
}

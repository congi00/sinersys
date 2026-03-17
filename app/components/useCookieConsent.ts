"use client";

import { useState, useEffect, useCallback } from "react";

export type CookieCategory = "necessary" | "analytics" | "marketing" | "preferences";

export interface CookieConsent {
  necessary:   boolean;
  analytics:   boolean;
  marketing:   boolean;
  preferences: boolean;
  timestamp:   number;
  version:     string;
}

export type ConsentStatus = "pending" | "accepted" | "rejected" | "custom";

const STORAGE_KEY    = "sinersys_cookie_consent";
const POLICY_VERSION = "1.0.0";

const DEFAULT_CONSENT: CookieConsent = {
  necessary:   true,
  analytics:   false,
  marketing:   false,
  preferences: false,
  timestamp:   0,
  version:     POLICY_VERSION,
};

function loadFromStorage(): CookieConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: CookieConsent = JSON.parse(raw);
    if (parsed.version !== POLICY_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveToStorage(consent: CookieConsent) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
  } catch { /* storage full / blocked */ }
}

function deriveStatus(c: CookieConsent): ConsentStatus {
  if (c.analytics && c.marketing && c.preferences) return "accepted";
  if (!c.analytics && !c.marketing && !c.preferences) return "rejected";
  return "custom";
}

export function useCookieConsent() {
  const [consent,     setConsentState]  = useState<CookieConsent>(DEFAULT_CONSENT);
  const [status,      setStatus]        = useState<ConsentStatus>("pending");
  const [showBanner,  setShowBanner]    = useState(false);
  const [showDetails, setShowDetails]   = useState(false);

  useEffect(() => {
    const saved = loadFromStorage();
    if (saved && saved.timestamp > 0) {
      setConsentState(saved);
      setStatus(deriveStatus(saved));
      setShowBanner(false);
    } else {
      setShowBanner(true);
    }
  }, []);

  const acceptAll = useCallback(() => {
    const u: CookieConsent = { necessary: true, analytics: true, marketing: true, preferences: true, timestamp: Date.now(), version: POLICY_VERSION };
    setConsentState(u); setStatus("accepted"); saveToStorage(u);
    setShowBanner(false); setShowDetails(false);
  }, []);

  const rejectAll = useCallback(() => {
    const u: CookieConsent = { ...DEFAULT_CONSENT, timestamp: Date.now(), version: POLICY_VERSION };
    setConsentState(u); setStatus("rejected"); saveToStorage(u);
    setShowBanner(false); setShowDetails(false);
  }, []);

  const saveCustom = useCallback((custom: Partial<Pick<CookieConsent, "analytics" | "marketing" | "preferences">>) => {
    const u: CookieConsent = {
      necessary: true,
      analytics:   custom.analytics   ?? consent.analytics,
      marketing:   custom.marketing   ?? consent.marketing,
      preferences: custom.preferences ?? consent.preferences,
      timestamp: Date.now(),
      version:   POLICY_VERSION,
    };
    setConsentState(u); setStatus(deriveStatus(u)); saveToStorage(u);
    setShowBanner(false); setShowDetails(false);
  }, [consent]);

  const resetConsent = useCallback(() => {
    if (typeof window !== "undefined") localStorage.removeItem(STORAGE_KEY);
    setConsentState(DEFAULT_CONSENT); setStatus("pending"); setShowBanner(true);
  }, []);

  return {
    consent, status,
    showBanner, showDetails,
    acceptAll, rejectAll, saveCustom, resetConsent,
    openDetails:  () => setShowDetails(true),
    closeDetails: () => setShowDetails(false),
  };
}
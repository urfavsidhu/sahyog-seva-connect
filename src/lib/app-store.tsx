import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Role } from "./types";

export type Lang = "en" | "hi";

const dict: Record<string, { en: string; hi: string }> = {
  home: { en: "Home", hi: "होम" },
  search: { en: "Search", hi: "खोजें" },
  bookings: { en: "Bookings", hi: "बुकिंग" },
  chat: { en: "Chat", hi: "चैट" },
  profile: { en: "Profile", hi: "प्रोफ़ाइल" },
  dashboard: { en: "Dashboard", hi: "डैशबोर्ड" },
  requests: { en: "Requests", hi: "अनुरोध" },
  earnings: { en: "Earnings", hi: "कमाई" },
  calendar: { en: "Calendar", hi: "कैलेंडर" },
  reviews: { en: "Reviews", hi: "समीक्षाएँ" },
  notifications: { en: "Notifications", hi: "सूचनाएँ" },
  bookNow: { en: "Book Now", hi: "अभी बुक करें" },
  findHelp: { en: "What do you need help with?", hi: "आपको किस चीज़ में मदद चाहिए?" },
  urgent: { en: "Urgent", hi: "तत्काल" },
  askSahyog: { en: "Ask Sahyog", hi: "सहयोग से पूछें" },
};

interface Store {
  role: Role;
  setRole: (r: Role) => void;
  lang: Lang;
  setLang: (l: Lang) => void;
  toggleLang: () => void;
  t: (key: keyof typeof dict | string) => string;
  unread: number;
  markAllRead: () => void;
}

const AppStoreContext = createContext<Store | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>("customer");
  const [lang, setLangState] = useState<Lang>("en");
  const [unread, setUnread] = useState(2);

  useEffect(() => {
    const r = localStorage.getItem("ss.role") as Role | null;
    const l = localStorage.getItem("ss.lang") as Lang | null;
    if (r) setRoleState(r);
    if (l) setLangState(l);
  }, []);

  const setRole = useCallback((r: Role) => {
    setRoleState(r);
    localStorage.setItem("ss.role", r);
  }, []);
  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem("ss.lang", l);
  }, []);

  const value = useMemo<Store>(
    () => ({
      role,
      setRole,
      lang,
      setLang,
      toggleLang: () => setLang(lang === "en" ? "hi" : "en"),
      t: (key: string) => dict[key]?.[lang] ?? key,
      unread,
      markAllRead: () => setUnread(0),
    }),
    [role, lang, unread, setRole, setLang],
  );

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppStoreContext);
  if (!ctx) throw new Error("useApp must be used inside AppStoreProvider");
  return ctx;
}

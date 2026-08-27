import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Role } from "./types";
import { LOCATIONS, findLocation, type LocationOption } from "./locations";

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
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  location: LocationOption;
  setLocation: (l: LocationOption) => void;
}

const AppStoreContext = createContext<Store | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>("customer");
  const [lang, setLangState] = useState<Lang>("en");
  const [unread, setUnread] = useState(2);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [location, setLocationState] = useState<LocationOption>(
    findLocation("baner") ?? { id: "baner", name: "Baner", nameHi: "बानेर", lat: 18.559, lng: 73.7868 },
  );

  useEffect(() => {
    const r = localStorage.getItem("ss.role") as Role | null;
    const l = localStorage.getItem("ss.lang") as Lang | null;
    const a = localStorage.getItem("ss.auth");
    const locId = localStorage.getItem("ss.locationId");
    const locName = localStorage.getItem("ss.locationName");
    const locLat = localStorage.getItem("ss.locationLat");
    const locLng = localStorage.getItem("ss.locationLng");
    if (r) setRoleState(r);
    if (l) setLangState(l);
    if (a === "1") setIsAuthenticated(true);
    if (locId && locName && locLat && locLng) {
      setLocationState({
        id: locId,
        name: locName,
        nameHi: locName,
        lat: Number(locLat),
        lng: Number(locLng),
      });
    }
  }, []);

  const setRole = useCallback((r: Role) => {
    setRoleState(r);
    localStorage.setItem("ss.role", r);
  }, []);
  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem("ss.lang", l);
  }, []);
  const login = useCallback(() => {
    setIsAuthenticated(true);
    localStorage.setItem("ss.auth", "1");
  }, []);
  const logout = useCallback(() => {
    setIsAuthenticated(false);
    localStorage.removeItem("ss.auth");
    localStorage.removeItem("ss.role");
    setRoleState("customer");
  }, []);
  const setLocation = useCallback((l: LocationOption) => {
    setLocationState(l);
    localStorage.setItem("ss.locationId", l.id);
    localStorage.setItem("ss.locationName", l.name);
    localStorage.setItem("ss.locationLat", String(l.lat));
    localStorage.setItem("ss.locationLng", String(l.lng));
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
      isAuthenticated,
      login,
      logout,
      location,
      setLocation,
    }),
    [role, lang, unread, isAuthenticated, setRole, setLang, login, logout, location, setLocation],
  );

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppStoreContext);
  if (!ctx) throw new Error("useApp must be used inside AppStoreProvider");
  return ctx;
}

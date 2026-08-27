import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Role } from "./types";
import { LOCATIONS, findLocation, type LocationOption } from "./locations";
import { getToken, setToken as persistToken, clearToken } from "@/api/client";

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

/** Shape of the `user` object returned by /auth/login and /auth/signup. */
export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

const USER_KEY = "ss.user";

interface Store {
  /** Always derived from the logged-in user — never settable directly. */
  role: Role;
  lang: Lang;
  setLang: (l: Lang) => void;
  toggleLang: () => void;
  t: (key: keyof typeof dict | string) => string;
  unread: number;
  markAllRead: () => void;
  isAuthenticated: boolean;
  user: CurrentUser | null;
  /** Called once with the real token + user returned by login/signup. */
  login: (token: string, user: CurrentUser) => void;
  logout: () => void;
  location: LocationOption;
  setLocation: (l: LocationOption) => void;
}

const AppStoreContext = createContext<Store | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [lang, setLangState] = useState<Lang>("en");
  const [unread, setUnread] = useState(2);
  const [location, setLocationState] = useState<LocationOption>(
    findLocation("baner") ?? { id: "baner", name: "Baner", nameHi: "बानेर", lat: 18.559, lng: 73.7868 },
  );

  useEffect(() => {
    const l = localStorage.getItem("ss.lang") as Lang | null;
    const locId = localStorage.getItem("ss.locationId");
    const locName = localStorage.getItem("ss.locationName");
    const locLat = localStorage.getItem("ss.locationLat");
    const locLng = localStorage.getItem("ss.locationLng");
    if (l) setLangState(l);
    if (locId && locName && locLat && locLng) {
      setLocationState({
        id: locId,
        name: locName,
        nameHi: locName,
        lat: Number(locLat),
        lng: Number(locLng),
      });
    }

    // Restore session: only trust a stored user if we still have a token.
    const token = getToken();
    const storedUser = localStorage.getItem(USER_KEY);
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser) as CurrentUser);
      } catch {
        clearToken();
        localStorage.removeItem(USER_KEY);
      }
    } else {
      clearToken();
      localStorage.removeItem(USER_KEY);
    }
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem("ss.lang", l);
  }, []);

  const login = useCallback((token: string, nextUser: CurrentUser) => {
    persistToken(token);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    localStorage.removeItem(USER_KEY);
    setUser(null);
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
      role: user?.role ?? "customer",
      lang,
      setLang,
      toggleLang: () => setLang(lang === "en" ? "hi" : "en"),
      t: (key: string) => dict[key]?.[lang] ?? key,
      unread,
      markAllRead: () => setUnread(0),
      isAuthenticated: !!user,
      user,
      login,
      logout,
      location,
      setLocation,
    }),
    [user, lang, unread, login, logout, location, setLang, setLocation],
  );

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppStoreContext);
  if (!ctx) throw new Error("useApp must be used inside AppStoreProvider");
  return ctx;
}

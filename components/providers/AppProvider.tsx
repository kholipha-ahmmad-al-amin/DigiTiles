"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  GlobalRole,
  Locale,
  Notification,
  Organization,
  OrganizationMembership,
  User,
} from "@/lib/types";

interface DemoAccountSummary {
  id: string;
  fullName: string;
  phone: string;
  roles: GlobalRole[];
  activeRole: GlobalRole;
}

interface AppContextValue {
  locale: Locale;
  setLocale: (loc: Locale) => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
  user: User | null;
  organizationContext: {
    organization: Organization;
    membership: OrganizationMembership;
  } | null;
  notifications: Notification[];
  demoAccounts: DemoAccountSummary[];
  loadingSession: boolean;
  refreshSession: () => Promise<void>;
  quickSwitchPersona: (demoUserId: string, targetRole?: GlobalRole) => Promise<void>;
  switchRole: (
    targetRole: GlobalRole,
    organizationTradeName?: string,
    primaryDistrict?: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  markNotificationsRead: (notificationId?: string) => Promise<void>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

function applyTheme(theme: "light" | "dark") {
  const root = document.documentElement;
  root.classList.add("theme-changing");
  root.classList.toggle("dark", theme === "dark");
  // Resolve the new palette before restoring interaction transitions.
  void root.offsetHeight;
  root.classList.remove("theme-changing");
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("bn");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [user, setUser] = useState<User | null>(null);
  const [organizationContext, setOrganizationContext] = useState<{
    organization: Organization;
    membership: OrganizationMembership;
  } | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [demoAccounts, setDemoAccounts] = useState<DemoAccountSummary[]>([]);
  const [loadingSession, setLoadingSession] = useState<boolean>(true);

  const setLocale = useCallback((loc: Locale) => {
    setLocaleState(loc);
    try {
      localStorage.setItem("digitiles_locale", loc);
    } catch {
      // ignore storage errors
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      try {
        localStorage.setItem("digitiles_theme", next);
      } catch {
        // ignore
      }
      applyTheme(next);
      return next;
    });
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session", { cache: "no-store" });
      const json = await res.json();
      if (json.ok && json.data) {
        setUser(json.data.user || null);
        setOrganizationContext(json.data.organizationContext || null);
        setNotifications(json.data.notifications || []);
        setDemoAccounts(json.data.demoAccounts || []);
      }
    } catch {
      // ignore network error during boot
    } finally {
      setLoadingSession(false);
    }
  }, []);

  useEffect(() => {
    try {
      const savedLocale = localStorage.getItem("digitiles_locale") as Locale | null;
      if (savedLocale === "bn" || savedLocale === "en") {
        setLocaleState(savedLocale);
      }
      const savedTheme = localStorage.getItem("digitiles_theme") as
        | "light"
        | "dark"
        | null;
      if (savedTheme === "dark" || savedTheme === "light") {
        setTheme(savedTheme);
        applyTheme(savedTheme);
      }
    } catch {
      // ignore
    }
    refreshSession();
  }, [refreshSession]);

  const quickSwitchPersona = useCallback(
    async (demoUserId: string, targetRole?: GlobalRole) => {
      setLoadingSession(true);
      try {
        const res = await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ demoUserId, targetRole }),
        });
        if (res.ok) {
          await refreshSession();
        }
      } finally {
        setLoadingSession(false);
      }
    },
    [refreshSession]
  );

  const switchRole = useCallback(
    async (
      targetRole: GlobalRole,
      organizationTradeName?: string,
      primaryDistrict?: string
    ) => {
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetRole,
          organizationTradeName,
          primaryDistrict,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error?.message || "Failed to switch role.");
      }
      await refreshSession();
    },
    [refreshSession]
  );

  const logout = useCallback(async () => {
    await fetch("/api/auth/session", { method: "DELETE" });
    await refreshSession();
  }, [refreshSession]);

  const markNotificationsRead = useCallback(
    async (notificationId?: string) => {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      });
      await refreshSession();
    },
    [refreshSession]
  );

  return (
    <AppContext.Provider
      value={{
        locale,
        setLocale,
        theme,
        toggleTheme,
        user,
        organizationContext,
        notifications,
        demoAccounts,
        loadingSession,
        refreshSession,
        quickSwitchPersona,
        switchRole,
        logout,
        markNotificationsRead,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp must be used inside AppProvider");
  }
  return ctx;
}

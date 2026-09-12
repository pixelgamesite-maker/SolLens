import { useEffect, useState } from "react";

export interface MarketSession {
  isOpen: boolean;
  /** e.g. "14:32:07" in New York */
  nyTime: string;
  /** Human label for what the reference price represents right now */
  referenceLabel: string;
}

function computeSession(): MarketSession {
  const now = new Date();

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    weekday: "short",
  }).formatToParts(now);

  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const hour = Number(get("hour"));
  const minute = Number(get("minute"));
  const weekday = get("weekday");

  const isWeekday = !["Sat", "Sun"].includes(weekday);
  const minutesNow = hour * 60 + minute;
  // Regular session: 09:30–16:00 ET. Does not account for market holidays.
  const isOpen = isWeekday && minutesNow >= 570 && minutesNow < 960;

  return {
    isOpen,
    nyTime: `${get("hour")}:${get("minute")}:${get("second")}`,
    referenceLabel: isOpen ? "live quote" : "last close",
  };
}

export function useMarketSession(): MarketSession {
  const [session, setSession] = useState<MarketSession>(computeSession);

  useEffect(() => {
    const id = setInterval(() => setSession(computeSession()), 1000);
    return () => clearInterval(id);
  }, []);

  return session;
}

import { useEffect, useRef } from "react";
import { notificationsApi } from "../api";

const POLL_MS = 60 * 1000;

export const browserNotificationsSupported = () =>
  typeof window !== "undefined" && "Notification" in window;

/** Asks the browser for permission. Resolves to "granted" | "denied" | "default" | "unsupported". */
export async function requestBrowserPermission() {
  if (!browserNotificationsSupported()) return "unsupported";
  if (Notification.permission !== "default") return Notification.permission;
  return Notification.requestPermission();
}

/**
 * Browser ("push") alerts. While the app is open, checks once a minute for
 * alerts the server has just delivered to this user and shows each one as
 * a desktop notification. Runs only when the user turned on browser alerts
 * and allowed notifications.
 */
export default function useBrowserAlerts(user, onNewAlerts) {
  const enabled = Boolean(
    user?.preferences?.subscribed && user?.preferences?.channels?.browser,
  );
  const since = useRef(new Date().toISOString());
  const callback = useRef(onNewAlerts);
  callback.current = onNewAlerts;

  useEffect(() => {
    if (!enabled) return undefined;
    since.current = new Date().toISOString();

    const check = async () => {
      try {
        const { notifications } = await notificationsApi.list({
          since: since.current,
          sort: "newest",
          limit: 10,
        });
        if (!notifications.length) return;
        since.current = notifications[0].sentAt;

        const permitted =
          browserNotificationsSupported() && Notification.permission === "granted";
        if (permitted) {
          notifications
            .slice(0, 3)
            .reverse()
            .forEach((item) => {
              const shown = new Notification(item.title, {
                body: [item.source, item.category].filter(Boolean).join(" · "),
                icon: "/favicon.svg",
                tag: item.url,
              });
              shown.onclick = () => {
                window.focus();
                if (/^https?:\/\//.test(item.url || "")) window.open(item.url, "_blank", "noopener");
              };
            });
        }
        callback.current?.(notifications);
      } catch {
        /* network blips are fine: the next check catches up */
      }
    };

    const timer = window.setInterval(check, POLL_MS);
    return () => window.clearInterval(timer);
  }, [enabled]);
}

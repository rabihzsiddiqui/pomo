"use client";

import { useCallback } from "react";

export function useNotifications() {
  const requestPermission = useCallback(async () => {
    if (typeof Notification === "undefined") return;
    if (Notification.permission === "default") {
      await Notification.requestPermission();
    }
  }, []);

  const notify = useCallback((title: string, body?: string) => {
    if (typeof Notification === "undefined") return;
    if (Notification.permission !== "granted") return;
    try {
      new Notification(title, { body, silent: true });
    } catch {
      // mobile browsers require ServiceWorkerRegistration.showNotification()
      // — degrade silently
    }
  }, []);

  return { requestPermission, notify };
}

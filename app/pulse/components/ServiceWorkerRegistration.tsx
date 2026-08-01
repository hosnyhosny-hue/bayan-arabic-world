"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";

    async function configureServiceWorker() {
      if (isLocalhost || process.env.NODE_ENV !== "production") {
        const registrations =
          await navigator.serviceWorker.getRegistrations();

        await Promise.all(
          registrations.map((registration) =>
            registration.unregister()
          )
        );

        const cacheKeys = await caches.keys();

        await Promise.all(
          cacheKeys
            .filter((key) => key.startsWith("bayan-pulse"))
            .map((key) => caches.delete(key))
        );

        return;
      }

      await navigator.serviceWorker.register("/bayan-sw.js");
    }

    configureServiceWorker().catch((error) => {
      console.warn("[BAYAN Service Worker]", error);
    });
  }, []);

  return null;
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { firebaseAuth } from "@/src/lib/firebase-client";

export default function AdminLogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      await signOut(firebaseAuth).catch(() => undefined);

      router.replace("/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      className="admin-logout-button"
      onClick={logout}
      disabled={loading}
    >
      {loading ? "جارٍ الخروج…" : "تسجيل الخروج"}
    </button>
  );
}

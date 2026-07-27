"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  browserLocalPersistence,
  setPersistence,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { firebaseAuth } from "@/src/lib/firebase-client";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState(
    process.env.NEXT_PUBLIC_ADMIN_EMAIL || "",
  );
  const [password, setPassword] = useState("");
  const [checking, setChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function checkSession() {
      try {
        const response = await fetch("/api/auth/me", {
          cache: "no-store",
        });

        if (response.ok) {
          router.replace("/admin");
          return;
        }
      } finally {
        setChecking(false);
      }
    }

    void checkSession();
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await setPersistence(firebaseAuth, browserLocalPersistence);

      const credential = await signInWithEmailAndPassword(
        firebaseAuth,
        email.trim(),
        password,
      );

      const idToken = await credential.user.getIdToken(true);

      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
      });

      const result = (await response.json()) as {
        success?: boolean;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(result.error || "تعذر تسجيل الدخول.");
      }

      router.replace("/admin");
      router.refresh();
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "حدث خطأ غير متوقع.";

      if (
        message.includes("auth/invalid-credential") ||
        message.includes("auth/wrong-password") ||
        message.includes("auth/user-not-found")
      ) {
        setError("البريد الإلكتروني أو كلمة المرور غير صحيحة.");
      } else if (message.includes("auth/too-many-requests")) {
        setError("محاولات كثيرة. انتظر قليلًا ثم أعد المحاولة.");
      } else {
        setError(message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (checking) {
    return (
      <main className="admin-login-shell" dir="rtl">
        <div className="admin-login-card admin-login-loading">
          جارٍ التحقق من الجلسة…
        </div>
      </main>
    );
  }

  return (
    <main className="admin-login-shell" dir="rtl">
      <section className="admin-login-card">
        <div className="admin-login-mark" aria-hidden="true">
          ب
        </div>

        <p className="admin-login-eyebrow">BAYAN Arabic World</p>
        <h1>دخول الإدارة</h1>
        <p className="admin-login-description">
          هذه المنطقة مخصصة لإدارة عالم العربية والمحتوى الداخلي.
        </p>

        <form onSubmit={handleSubmit} className="admin-login-form">
          <label>
            <span>البريد الإلكتروني</span>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label>
            <span>كلمة المرور</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
            />
          </label>

          {error ? (
            <div className="admin-login-error" role="alert">
              {error}
            </div>
          ) : null}

          <button type="submit" disabled={submitting}>
            {submitting ? "جارٍ تسجيل الدخول…" : "دخول آمن"}
          </button>
        </form>

        <a href="/" className="admin-login-home">
          العودة إلى الصفحة الرئيسية
        </a>
      </section>
    </main>
  );
}

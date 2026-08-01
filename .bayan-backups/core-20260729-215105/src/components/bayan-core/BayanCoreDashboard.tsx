"use client";

import { useEffect, useMemo, useState } from "react";

type User = { uid: string; displayName: string; email: string; role: string; status: string };
type Settings = {
  schoolNameAr: string; schoolNameEn: string; defaultLocale: "ar" | "en";
  allowParentComments: boolean; requireCommentModeration: boolean; maxUploadMb: number;
  allowedMediaTypes: string[]; brand: { primary: string; secondary: string; logoUrl?: string };
};

const panel: React.CSSProperties = { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 20, padding: 24, boxShadow: "0 12px 40px rgba(15,23,42,.06)" };
const input: React.CSSProperties = { width: "100%", padding: "12px 14px", border: "1px solid #d1d5db", borderRadius: 12 };

export default function BayanCoreDashboard() {
  const [tab, setTab] = useState<"users" | "media" | "settings">("users");
  const [users, setUsers] = useState<User[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [message, setMessage] = useState("");
  const tabs = useMemo(() => ([
    ["users", "المستخدمون"], ["media", "الوسائط"], ["settings", "الإعدادات"],
  ] as const), []);

  async function load() {
    const [u, s] = await Promise.all([
      fetch("/api/bayan-core/users").then((r) => r.json()),
      fetch("/api/bayan-core/settings").then((r) => r.json()),
    ]);
    if (u.success) setUsers(u.data);
    if (s.success) setSettings(s.data);
  }

  useEffect(() => { void load(); }, []);

  async function upload(form: FormData) {
    setMessage("جارٍ الرفع...");
    const res = await fetch("/api/bayan-core/media", { method: "POST", body: form }).then((r) => r.json());
    setMessage(res.success ? "تم رفع الملف بنجاح" : res.error || "تعذر رفع الملف");
  }

  async function saveSettings() {
    if (!settings) return;
    const res = await fetch("/api/bayan-core/settings", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(settings) }).then((r) => r.json());
    setMessage(res.success ? "تم حفظ الإعدادات" : res.error || "تعذر الحفظ");
  }

  return (
    <main dir="rtl" style={{ minHeight: "100vh", background: "#f7f8fa", padding: "36px", color: "#111827" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <header style={{ marginBottom: 24 }}>
          <p style={{ color: "#0f6b4f", fontWeight: 800, margin: 0 }}>BAYAN PLATFORM</p>
          <h1 style={{ fontSize: 38, margin: "8px 0" }}>BAYAN Core</h1>
          <p style={{ color: "#6b7280" }}>إدارة المستخدمين والصلاحيات والوسائط والإعدادات من مكان واحد.</p>
        </header>

        <nav style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
          {tabs.map(([key, label]) => <button key={key} onClick={() => setTab(key)} style={{ border: 0, borderRadius: 999, padding: "11px 18px", cursor: "pointer", background: tab === key ? "#0f6b4f" : "#fff", color: tab === key ? "#fff" : "#374151", fontWeight: 800 }}>{label}</button>)}
        </nav>

        {message && <div style={{ marginBottom: 16, background: "#ecfdf5", border: "1px solid #a7f3d0", padding: 14, borderRadius: 12 }}>{message}</div>}

        {tab === "users" && <section style={panel}>
          <h2>المستخدمون</h2>
          <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr>{["الاسم", "البريد", "الدور", "الحالة"].map((h) => <th key={h} style={{ textAlign: "right", padding: 12, borderBottom: "1px solid #e5e7eb" }}>{h}</th>)}</tr></thead>
            <tbody>{users.map((u) => <tr key={u.uid}><td style={{ padding: 12 }}>{u.displayName}</td><td style={{ padding: 12 }}>{u.email}</td><td style={{ padding: 12 }}>{u.role}</td><td style={{ padding: 12 }}>{u.status}</td></tr>)}</tbody>
          </table></div>
        </section>}

        {tab === "media" && <section style={panel}>
          <h2>مركز الوسائط</h2>
          <form onSubmit={(e) => { e.preventDefault(); void upload(new FormData(e.currentTarget)); }} style={{ display: "grid", gap: 14, maxWidth: 560 }}>
            <input style={input} name="file" type="file" required />
            <select style={input} name="visibility" defaultValue="school"><option value="public">عام</option><option value="school">المدرسة</option><option value="class">الصف</option><option value="private">خاص</option></select>
            <button style={{ border: 0, borderRadius: 12, padding: 13, background: "#f28c28", color: "white", fontWeight: 800, cursor: "pointer" }}>رفع الملف</button>
          </form>
        </section>}

        {tab === "settings" && settings && <section style={panel}>
          <h2>إعدادات المنصة</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 14 }}>
            <label>اسم المدرسة بالعربية<input style={input} value={settings.schoolNameAr} onChange={(e) => setSettings({ ...settings, schoolNameAr: e.target.value })} /></label>
            <label>School name<input style={input} value={settings.schoolNameEn} onChange={(e) => setSettings({ ...settings, schoolNameEn: e.target.value })} /></label>
            <label>الحد الأقصى للرفع (MB)<input style={input} type="number" value={settings.maxUploadMb} onChange={(e) => setSettings({ ...settings, maxUploadMb: Number(e.target.value) })} /></label>
            <label>اللون الأساسي<input style={input} value={settings.brand.primary} onChange={(e) => setSettings({ ...settings, brand: { ...settings.brand, primary: e.target.value } })} /></label>
          </div>
          <div style={{ marginTop: 18, display: "grid", gap: 10 }}>
            <label><input type="checkbox" checked={settings.allowParentComments} onChange={(e) => setSettings({ ...settings, allowParentComments: e.target.checked })} /> السماح بتعليقات أولياء الأمور</label>
            <label><input type="checkbox" checked={settings.requireCommentModeration} onChange={(e) => setSettings({ ...settings, requireCommentModeration: e.target.checked })} /> مراجعة التعليقات قبل النشر</label>
          </div>
          <button onClick={() => void saveSettings()} style={{ marginTop: 20, border: 0, borderRadius: 12, padding: "13px 22px", background: "#0f6b4f", color: "white", fontWeight: 800, cursor: "pointer" }}>حفظ الإعدادات</button>
        </section>}
      </div>
    </main>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  ["الرئيسية", "/admin"],
  ["أقسام الصفحة الرئيسية", "/admin/cms/homepage"],
  ["الصفحات", "/admin/cms/pages"],
  ["الأخبار", "/admin/cms/news"],
  ["الفعاليات", "/admin/cms/events"],
  ["مركز الوسائط", "/admin/cms/media"],
  ["الإعدادات", "/admin/cms/settings"],
];

export default function AdminNavigation() {
  const pathname = usePathname();

  return (
    <aside dir="rtl" className="cms-sidebar">
      <div className="cms-brand">
        <strong>بيان</strong>
        <span>نظام إدارة المحتوى</span>
      </div>

      <nav>
        {links.map(([label, href]) => (
          <Link
            key={href}
            href={href}
            className={pathname === href ? "active" : ""}
          >
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

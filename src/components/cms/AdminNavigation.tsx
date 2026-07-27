"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  FileText,
  FolderOpen,
  Gauge,
  History,
  Images,
  LayoutGrid,
  Newspaper,
  Settings,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";

const links = [
  {
    label: "لوحة القيادة",
    href: "/admin/cms/dashboard",
    icon: Gauge,
  },
  {
    label: "الصفحة الرئيسية",
    href: "/admin/cms/homepage",
    icon: LayoutGrid,
  },
  {
    label: "الصفحات",
    href: "/admin/cms/pages",
    icon: FileText,
  },
  {
    label: "الأخبار",
    href: "/admin/cms/news",
    icon: Newspaper,
  },
  {
    label: "الفعاليات",
    href: "/admin/cms/events",
    icon: CalendarDays,
  },
  {
    label: "مركز الوسائط",
    href: "/admin/cms/media",
    icon: Images,
  },
  {
    label: "فريق القسم",
    href: "/admin/cms/team",
    icon: Users,
  },
  {
    label: "الطلاب المتميزون",
    href: "/admin/cms/students",
    icon: Trophy,
  },
  {
    label: "المجلات الرقمية",
    href: "/admin/cms/magazines",
    icon: Sparkles,
  },
  {
    label: "المصادر والملفات",
    href: "/admin/cms/resources",
    icon: FolderOpen,
  },
  {
    label: "سجل النشاط",
    href: "/admin/cms/activity",
    icon: History,
  },
  {
    label: "الإعدادات",
    href: "/admin/cms/settings",
    icon: Settings,
  },
];

export default function AdminNavigation() {
  const pathname = usePathname();

  return (
    <aside dir="rtl" className="cms-sidebar">
      <div className="cms-brand">
        <div className="cms-brand-mark">ب</div>

        <div>
          <strong>بيان</strong>
          <span>نظام إدارة المحتوى</span>
        </div>
      </div>

      <nav>
        {links.map(({ label, href, icon: Icon }) => {
          const active =
            pathname === href ||
            (href !== "/admin/cms/dashboard" &&
              pathname.startsWith(`${href}/`));

          return (
            <Link
              key={href}
              href={href}
              className={active ? "active" : ""}
            >
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

import type { PulseControlPermission } from "./types";

export type PulseNavigationItem = {
  id: string;
  label: string;
  href: string;
  icon: string;
  permission?: PulseControlPermission;
};

export const pulseControlNavigation: PulseNavigationItem[] = [
  { id:"overview", label:"مركز القيادة", href:"/admin/pulse-control-center", icon:"⌂", permission:"dashboard.view" },
  { id:"newsroom", label:"غرفة الأخبار", href:"/admin/pulse-cms", icon:"✎", permission:"content.view" },
  { id:"stories", label:"Stories Studio", href:"/admin/pulse-control-center/stories", icon:"◉", permission:"stories.manage" },
  { id:"edition", label:"إصدار اليوم", href:"/admin/pulse-control-center/edition", icon:"▤", permission:"edition.manage" },
  { id:"hero", label:"Hero Manager", href:"/admin/pulse-control-center/hero", icon:"◫", permission:"hero.manage" },
  { id:"channels", label:"القنوات", href:"/admin/pulse-control-center/channels", icon:"◎", permission:"channels.manage" },
  { id:"events", label:"الفعاليات", href:"/admin/pulse-control-center/events", icon:"◷", permission:"events.manage" },
  { id:"achievements", label:"الإنجازات", href:"/admin/pulse-control-center/achievements", icon:"★", permission:"achievements.manage" },
  { id:"arabic-bee", label:"Arabic Bee", href:"/admin/pulse-control-center/arabic-bee", icon:"ض", permission:"arabic-bee.manage" },
  { id:"media", label:"مكتبة الوسائط", href:"/admin/pulse-control-center/media", icon:"▧", permission:"media.manage" },
  { id:"analytics", label:"التحليلات", href:"/admin/pulse-control-center/analytics", icon:"⌁", permission:"analytics.view" },
  { id:"users", label:"المستخدمون والصلاحيات", href:"/admin/pulse-control-center/users", icon:"♙", permission:"users.manage" },
  { id:"audit", label:"سجل العمليات", href:"/admin/pulse-control-center/audit", icon:"≡", permission:"audit.view" },
  { id:"settings", label:"الإعدادات", href:"/admin/pulse-control-center/settings", icon:"⚙", permission:"settings.manage" }
];

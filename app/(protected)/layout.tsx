import type { ReactNode } from "react";
import { requireAdmin } from "@/src/lib/admin-auth";
import AdminLogoutButton from "@/src/components/AdminLogoutButton";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const admin = await requireAdmin();

  return (
    <>
      <div className="admin-session-bar" dir="rtl">
        <div>
          <strong>وضع الإدارة</strong>
          <span>{admin.email}</span>
        </div>

        <AdminLogoutButton />
      </div>

      {children}
    </>
  );
}

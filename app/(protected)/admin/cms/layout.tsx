import AdminNavigation from "@/src/components/cms/AdminNavigation";
import "./cms.css";

export default function CmsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div dir="rtl" className="bayan-cms-shell">
      <AdminNavigation />

      <section className="bayan-cms-main">
        {children}
      </section>
    </div>
  );
}

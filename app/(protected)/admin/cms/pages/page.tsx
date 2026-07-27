import CmsManager from "@/src/components/cms/CmsManager";
import { CMS_COLLECTIONS } from "@/src/lib/cms/collections";

export default function PagesAdmin() {
  return (
    <CmsManager
      title="إدارة الصفحات"
      description="أنشئ صفحات الموقع وعدّلها وانشرها دون فتح ملفات البرمجة."
      collection={CMS_COLLECTIONS.pages}
    />
  );
}

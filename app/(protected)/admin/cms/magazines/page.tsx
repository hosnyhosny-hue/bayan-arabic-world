import CmsManager from "@/src/components/cms/CmsManager";
import { CMS_COLLECTIONS } from "@/src/lib/cms/collections";

export default function Page() {
  return (
    <CmsManager
      title="إدارة المجلات الرقمية"
      description="أضف المجلات والنشرات واربط ملفات PDF وأغلفتها."
      collection={CMS_COLLECTIONS.magazines}
    />
  );
}

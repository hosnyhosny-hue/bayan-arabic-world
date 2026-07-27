import CmsManager from "@/src/components/cms/CmsManager";
import { CMS_COLLECTIONS } from "@/src/lib/cms/collections";

export default function EventsAdmin() {
  return (
    <CmsManager
      title="إدارة الفعاليات"
      description="أنشئ الفعاليات والمسابقات والمناسبات المدرسية."
      collection={CMS_COLLECTIONS.events}
    />
  );
}

import CmsManager from "@/src/components/cms/CmsManager";
import { CMS_COLLECTIONS } from "@/src/lib/cms/collections";

export default function NewsAdmin() {
  return (
    <CmsManager
      title="إدارة الأخبار"
      description="أضف الأخبار والإعلانات والمسودات وجدول محتوى القسم."
      collection={CMS_COLLECTIONS.news}
    />
  );
}

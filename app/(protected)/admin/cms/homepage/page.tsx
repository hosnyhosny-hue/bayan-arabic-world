import CmsManager from "@/src/components/cms/CmsManager";
import { CMS_COLLECTIONS } from "@/src/lib/cms/collections";

export default function HomepageAdmin() {
  return (
    <CmsManager
      title="أقسام الصفحة الرئيسية"
      description="أدر العناوين والأقسام وترتيب ظهور محتوى الصفحة الرئيسية."
      collection={CMS_COLLECTIONS.homepage}
      allowSlug={false}
    />
  );
}

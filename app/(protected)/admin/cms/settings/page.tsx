import CmsManager from "@/src/components/cms/CmsManager";
import { CMS_COLLECTIONS } from "@/src/lib/cms/collections";

export default function SettingsAdmin() {
  return (
    <CmsManager
      title="إعدادات الموقع"
      description="إدارة اسم الموقع والشعار ومعلومات التواصل والإعدادات العامة."
      collection={CMS_COLLECTIONS.settings}
      allowSlug={false}
    />
  );
}

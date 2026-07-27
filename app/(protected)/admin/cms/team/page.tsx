import CmsManager from "@/src/components/cms/CmsManager";
import { CMS_COLLECTIONS } from "@/src/lib/cms/collections";

export default function Page() {
  return (
    <CmsManager
      title="إدارة فريق القسم"
      description="أضف أعضاء فريق اللغة العربية وصورهم ومسمياتهم الوظيفية."
      collection={CMS_COLLECTIONS.team}
    />
  );
}

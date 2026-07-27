import CmsManager from "@/src/components/cms/CmsManager";
import { CMS_COLLECTIONS } from "@/src/lib/cms/collections";

export default function Page() {
  return (
    <CmsManager
      title="الطلاب المتميزون"
      description="أضف إنجازات الطلاب وشهاداتهم وصور التكريم."
      collection={CMS_COLLECTIONS.students}
    />
  );
}

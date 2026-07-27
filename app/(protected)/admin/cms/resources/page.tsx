import CmsManager from "@/src/components/cms/CmsManager";
import { CMS_COLLECTIONS } from "@/src/lib/cms/collections";

export default function Page() {
  return (
    <CmsManager
      title="المصادر والملفات التعليمية"
      description="نظّم الكتب والعروض وأوراق العمل والروابط التعليمية."
      collection={CMS_COLLECTIONS.resources}
    />
  );
}

import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function MagazineDetailRedirect({
  params,
}: PageProps) {
  const { id } = await params;
  redirect(`/pulse/${encodeURIComponent(id)}`);
}

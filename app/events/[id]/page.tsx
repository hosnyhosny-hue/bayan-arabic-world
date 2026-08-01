import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EventDetailRedirect({
  params,
}: PageProps) {
  const { id } = await params;
  redirect(`/pulse/${encodeURIComponent(id)}`);
}

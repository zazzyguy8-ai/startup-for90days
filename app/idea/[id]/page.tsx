import IdeaClient from "@/components/report/IdeaClient";

export default async function IdeaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <IdeaClient id={id} />;
}

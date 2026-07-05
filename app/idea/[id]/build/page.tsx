import BuildClient from "@/components/build/BuildClient";

export default async function BuildPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BuildClient id={id} />;
}

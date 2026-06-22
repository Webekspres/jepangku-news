import { redirect } from "next/navigation";

type Props = { params: Promise<{ id: string }> };

export default async function LegacyPollAnalyticsRedirect({ params }: Props) {
  const { id } = await params;
  redirect(`/admin/polls/${id}/analytics`);
}

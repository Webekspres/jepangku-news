import { redirect } from "next/navigation";

type Props = { params: Promise<{ id: string }> };

export default async function LegacyQuizAnalyticsRedirect({ params }: Props) {
  const { id } = await params;
  redirect(`/admin/quizzes/${id}/analytics`);
}

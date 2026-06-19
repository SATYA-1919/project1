import { SessionJourney } from "@/components/analytics/SessionJourney";

export const dynamic = "force-dynamic";
export const metadata = { title: "Session journey" };

export default async function SessionJourneyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <SessionJourney sessionId={id} />
    </main>
  );
}

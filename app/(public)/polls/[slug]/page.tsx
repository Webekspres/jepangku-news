"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ArrowLeft, BarChart3, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function PollDetailPage() {
  const { slug } = useParams<{ slug: string }>()!;
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [poll, setPoll] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    fetch(`/api/polls/${slug}`)
      .then((r) => {
        if (!r.ok) {
          router.push("/polls");
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (d) setPoll(d);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const handleVote = async (optionId: string) => {
    if (!user) {
      toast.error("Please login to vote");
      router.push("/login");
      return;
    }
    setVoting(true);
    try {
      await fetch(`/api/polls/${slug}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ option_id: optionId }),
      }).then((r) => {
        if (!r.ok)
          return r.json().then((e) => {
            throw new Error(e.error);
          });
        return r.json();
      });
      toast.success("+5 points for voting!");
      refreshUser();
      const updated = await fetch(`/api/polls/${slug}`).then((r) => r.json());
      setPoll(updated);
    } catch (e: any) {
      toast.error(e.message || "Failed to vote");
    } finally {
      setVoting(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-jepang-muted">
          Loading...
        </p>
      </div>
    );
  if (!poll) return null;

  const totalVotes =
    poll.options?.reduce(
      (sum: number, o: any) => sum + (o.voteCount || 0),
      0,
    ) || 0;

  return (
    <div className="bg-white min-h-screen" data-testid="poll-detail-page">
      <div className="px-4 mx-auto max-w-7xl py-12">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/polls"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-jepang-muted hover:text-jepang-red mb-6"
            data-testid="back-to-polls"
          >
            <ArrowLeft size={14} /> Back to Polls
          </Link>
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant={poll.pollType === "VOTING" ? "red" : "black"}>
                {poll.pollType?.toUpperCase()}
              </Badge>
              <Badge className="text-jepang-red border-jepang-red">
                <Award size={10} strokeWidth={1.5} className="mr-1" /> +
                {poll.pointsReward || 5} PTS
              </Badge>
            </div>
            <h1 className="font-heading font-black text-4xl sm:text-5xl tracking-tighter mb-3">
              {poll.title}
            </h1>
            {poll.description && (
              <p className="text-jepang-muted text-lg">{poll.description}</p>
            )}
          </div>

          <Card className="border border-foreground shadow-[4px_4px_0px_0px_#d90429]">
            <CardContent className="p-6">
              <div className="space-y-3">
                {poll.options?.map((option: any, idx: number) => {
                  const pct = option.percentage || 0;
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleVote(option.id)}
                      disabled={voting}
                      className="w-full text-left border border-jepang-border hover:border-foreground transition-colors disabled:opacity-50 overflow-hidden"
                      data-testid={`poll-option-${idx}`}
                    >
                      <div className="relative p-4">
                        <Progress
                          value={Math.round(pct)}
                          className="absolute inset-0 h-full opacity-15"
                        />
                        <div className="relative space-y-4">
                          {option.imageUrl ? (
                            <div className="relative h-48 overflow-hidden  bg-jepang-off-white">
                              <Image
                                src={option.imageUrl}
                                alt={option.optionText}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : null}
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <span className="font-mono font-bold text-jepang-muted">
                                {String.fromCharCode(65 + idx)}
                              </span>
                              <span className="font-semibold">
                                {option.optionText}
                              </span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-xs font-mono text-jepang-muted">
                                {option.voteCount || 0} votes
                              </span>
                              <span className="text-xl font-mono font-black text-jepang-red">
                                {Math.round(pct)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="mt-6 pt-4 border-t border-jepang-border flex items-center justify-between text-xs font-mono uppercase tracking-wider">
                <span className="flex items-center gap-2 text-jepang-muted">
                  <BarChart3 size={12} strokeWidth={1.5} /> {totalVotes} TOTAL
                  VOTES
                </span>
                {!user && (
                  <Link href="/login" className="text-jepang-red font-bold">
                    LOGIN TO VOTE & EARN POINTS
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

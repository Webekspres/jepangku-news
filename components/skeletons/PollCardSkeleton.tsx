import { Card, CardContent } from "@/components/ui/card";

export default function PollCardSkeleton() {
  return (
    <Card className="h-full border border-jepang-border animate-pulse bg-white">
      <CardContent className="space-y-4 p-6">
        <div className="h-6 w-32 bg-jepang-red/10" />
        <div className="h-8 w-1/2 bg-jepang-red/10" />
        <div className="space-y-3">
          <div className="h-4 bg-jepang-red/10" />
          <div className="h-4 bg-jepang-red/10" />
          <div className="h-4 bg-jepang-red/10" />
        </div>
        <div className="space-y-3">
          <div className="h-12 bg-jepang-red/10" />
          <div className="h-12 bg-jepang-red/10" />
          <div className="h-12 bg-jepang-red/10" />
        </div>
        <div className="h-4 w-24 bg-jepang-red/10 mt-2" />
      </CardContent>
    </Card>
  );
}

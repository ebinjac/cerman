
import { TeamSubmissionStatus } from "@/src/components/TeamSubmissionStatus";
import { Suspense } from "react";

export default function Page({ searchParams }: { searchParams: { team: string } }) {
  return (
    <div className="container mx-auto p-4">
      <Suspense fallback={<div>Loading...</div>}>
        <TeamSubmissionStatus teamName={decodeURIComponent(searchParams.team)} />
      </Suspense>
    </div>
  );
}
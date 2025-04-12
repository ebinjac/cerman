import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function TeamSubmissionStatus({ teamName }: { teamName: string }) {
  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Submission Received</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-lg">
            Thank you for submitting <strong>{teamName}</strong>!
          </p>
          <p className="text-muted-foreground">
            Your request is pending admin approval. You'll receive notification
            once approved.
          </p>
        </div>
        <Button asChild>
          <Link href="/">Return to Dashboard</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
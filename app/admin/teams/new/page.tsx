import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { NewTeamForm } from "./new-team-form";

export default function NewTeamPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Link href="/admin/teams">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Teams
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Add New Team</h1>
        <p className="text-muted-foreground">Create a new team and configure their settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Information</CardTitle>
        </CardHeader>
        <CardContent>
          <NewTeamForm />
        </CardContent>
      </Card>
    </div>
  );
} 
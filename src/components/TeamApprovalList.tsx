'use client'
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getPendingTeams, approveTeam } from "../app/actions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function TeamApprovalList() {
  const [teams, setTeams] = useState<any[]>([]);
  
  useEffect(() => {
    const loadTeams = async () => {
      const result = await getPendingTeams();
      setTeams(result);
    };
    loadTeams();
  }, []);

  const handleApprove = async (teamId: string) => {
    await approveTeam(teamId);
    setTeams(teams.filter(t => t.id !== teamId));
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Pending Team Approvals</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {teams.map((team) => (
          <div key={team.id} className="flex justify-between items-center p-4 border rounded">
            <div>
              <h3 className="font-medium">{team.teamName}</h3>
              <p className="text-sm text-muted-foreground">
                Created by {team.createdBy}
              </p>
            </div>
            <Button onClick={() => handleApprove(team.id)}>
              Approve
            </Button>
          </div>
        ))}
        {teams.length === 0 && (
          <p className="text-center text-muted-foreground">No pending approvals</p>
        )}
      </CardContent>
    </Card>
  );
}
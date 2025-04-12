import { Button } from "@/components/ui/button";
import Link from "next/link";


interface TeamsListProps {
  teams: {
    id: string;
    teamName: string;
  }[];
}

export function TeamsList({ teams }: TeamsListProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">Registered Teams</h3>
      {teams.map((team) => (
        <div key={team.id}>
          <Link href={`/teams/${team.id}/dashboard`}>
            <Button variant="link" className="text-md">
              {team.teamName}
            </Button>
          </Link>
        </div>
      ))}
    </div>
  );
}
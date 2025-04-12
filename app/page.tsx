import { redirect } from "next/navigation";
import { getAllTeams } from "@/src/app/actions";

export default async function HomePage() {
  const teams = await getAllTeams();
  
  if (teams.length === 0) {
    throw new Error("No teams found - please create a team first");
  }

  redirect(`/teams/${teams[0].id}/dashboard`);
}

import { getDb } from "@/db/server";
import { teamsTable, certificatesTable, serviceIds } from "@/db/schema";
import { count } from "drizzle-orm";
import { AdminDashboard } from "./dashboard";

async function getStats() {
  const db = await getDb();
  
  const [totalTeams, totalCerts, totalServiceIds] = await Promise.all([
    db.select({ count: count() }).from(teamsTable),
    db.select({ count: count() }).from(certificatesTable),
    db.select({ count: count() }).from(serviceIds),
  ]);

  return {
    teams: totalTeams[0].count,
    certificates: totalCerts[0].count,
    serviceIds: totalServiceIds[0].count,
  };
}

export default async function AdminPage() {
  const stats = await getStats();
  
  return <AdminDashboard initialStats={stats} />;
}
import { AdminDashboard } from "@/src/components/AdminDashboard";
import { AdminTeamManagement } from "@/src/components/AdminTeamManagement";

export default function AdminPage() {
  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <AdminDashboard />
      <div className="pt-8">
        <h2 className="text-2xl font-bold mb-4">Team Management</h2>
        <AdminTeamManagement />
      </div>
    </div>
  );
}
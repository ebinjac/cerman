'use client'
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getDashboardStats, getRecentActivities } from "../app/actions";
import dynamic from 'next/dynamic';
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });
import { getRecentTeamRequests } from "../app/actions";

export function AdminDashboard() {
  const [stats, setStats] = useState({ total: 0, pending: 0, rejected: 0 });
  const [activities, setActivities] = useState<any[]>([]);
  const [recentRequests, setRecentRequests] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const [statsData, activitiesData, requestsData] = await Promise.all([
        getDashboardStats(),
        getRecentActivities(),
        getRecentTeamRequests()
      ]);
      setStats(statsData);
      setActivities(activitiesData);
      setRecentRequests(requestsData);
    };
    loadData();
  }, []);

  const chartOptions = {
    chart: { type: 'area' as const },
    xaxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'] },
    colors: ['#3b82f6']
  };

  const chartSeries = [{
    name: 'Requests',
    data: [30, 40, 35, 50, 49, 60, 70]
  }];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard title="Total Teams" value={stats.total} trend="+12%" />
        <SummaryCard title="Pending Requests" value={stats.pending} variant="warning" />
        <SummaryCard title="Rejected Requests" value={stats.rejected} variant="danger" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Request Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <Chart
            options={chartOptions}
            series={chartSeries}
            type="area"
            height={350}
          />
        </CardContent>
      </Card>

      // Update the dashboard render
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentRequestsTable data={recentRequests} />
        <NotificationsPanel activities={activities} />
      </div>
    </div>
  );
}

function SummaryCard({ title, value, variant = 'default', trend }: any) {
  const variants = {
    default: 'bg-blue-100 text-blue-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800'
  };

  return (
    <Card className={variants[variant as keyof typeof variants]}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        {trend && <span className="text-sm">{trend} from last month</span>}
      </CardContent>
    </Card>
  );
}

// Update RecentRequestsTable to accept data
function RecentRequestsTable({ data }: { data: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Team Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((request) => (
              <TableRow key={request.id}>
                <TableCell>{request.teamName}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded ${getStatusStyle(request.status)}`}>
                    {request.status}
                  </span>
                </TableCell>
                <TableCell>
                  {new Date(request.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// Add status style helper
function getStatusStyle(status: string) {
  switch(status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'approved': return 'bg-green-100 text-green-800';
    case 'rejected': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

function NotificationsPanel({ activities }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity: any) => (
          <div key={activity.id} className="flex items-center p-3 border rounded">
            <div className="space-y-1">
              <p className="font-medium">{activity.message}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(activity.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
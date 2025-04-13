"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

interface Stats {
  teams: number;
  certificates: number;
  serviceIds: number;
}

interface AdminDashboardProps {
  initialStats: Stats;
}

export function AdminDashboard({ initialStats }: AdminDashboardProps) {
  const [stats, setStats] = useState<Stats>(initialStats);
  const [isLoading, setIsLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState<'checking' | 'up' | 'down'>('checking');
  const [emailStatus, setEmailStatus] = useState<'checking' | 'up' | 'down'>('checking');

  const checkDatabase = async () => {
    setDbStatus('checking');
    try {
      const response = await fetch('/api/admin/check-db');
      const data = await response.json();
      setDbStatus(data.status);
    } catch (error) {
      setDbStatus('down');
    }
  };

  const checkEmail = async () => {
    setEmailStatus('checking');
    try {
      const response = await fetch('/api/admin/check-email');
      const data = await response.json();
      setEmailStatus(data.status);
    } catch (error) {
      setEmailStatus('down');
    }
  };

  const refreshStats = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/stats');
      const newStats = await response.json();
      setStats(newStats);
    } finally {
      setIsLoading(false);
    }
  };

  // Check services on initial render
  useEffect(() => {
    checkDatabase();
    checkEmail();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Overview of your system</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" onClick={refreshStats} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Stats
          </Button>
          <Link href="/admin/teams/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New Team
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Total Teams</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.teams}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Total Certificates</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">{stats.certificates}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Total Service IDs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">{stats.serviceIds}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Database</span>
                  {dbStatus === 'up' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                  {dbStatus === 'down' && <XCircle className="h-4 w-4 text-red-500" />}
                  {dbStatus === 'checking' && <AlertCircle className="h-4 w-4 text-yellow-500" />}
                </div>
                <Button variant="outline" size="sm" onClick={checkDatabase}>
                  Check Status
                </Button>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Email Service</span>
                  {emailStatus === 'up' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                  {emailStatus === 'down' && <XCircle className="h-4 w-4 text-red-500" />}
                  {emailStatus === 'checking' && <AlertCircle className="h-4 w-4 text-yellow-500" />}
                </div>
                <Button variant="outline" size="sm" onClick={checkEmail}>
                  Check Status
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Link href="/admin/teams" className="block text-primary hover:underline">
                Manage Teams
              </Link>
              <Link href="/admin/notifications" className="block text-primary hover:underline">
                View Notifications
              </Link>
              <Link href="/admin/test-email" className="block text-primary hover:underline">
                Test Email System
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
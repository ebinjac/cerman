"use client"

import { useEffect, useState, use } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { DateRange } from "react-day-picker"
import { addDays, format, isSameMonth, subDays } from "date-fns"
import { 
  CalendarIcon, 
  Download, 
  FileBarChart, 
  FileSpreadsheet, 
  PieChart, 
  TrendingUp, 
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Shield,
  AlertCircle,
  FileText,
  Server
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { CertificateOverviewChart } from "@/src/components/CertificateOverviewChart"
import { CertificateStatusChart } from "@/src/components/CertificateStatusChart"
import { EnvironmentDistributionChart } from "@/src/components/EnvironmentDistributionChart"
import { getTeamReportStats, getCertificateOverviewData, getRecentTeamActivity } from "@/src/app/actions"
import { Bar, BarChart, CartesianGrid, XAxis, Legend, Tooltip, PieChart as RechartsePieChart, Pie, Cell, ResponsiveContainer } from "recharts"

interface PageProps {
  params: Promise<{
    teamId: string
  }>
}

interface Activity {
  id: string
  type: 'certificate' | 'serviceId'
  name: string
  action: 'created' | 'updated' | 'deleted' | 'expired'
  timestamp: Date
}

interface ReportStats {
  totalCertificates: number
  expiringSoon: number
  totalServiceIds: number
  expiringServiceIds: number
  environmentDistribution?: {
    name: string
    value: number
  }[]
  statusDistribution?: {
    name: string
    value: number
  }[]
  complianceScore?: number
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

export default function ReportsPage({ params }: PageProps) {
  const resolvedParams = use(params)
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<ReportStats | null>(null)
  const [chartData, setChartData] = useState<any[]>([])
  const [recentActivity, setRecentActivity] = useState<Activity[]>([])

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const dateRange = date?.from && date?.to ? { from: date.from, to: date.to } : undefined
        const [statsData, overviewData, activityData] = await Promise.all([
          getTeamReportStats(resolvedParams.teamId, dateRange),
          getCertificateOverviewData(resolvedParams.teamId, dateRange),
          getRecentTeamActivity(resolvedParams.teamId)
        ])
        
        setStats(statsData)
        setChartData(overviewData)
        setRecentActivity(activityData.map(activity => ({
          ...activity,
          action: activity.action as Activity['action'],
          timestamp: new Date(activity.timestamp)
        })))
      } catch (error) {
        console.error('Error fetching report data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [resolvedParams.teamId, date])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Generate and analyze reports for certificates and service IDs
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-[300px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} -{" "}
                      {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
          <TabsTrigger value="service-ids">Service IDs</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Certificates
                </CardTitle>
                <FileBarChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalCertificates || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Active certificates in system
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Expiring Soon
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-500">{stats?.expiringSoon || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Expires in next 90 days
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Service IDs
                </CardTitle>
                <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalServiceIds || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.expiringServiceIds || 0} expiring this month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Compliance Score
                </CardTitle>
                <Shield className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">
                  {stats?.complianceScore || 95}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Based on valid certificates
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Certificate Overview</CardTitle>
                <CardDescription>Distribution of certificates and service IDs over time</CardDescription>
              </CardHeader>
              <CardContent>
                <CertificateOverviewChart data={chartData} />
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest certificate and service ID updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center">
                      <Badge 
                        className="mr-2" 
                        variant={
                          activity.action === 'expired' 
                            ? 'destructive' 
                            : activity.action === 'updated' 
                              ? 'secondary' 
                              : 'default'
                        }
                      >
                        {activity.action.charAt(0).toUpperCase() + activity.action.slice(1)}
                      </Badge>
                      <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {activity.type === 'certificate' ? 'Certificate' : 'Service ID'} {activity.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(activity.timestamp, 'PPp')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Certificate Status Distribution</CardTitle>
                <CardDescription>Overview of certificate statuses</CardDescription>
              </CardHeader>
              <CardContent>
                <CertificateStatusChart data={stats?.statusDistribution || []} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Environment Distribution</CardTitle>
                <CardDescription>Certificates by environment</CardDescription>
              </CardHeader>
              <CardContent>
                <EnvironmentDistributionChart data={stats?.environmentDistribution || []} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="certificates" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <CertificateStatusChart data={stats?.statusDistribution || []} />
            <EnvironmentDistributionChart data={stats?.environmentDistribution || []} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Certificate Expiry Timeline</CardTitle>
              <CardDescription>Upcoming certificate expirations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2 p-4 border rounded-lg">
                    <Clock className="h-5 w-5 text-yellow-500" />
                    <div>
                      <p className="text-sm font-medium">30 Days</p>
                      <p className="text-2xl font-bold">{stats?.expiringSoon || 0}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-4 border rounded-lg">
                    <AlertCircle className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="text-sm font-medium">60 Days</p>
                      <p className="text-2xl font-bold">{stats?.expiringSoon || 0}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-4 border rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="text-sm font-medium">90 Days</p>
                      <p className="text-2xl font-bold">{stats?.expiringSoon || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="service-ids" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Service ID Status</CardTitle>
                <CardDescription>Overview of service ID statuses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="text-sm font-medium">Active</p>
                          <p className="text-xs text-muted-foreground">Currently valid</p>
                        </div>
                      </div>
                      <p className="text-2xl font-bold">{stats?.totalServiceIds || 0}</p>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        <div>
                          <p className="text-sm font-medium">Expiring Soon</p>
                          <p className="text-xs text-muted-foreground">Within 30 days</p>
                        </div>
                      </div>
                      <p className="text-2xl font-bold">{stats?.expiringServiceIds || 0}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Service ID Distribution</CardTitle>
                <CardDescription>By environment and application</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="serviceIds" fill="#8884d8" name="Service IDs" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Overview</CardTitle>
                <CardDescription>Current compliance status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Overall Score</p>
                      <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-green-500" />
                        <span className="text-2xl font-bold text-green-500">
                          {stats?.complianceScore || 95}%
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Last Audit</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(), "MMM dd, yyyy")}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="text-sm font-medium">Valid Certificates</p>
                          <p className="text-xs text-muted-foreground">Up to date</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-green-500">
                        {stats?.totalCertificates || 0}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        <div>
                          <p className="text-sm font-medium">Attention Required</p>
                          <p className="text-xs text-muted-foreground">Need review</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-yellow-500">
                        {stats?.expiringSoon || 0}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Compliance Requirements</CardTitle>
                <CardDescription>Key compliance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Server className="h-5 w-5" />
                      <p className="text-sm font-medium">Certificate Management</p>
                    </div>
                    <Badge>Compliant</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      <p className="text-sm font-medium">Documentation</p>
                    </div>
                    <Badge>Compliant</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      <p className="text-sm font-medium">Security Standards</p>
                    </div>
                    <Badge>Compliant</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

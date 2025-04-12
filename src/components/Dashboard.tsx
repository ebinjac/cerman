"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { getAllCertificates, getServiceIds } from "../app/actions"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertTriangle, CheckCircle2, Clock, KeySquare } from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
  Legend
} from "recharts"

interface Certificate {
  id: string
  certificateIdentifier: string
  teamId: string
  commonName: string
  serialNumber: string
  certificateStatus: string
  certificatePurpose: string
  environment: string
  zeroTouch: boolean
  validTo: Date
}

interface ServiceId {
  id: string
  svcid: string
  env: string
  application: string
  lastReset: string | null
  expDate: string
  renewalProcess: string
  status: string
  acknowledgedBy: string | null
  appCustodian: string | null
  updatedAt: Date | null
}

interface DashboardStats {
  totalCerts: number
  totalServiceIds: number
  certsExpiring: {
    in30Days: number
    in60Days: number
    in90Days: number
  }
  serviceIdsExpiring: {
    in30Days: number
    in60Days: number
    in90Days: number
  }
  environmentDistribution: {
    name: string
    certificates: number
    serviceIds: number
  }[]
  statusDistribution: {
    name: string
    value: number
  }[]
  expirationTrends: {
    month: string
    certificates: number
    serviceIds: number
  }[]
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

export function Dashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const [certificates, serviceIds] = await Promise.all([
          getAllCertificates(),
          getServiceIds("all")
        ])

        const today = new Date()
        const thirtyDaysFromNow = new Date(today)
        thirtyDaysFromNow.setDate(today.getDate() + 30)
        const sixtyDaysFromNow = new Date(today)
        sixtyDaysFromNow.setDate(today.getDate() + 60)
        const ninetyDaysFromNow = new Date(today)
        ninetyDaysFromNow.setDate(today.getDate() + 90)

        // Calculate environment distribution
        const envDistribution = ['E1', 'E2', 'E3'].map(env => ({
          name: env,
          certificates: certificates.filter((cert: Certificate) => cert.environment === env).length,
          serviceIds: serviceIds.filter((svc: ServiceId) => svc.env === env).length
        }))

        // Calculate status distribution
        const statusDistribution = [
          { name: 'Active', value: certificates.filter((cert: Certificate) => cert.certificateStatus === 'active').length },
          { name: 'Expired', value: certificates.filter((cert: Certificate) => new Date(cert.validTo) < today).length },
          { name: 'Expiring Soon', value: certificates.filter((cert: Certificate) => {
            const expDate = new Date(cert.validTo)
            return expDate > today && expDate <= thirtyDaysFromNow
          }).length }
        ]

        // Calculate expiration trends (last 6 months)
        const months = Array.from({ length: 6 }, (_, i) => {
          const date = new Date()
          date.setMonth(date.getMonth() - i)
          return format(date, 'MMM yyyy')
        }).reverse()

        const expirationTrends = months.map(month => ({
          month,
          certificates: certificates.filter((cert: Certificate) => {
            const expDate = new Date(cert.validTo)
            return format(expDate, 'MMM yyyy') === month
          }).length,
          serviceIds: serviceIds.filter((svc: ServiceId) => {
            const expDate = new Date(svc.expDate)
            return format(expDate, 'MMM yyyy') === month
          }).length
        }))

        setStats({
          totalCerts: certificates.length,
          totalServiceIds: serviceIds.length,
          certsExpiring: {
            in30Days: certificates.filter((cert: Certificate) => {
              const expDate = new Date(cert.validTo)
              return expDate > today && expDate <= thirtyDaysFromNow
            }).length,
            in60Days: certificates.filter((cert: Certificate) => {
              const expDate = new Date(cert.validTo)
              return expDate > thirtyDaysFromNow && expDate <= sixtyDaysFromNow
            }).length,
            in90Days: certificates.filter((cert: Certificate) => {
              const expDate = new Date(cert.validTo)
              return expDate > sixtyDaysFromNow && expDate <= ninetyDaysFromNow
            }).length
          },
          serviceIdsExpiring: {
            in30Days: serviceIds.filter((svc: ServiceId) => {
              const expDate = new Date(svc.expDate)
              return expDate > today && expDate <= thirtyDaysFromNow
            }).length,
            in60Days: serviceIds.filter((svc: ServiceId) => {
              const expDate = new Date(svc.expDate)
              return expDate > thirtyDaysFromNow && expDate <= sixtyDaysFromNow
            }).length,
            in90Days: serviceIds.filter((svc: ServiceId) => {
              const expDate = new Date(svc.expDate)
              return expDate > sixtyDaysFromNow && expDate <= ninetyDaysFromNow
            }).length
          },
          environmentDistribution: envDistribution,
          statusDistribution,
          expirationTrends
        })
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <p className="text-muted-foreground">Failed to load dashboard statistics</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Certificates</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCerts}</div>
            <p className="text-xs text-muted-foreground">Active certificates</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Service IDs</CardTitle>
            <KeySquare className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalServiceIds}</div>
            <p className="text-xs text-muted-foreground">Active service IDs</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-900/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.certsExpiring.in30Days + stats.serviceIdsExpiring.in30Days}</div>
            <p className="text-xs text-muted-foreground">Items expiring in 30 days</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Renewals</CardTitle>
            <Clock className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.certsExpiring.in60Days + stats.serviceIdsExpiring.in60Days}</div>
            <p className="text-xs text-muted-foreground">Items expiring in 60 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Environment Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.environmentDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="certificates" name="Certificates" fill="#3b82f6" />
                  <Bar dataKey="serviceIds" name="Service IDs" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Certificate Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.statusDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {stats.statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Expiration Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.expirationTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="certificates" name="Certificates" stroke="#3b82f6" />
                <Line type="monotone" dataKey="serviceIds" name="Service IDs" stroke="#10b981" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Certificate Expirations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="destructive">30 Days</Badge>
                  <span className="text-sm text-muted-foreground">Critical certificates</span>
                </div>
                <div className="text-2xl font-bold">{stats.certsExpiring.in30Days}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">60 Days</Badge>
                  <span className="text-sm text-muted-foreground">Upcoming renewals</span>
                </div>
                <div className="text-2xl font-bold">{stats.certsExpiring.in60Days}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">90 Days</Badge>
                  <span className="text-sm text-muted-foreground">Future renewals</span>
                </div>
                <div className="text-2xl font-bold">{stats.certsExpiring.in90Days}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Service ID Expirations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="destructive">30 Days</Badge>
                  <span className="text-sm text-muted-foreground">Critical service IDs</span>
                </div>
                <div className="text-2xl font-bold">{stats.serviceIdsExpiring.in30Days}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">60 Days</Badge>
                  <span className="text-sm text-muted-foreground">Upcoming renewals</span>
                </div>
                <div className="text-2xl font-bold">{stats.serviceIdsExpiring.in60Days}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">90 Days</Badge>
                  <span className="text-sm text-muted-foreground">Future renewals</span>
                </div>
                <div className="text-2xl font-bold">{stats.serviceIdsExpiring.in90Days}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 
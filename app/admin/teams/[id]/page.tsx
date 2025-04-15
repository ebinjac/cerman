import { getDb } from "@/db/server";
import { teamsTable, certificatesTable, serviceIds } from "@/db/schema";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface TeamDetailPageProps {
  params: {
    id: string;
  };
}

export default async function TeamDetailPage({ params }: TeamDetailPageProps) {
  const db = await getDb();
  const team = await db.query.teamsTable.findFirst({
    where: (teams, { eq }) => eq(teams.id, params.id),
  });

  if (!team) {
    notFound();
  }

  const [certificates, serviceIdsList] = await Promise.all([
    db.query.certificatesTable.findMany({
      where: (certificates, { eq }) => eq(certificates.teamId, params.id),
    }),
    db.query.serviceIds.findMany({
      where: (ids, { eq }) => eq(ids.renewingTeamId, params.id),
    }),
  ]);

  const getStatus = (expiryDate: Date) => {
    const today = new Date();
    const daysUntilExpiry = Math.ceil(
      (new Date(expiryDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilExpiry < 0) return { status: "Expired", variant: "destructive" as const };
    if (daysUntilExpiry <= 30) return { status: "Expiring Soon", variant: "secondary" as const };
    return { status: "Valid", variant: "default" as const };
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/teams">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{team.name}</h1>
          <p className="text-muted-foreground">Team Details and Management</p>
        </div>
        <div className="ml-auto flex gap-2">
          <Link href={`/admin/teams/${team.id}/edit`}>
            <Button>
              <Pencil className="mr-2 h-4 w-4" />
              Edit Team
            </Button>
          </Link>
          {!team.deletedAt && (
            <Link href={`/admin/teams/${team.id}/delete`}>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Deactivate Team
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Team Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p>{team.description || "No description provided"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created At</p>
                <p>{format(new Date(team.createdAt), "PPP")}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={team.deletedAt ? "destructive" : "default"}>
                  {team.deletedAt ? "Inactive" : "Active"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alert Contacts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Primary Alert</p>
                <p>{team.alert1 || "Not set"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Secondary Alert</p>
                <p>{team.alert2 || "Not set"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Escalation Contact</p>
                <p>{team.escalation || "Not set"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Certificates</p>
                <p className="text-2xl font-bold">{certificates.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Service IDs</p>
                <p className="text-2xl font-bold">{serviceIdsList.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expiring Soon (≤30 days)</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {[...certificates, ...serviceIdsList].filter(item => {
                    const { status } = getStatus(new Date(item.expDate || item.validTo));
                    return status === "Expiring Soon";
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Certificates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {certificates.slice(0, 5).map((cert) => {
                const { status, variant } = getStatus(new Date(cert.validTo));
                return (
                  <div key={cert.id} className="flex justify-between items-center p-2 border rounded-lg">
                    <div>
                      <p className="font-medium">{cert.commonName}</p>
                      <p className="text-sm text-muted-foreground">
                        Expires: {format(new Date(cert.validTo), "PPP")}
                      </p>
                    </div>
                    <Badge variant={variant}>{status}</Badge>
                  </div>
                );
              })}
              {certificates.length > 5 && (
                <Link href={`/admin/teams/${team.id}/certificates`}>
                  <Button variant="link" className="w-full">
                    View All Certificates
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Service IDs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {serviceIdsList.slice(0, 5).map((svc) => {
                const { status, variant } = getStatus(new Date(svc.expDate));
                return (
                  <div key={svc.id} className="flex justify-between items-center p-2 border rounded-lg">
                    <div>
                      <p className="font-medium">{svc.svcid}</p>
                      <p className="text-sm text-muted-foreground">
                        Expires: {format(new Date(svc.expDate), "PPP")}
                      </p>
                    </div>
                    <Badge variant={variant}>{status}</Badge>
                  </div>
                );
              })}
              {serviceIdsList.length > 5 && (
                <Link href={`/admin/teams/${team.id}/service-ids`}>
                  <Button variant="link" className="w-full">
                    View All Service IDs
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 

"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Team } from "./columns";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";

interface ViewTeamModalProps {
  team: Team | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewTeamModal({
  team,
  open,
  onOpenChange,
}: ViewTeamModalProps) {
  if (!team) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Team Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{team.name}</h3>
                <Badge variant={team.deletedAt ? "destructive" : "default"}>
                  {team.deletedAt ? "Inactive" : "Active"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h4 className="text-sm font-medium mb-4">Alert Contacts</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Primary Alert</p>
                  <p className="font-medium">{team.alert1 || "Not set"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Secondary Alert</p>
                  <p className="font-medium">{team.alert2 || "Not set"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tertiary Alert</p>
                  <p className="font-medium">{team.alert3 || "Not set"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Escalation Contact</p>
                  <p className="font-medium">{team.escalation || "Not set"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h4 className="text-sm font-medium mb-4">Resources</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Service IDs</p>
                  <p className="font-medium">{team.serviceIds}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Certificates</p>
                  <p className="font-medium">{team.certificates}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h4 className="text-sm font-medium mb-4">Timeline</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Created At</p>
                  <p className="font-medium">
                    {format(new Date(team.createdAt), "PPP")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="font-medium">
                    {format(new Date(team.updatedAt), "PPP")}
                  </p>
                </div>
                {team.deletedAt && (
                  <div>
                    <p className="text-sm text-muted-foreground">Deactivated At</p>
                    <p className="font-medium">
                      {format(new Date(team.deletedAt), "PPP")}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
} 
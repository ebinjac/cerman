"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Team } from "./columns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateTeam } from "./actions";

interface EditTeamModalProps {
  team: Team | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditTeamModal({
  team,
  open,
  onOpenChange,
  onSuccess,
}: EditTeamModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: team?.name || "",
    alert1: team?.alert1 || "",
    alert2: team?.alert2 || "",
    escalation: team?.escalation || "",
  });

  if (!team) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await updateTeam(team.id, formData);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update team:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Team</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Team Name
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="alert1" className="text-right">
              Primary Alert
            </Label>
            <Input
              id="alert1"
              value={formData.alert1}
              onChange={(e) =>
                setFormData({ ...formData, alert1: e.target.value })
              }
              className="col-span-3"
              placeholder="Email address"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="alert2" className="text-right">
              Secondary Alert
            </Label>
            <Input
              id="alert2"
              value={formData.alert2}
              onChange={(e) =>
                setFormData({ ...formData, alert2: e.target.value })
              }
              className="col-span-3"
              placeholder="Email address"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="escalation" className="text-right">
              Escalation Contact
            </Label>
            <Input
              id="escalation"
              value={formData.escalation}
              onChange={(e) =>
                setFormData({ ...formData, escalation: e.target.value })
              }
              className="col-span-3"
              placeholder="Email address"
            />
          </div>
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 
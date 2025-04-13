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
import { deleteTeam } from "./actions";

interface DeleteTeamModalProps {
  team: Team | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function DeleteTeamModal({
  team,
  open,
  onOpenChange,
  onSuccess,
}: DeleteTeamModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!team) return null;

  const handleDelete = async () => {
    setIsLoading(true);

    try {
      await deleteTeam(team.id);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to delete team:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Team</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete the team "{team.name}"? This action
            cannot be undone.
          </p>
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete Team"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 
'use client'
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { 
  getPendingTeams, 
  updateTeamStatus, 
  deleteTeam,
  updateTeam
} from "../app/actions";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function AdminTeamManagement() {
  const [teams, setTeams] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<any|null>(null);
  const [editData, setEditData] = useState<any>({});

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    const result = await getPendingTeams();
    setTeams(result);
  };

  const handleStatusUpdate = async (teamId: string, status: 'approved' | 'rejected') => {
    await updateTeamStatus(teamId, status);
    loadTeams();
  };

  const handleDelete = async (teamId: string) => {
    await deleteTeam(teamId);
    loadTeams();
  };

  const handleUpdate = async () => {
    if (selectedTeam && editData) {
      await updateTeam(selectedTeam.id, editData);
      loadTeams();
      setSelectedTeam(null);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Team Approval Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {teams.map((team) => (
            <div key={team.id} className="border rounded p-4">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <h3 className="font-semibold">{team.teamName}</h3>
                  <p className="text-sm text-muted-foreground">
                    Created by: {team.createdBy}
                  </p>
                  <p className="text-sm">Applications: {team.applications}</p>
                </div>
                
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setSelectedTeam(team);
                          setEditData(team);
                        }}
                      >
                        Edit
                      </Button>
                    </DialogTrigger>
                    
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Team Details</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Input
                          placeholder="Team Name"
                          value={editData.teamName || ''}
                          onChange={(e) => setEditData({...editData, teamName: e.target.value})}
                        />
                        <Textarea
                          placeholder="Applications"
                          value={editData.applications || ''}
                          onChange={(e) => setEditData({...editData, applications: e.target.value})}
                        />
                        <div className="flex justify-end gap-2">
                          <Button onClick={() => setSelectedTeam(null)}>
                            Cancel
                          </Button>
                          <Button onClick={handleUpdate}>
                            Save Changes
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button
                    variant="outline" 
                    onClick={() => handleStatusUpdate(team.id, 'approved')}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleStatusUpdate(team.id, 'rejected')}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => handleDelete(team.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {teams.length === 0 && (
            <p className="text-center text-muted-foreground">
              No pending team requests
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
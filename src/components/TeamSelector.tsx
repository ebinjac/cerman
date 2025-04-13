"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Users, Plus, Settings, LayoutDashboard } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface Team {
  id: string;
  name: string;
}

interface TeamSelectorProps {
  teams: Team[];
  currentTeamId?: string;
}

export function TeamSelector({ teams, currentTeamId }: TeamSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const currentTeam = teams.find(team => team.id === currentTeamId);

  const navigateToTeam = (teamId: string, section: string = 'dashboard') => {
    router.push(`/teams/${teamId}/${section}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className={cn(
            "w-[240px] justify-between group",
            currentTeam && "border-primary/50"
          )}
        >
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="truncate">
              {currentTeam ? currentTeam.name : "Select Team"}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[240px]">
        <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
          Teams
        </div>
        <DropdownMenuSeparator />
        {teams.map((team) => (
          <div key={team.id}>
            <DropdownMenuItem
              onClick={() => navigateToTeam(team.id)}
              className={cn(
                "flex items-center justify-between cursor-pointer",
                currentTeamId === team.id && "bg-muted"
              )}
            >
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="truncate">{team.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateToTeam(team.id, 'settings');
                  }}
                >
                  <Settings className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateToTeam(team.id, 'dashboard');
                  }}
                >
                  <LayoutDashboard className="h-3 w-3" />
                </Button>
              </div>
            </DropdownMenuItem>
          </div>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => router.push('/admin/teams/new')}
          className="cursor-pointer"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create New Team
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 
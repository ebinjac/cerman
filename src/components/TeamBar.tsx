'use client';

import { useParams } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getAllTeams } from "@/src/app/actions";
import { create } from 'zustand';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Team = { id: string; teamName: string };

type TeamStore = {
  teams: Team[];
  isLoading: boolean;
  setTeams: (teams: Team[]) => void;
  setLoading: (loading: boolean) => void;
};

const useTeamStore = create<TeamStore>((set) => ({
  teams: [],
  isLoading: false,
  setTeams: (teams) => set({ teams }),
  setLoading: (loading) => set({ isLoading: loading }),
}));

const getTeamColor = (name: string) => {
  const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-orange-500'];
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

const TeamAvatar = ({ name, className }: { name: string; className?: string }) => {
  const initials = name.split(' ')
    .slice(0, 2)
    .map(word => word.charAt(0).toUpperCase())
    .join('');
  const bgColor = getTeamColor(name);

  return (
    <div className={cn(
      "w-8 h-8 rounded-full flex items-center justify-center text-white font-medium",
      bgColor,
      className
    )}>
      {initials}
    </div>
  );
};

export function TeamBar() {
  const { teamId } = useParams() as { teamId: string };
  const { teams, isLoading, setTeams, setLoading } = useTeamStore();

  // Initialize empty state for SSR
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Ensure client-side rendering logic is handled here
  }, []);

  useEffect(() => {
    const loadTeams = async () => {
      setLoading(true);
      try {
        const result = await getAllTeams();
        setTeams(result);
      } finally {
        setLoading(false);
      }
    };
    loadTeams();
  }, [setLoading, setTeams]);

  const currentTeam = teams.find(t => t.id === teamId);
  const currentTeamName = isMounted
    ? currentTeam?.teamName || (isLoading ? 'Loading...' : '')
    : '';

  return (
    <div className="h-14 border-b px-4 flex items-center bg-background">

      <div className="flex-1 flex justify-end items-center">

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 transition-opacity duration-200 min-w-[200px] justify-between px-4 hover:bg-accent"
              disabled={isLoading}
            >
              <div className="flex items-center gap-2">
                <TeamAvatar
                  name={currentTeamName || 'Team'}
                  className={cn(
                    isLoading && 'opacity-50',
                    !currentTeamName && 'bg-gray-400'
                  )}
                />
                <span className={cn(
                  'font-medium',
                  isLoading && 'opacity-50'
                )}>
                  {currentTeamName || (teams.length ? 'Select Team' : 'Loading...')}
                </span>
              </div>
              <ChevronDown className={cn(
                'h-4 w-4 transition-transform duration-200',
                isLoading && 'opacity-50'
              )} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-[200px]">
            {teams.map(team => (
              <DropdownMenuItem key={team.id} asChild>
                <a href={`/teams/${team.id}/dashboard`} className="flex items-center gap-2 w-full">
                  <TeamAvatar name={team.teamName} />
                  <span className="font-medium">{team.teamName}</span>
                </a>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </div>
      <div className="w-10" /> {/* Spacer to balance the ThemeToggle */}
    </div>
  );
}
'use client';
import { useParams, usePathname } from "next/navigation";
import { 
  LayoutDashboard,
  FileBadge,
  KeySquare,
  CalendarDays,
  BarChart,
  Settings,
  Users
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { ChevronDown } from "lucide-react"
import { getAllTeams } from "@/src/app/actions"
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { create } from 'zustand';

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

const UserAvatar = () => {
  return (
    <div className="flex items-center gap-2 p-4 mt-auto border-t">
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
        <Users className="w-4 h-4" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">John Doe</p>
        <p className="text-xs text-muted-foreground">john@example.com</p>
      </div>
    </div>
  );
};

export function AppSidebar() {
  const { teamId } = useParams() as { teamId: string }
  const pathname = usePathname()
  const { teams, isLoading, setTeams, setLoading } = useTeamStore()

  useEffect(() => {
    const loadTeams = async () => {
      // Try to use cached data first
      const cachedTeams = localStorage.getItem('teams')
      if (cachedTeams) {
        const parsedTeams = JSON.parse(cachedTeams)
        setTeams(parsedTeams)
        
        // Refresh cache in background
        getAllTeams().then(result => {
          if (JSON.stringify(result) !== cachedTeams) {
            setTeams(result)
            localStorage.setItem('teams', JSON.stringify(result))
          }
        })
        return
      }

      // No cache, load fresh data
      if (!isLoading) {
        setLoading(true)
        try {
          const result = await getAllTeams()
          setTeams(result)
          localStorage.setItem('teams', JSON.stringify(result))
        } finally {
          setLoading(false)
        }
      }
    }
    loadTeams()
  }, [isLoading, setLoading, setTeams])

  const currentTeam = teams.find(t => t.id === teamId)
  const currentTeamName = currentTeam?.teamName || (isLoading ? 'Loading...' : '')

  // Add navItems declaration inside the component
  const mainNavItems = [
    { 
      name: "Dashboard", 
      href: `/teams/${teamId}/dashboard`, 
      icon: LayoutDashboard 
    },
    { 
      name: "Certificates", 
      href: `/teams/${teamId}/certificates`, 
      icon: FileBadge 
    },
    { 
      name: "Service IDs", 
      href: `/teams/${teamId}/service-ids`, 
      icon: KeySquare 
    },
    { 
      name: "Planning", 
      href: `/teams/${teamId}/planning`, 
      icon: CalendarDays 
    },
    { 
      name: "Reports", 
      href: `/teams/${teamId}/reports`, 
      icon: BarChart 
    },
  ];

  const bottomNavItems = [
    { 
      name: "Admin", 
      href: "/admin", 
      icon: Users 
    },
    { 
      name: "Settings", 
      href: `/teams/${teamId}/settings`, 
      icon: Settings 
    },
  ];


  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className="p-4">
          <Image src="/logo.svg" alt="Logo" width={32} height={32} />
        </div>


        {/* Existing navigation group */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild>
                    <a 
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2",
                        pathname === item.href && "text-primary font-medium bg-primary/10 -mx-3 px-3 py-2 rounded-md"
                      )}
                    >
                      <item.icon />
                      <span>{item.name}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Bottom navigation group */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              {bottomNavItems.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild>
                    <a 
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2",
                        pathname === item.href && "text-primary font-medium bg-primary/10 -mx-3 px-3 py-2 rounded-md"
                      )}
                    >
                      <item.icon />
                      <span>{item.name}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <UserAvatar />
      </SidebarContent>
    </Sidebar>
  )
}

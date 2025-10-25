"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { User, Settings, LogOut, Award, BarChart } from "lucide-react";

type MeMenuProps = {
  name: string;
  subtitle?: string;
  avatarUrl?: string;
  onProfileClick?: () => void;
  onStatsClick?: () => void;
  onAchievementsClick?: () => void;
  onSettingsClick?: () => void;
  onLogout?: () => void;
};

export default function MeMenu({
  name,
  subtitle,
  avatarUrl,
  onProfileClick,
  onStatsClick,
  onAchievementsClick,
  onSettingsClick,
  onLogout,
}: MeMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none">
        <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
          <div className="text-right">
            <p className="text-sm text-gray-900">{name}</p>
            {subtitle ? (
              <p className="text-xs text-gray-500">{subtitle}</p>
            ) : null}
          </div>
          <Avatar className="h-10 w-10 border-2 border-purple-500">
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt={name} />
            ) : null}
            <AvatarFallback>
              {name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")}
            </AvatarFallback>
          </Avatar>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onProfileClick}>
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onStatsClick}>
          <BarChart className="mr-2 h-4 w-4" />
          <span>Learning Stats</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onAchievementsClick}>
          <Award className="mr-2 h-4 w-4" />
          <span>Achievements</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onSettingsClick}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-red-600" onClick={onLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

"use client";

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { User, Settings, LogOut, Award, BarChart } from "lucide-react";

export function Header() {
  return (
    <header className="border-b bg-white px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
            <span className="text-white">LF</span>
          </div>
          <div>
            <h1 className="text-gray-900">LearnFlow AI</h1>
            <p className="text-sm text-gray-500">Smart Learning Assistant</p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none">
            <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
              <div className="text-right">
                <p className="text-sm text-gray-900">Sarah Johnson</p>
                <p className="text-xs text-gray-500">Premium Member</p>
              </div>
              <Avatar className="h-10 w-10 border-2 border-purple-500">
                <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" alt="Sarah Johnson" />
                <AvatarFallback>SJ</AvatarFallback>
              </Avatar>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <BarChart className="mr-2 h-4 w-4" />
              <span>Learning Stats</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Award className="mr-2 h-4 w-4" />
              <span>Achievements</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

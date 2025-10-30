"use client";

import { BookOpen, Home, Settings, Trophy, TrendingUp, Star, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/dashboard/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/dashboard/ui/tooltip";

export function Sidebar() {
  const [activeItem, setActiveItem] = useState("courses");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const router = useRouter();

  const menuItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "courses", label: "My Courses", icon: BookOpen },
    { id: "progress", label: "Progress", icon: TrendingUp },
    { id: "achievements", label: "Achievements", icon: Trophy },
    { id: "schedule", label: "Schedule", icon: Calendar },
    { id: "favorites", label: "Favorites", icon: Star },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside className={`border-r bg-gray-50 px-4 py-6 transition-all duration-300 relative ${isCollapsed ? "w-20" : "w-64"}`}>
      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 h-6 w-6 rounded-full border bg-white shadow-md hover:bg-gray-100 z-10"
      >
        {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </Button>

      <TooltipProvider delayDuration={0}>
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;

            const handleClick = () => {
              setActiveItem(item.id);
              if (item.id === "courses") {
                router.push("/dashboard");
              }
            };

            const buttonContent = (
              <button
                key={item.id}
                onClick={handleClick}
                className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </button>
            );

            if (isCollapsed) {
              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>
                    {buttonContent}
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{item.label}</p>
                  </TooltipContent>
                </Tooltip>
              );
            }

            return buttonContent;
          })}
        </nav>

        {/* Streak Card */}
        {isCollapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="mt-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 p-3 text-white flex items-center justify-center cursor-pointer">
                <div className="text-center">
                  <p className="text-xl">🔥</p>
                  <p className="text-sm mt-1">7</p>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              <div>
                <p>Current Streak</p>
                <p className="text-lg">7 days</p>
              </div>
            </TooltipContent>
          </Tooltip>
        ) : (
          <div className="mt-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 p-4 text-white">
            <p className="mb-2">🔥 Current Streak</p>
            <p className="text-3xl">7 days</p>
            <p className="mt-2 text-sm opacity-90">Keep it up! You're doing great!</p>
          </div>
        )}
      </TooltipProvider>
    </aside>
  );
}

"use client";

import { BookOpen, Home, Settings, Trophy, TrendingUp, Star, Calendar } from "lucide-react";
import { useState } from "react";

export function Sidebar() {
  const [activeItem, setActiveItem] = useState("courses");

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
    <aside className="w-64 border-r bg-gray-50 px-4 py-6">
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveItem(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 p-4 text-white">
        <p className="mb-2">🔥 Current Streak</p>
        <p className="text-3xl">7 days</p>
        <p className="mt-2 text-sm opacity-90">Keep it up! You're doing great!</p>
      </div>
    </aside>
  );
}

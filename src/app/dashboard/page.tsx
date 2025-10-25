"use client";

import { Header } from "@/components/dashboard/Header";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { CourseCard } from "@/components/dashboard/CourseCard";
import { Button } from "@/components/dashboard/ui/button";
import { Plus, Sparkles } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from '@/lib/auth-client';
import UserMenu from '@/components/testdashboard/UserMenu';
import BriefCard from '@/components/testdashboard/BriefCard';
import QuickActions from '@/components/testdashboard/QuickActions';
import GenerateOutlineModal from '@/components/testdashboard/GenerateOutlineModal';

export default function DashboardPage() {
  const courses = [
    {
      title: "Advanced JavaScript Patterns",
      description: "Master modern JavaScript design patterns and best practices",
      progress: 68,
      totalLessons: 24,
      completedLessons: 16,
      estimatedTime: "2h 30m left",
      difficulty: "Advanced" as const,
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
    },
    {
      title: "Introduction to Machine Learning",
      description: "Learn the fundamentals of ML and build your first models",
      progress: 35,
      totalLessons: 18,
      completedLessons: 6,
      estimatedTime: "5h 20m left",
      difficulty: "Intermediate" as const,
      color: "bg-gradient-to-br from-purple-500 to-purple-600",
    },
    {
      title: "UI/UX Design Principles",
      description: "Create beautiful and user-friendly interfaces",
      progress: 92,
      totalLessons: 12,
      completedLessons: 11,
      estimatedTime: "30m left",
      difficulty: "Beginner" as const,
      color: "bg-gradient-to-br from-pink-500 to-pink-600",
    },
    {
      title: "Data Structures & Algorithms",
      description: "Build a strong foundation in computer science fundamentals",
      progress: 45,
      totalLessons: 30,
      completedLessons: 13,
      estimatedTime: "8h 15m left",
      difficulty: "Advanced" as const,
      color: "bg-gradient-to-br from-orange-500 to-orange-600",
    },
    {
      title: "Digital Marketing Essentials",
      description: "Learn SEO, content marketing, and social media strategies",
      progress: 20,
      totalLessons: 15,
      completedLessons: 3,
      estimatedTime: "6h 40m left",
      difficulty: "Beginner" as const,
      color: "bg-gradient-to-br from-green-500 to-green-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Welcome Section */}
            <div className="mb-8">
              <h2 className="text-gray-900 mb-2">Welcome back, Sarah! 👋</h2>
              <p className="text-gray-600">Continue your learning journey or start something new</p>
            </div>

            {/* Create New Course Button */}
            <div className="mb-8">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
              >
                <Plus className="mr-2 h-5 w-5" />
                Create New Course
                <Sparkles className="ml-2 h-5 w-5" />
              </Button>
            </div>

            {/* Courses Grid */}
            <div className="mb-6">
              <h3 className="text-gray-900 mb-4">My Learning Paths</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course, index) => (
                <CourseCard key={index} {...course} />
              ))}
            </div>

            {/* Stats Overview */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg p-6 border">
                <p className="text-gray-600 mb-2">Total Learning Time</p>
                <p className="text-3xl text-gray-900">47.5 hrs</p>
                <p className="text-sm text-green-600 mt-2">↑ 12% from last week</p>
              </div>
              <div className="bg-white rounded-lg p-6 border">
                <p className="text-gray-600 mb-2">Courses Completed</p>
                <p className="text-3xl text-gray-900">12</p>
                <p className="text-sm text-green-600 mt-2">3 this month</p>
              </div>
              <div className="bg-white rounded-lg p-6 border">
                <p className="text-gray-600 mb-2">Current Streak</p>
                <p className="text-3xl text-gray-900">7 days</p>
                <p className="text-sm text-purple-600 mt-2">🔥 Keep going!</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

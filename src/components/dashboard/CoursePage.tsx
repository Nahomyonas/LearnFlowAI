"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import ReactMarkdown from "react-markdown";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { DashboardShell } from "./DashboardShell";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronRight,
  Lock,
  Play,
  ArrowRight,
} from "lucide-react";

interface SimpleCourseProps {
  onBack?: () => void;
}

interface Lesson {
  id: string;
  title: string;
  content: string;
  duration: string;
  completed: boolean;
  locked: boolean;
}

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
  expanded: boolean;
}

export function CoursePage({ onBack }: SimpleCourseProps) {
  const router = useRouter();
  
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.push('/dashboard');
    }
  };

  // Sample course data
  const [modules, setModules] = useState<Module[]>([
    {
      id: "m1",
      title: "Introduction to the Fundamentals",
      expanded: true,
      lessons: [
        {
          id: "m1-l1",
          title: "Welcome and Course Overview",
          duration: "5 min",
          completed: true,
          locked: false,
          content: `# Welcome and Course Overview

Welcome to this comprehensive course! We're excited to have you here.

## What You'll Learn

In this course, you'll gain a deep understanding of the fundamental concepts and practical skills needed to master this subject. Here's what we'll cover:

- **Core Concepts**: Understanding the foundational principles
- **Practical Applications**: Real-world use cases and examples
- **Best Practices**: Industry-standard approaches and techniques
- **Advanced Topics**: Taking your skills to the next level

## Course Structure

This course is organized into modules, each focusing on a specific aspect of the subject. Within each module, you'll find:

1. Video lessons with clear explanations
2. Code examples and demonstrations
3. Hands-on exercises
4. Quizzes to test your knowledge

## Prerequisites

This course is designed for learners with basic knowledge of the subject area. If you're completely new, we recommend starting with our beginner course first.

## Tips for Success

- **Stay Consistent**: Try to complete at least one lesson per day
- **Practice Regularly**: Apply what you learn through the exercises
- **Ask Questions**: Use the discussion forum if you need help
- **Review Previous Lessons**: Don't hesitate to go back and review

Let's get started on this exciting learning journey!`,
        },
        {
          id: "m1-l2",
          title: "Setting Up Your Environment",
          duration: "12 min",
          completed: true,
          locked: false,
          content: `# Setting Up Your Environment

Before we dive into the main content, let's make sure you have everything set up properly.

## Required Software

You'll need to install the following tools:

### 1. Code Editor
We recommend using Visual Studio Code, but you can use any editor you're comfortable with.

\`\`\`bash
# Download from https://code.visualstudio.com/
\`\`\`

### 2. Runtime Environment
Install the latest LTS version of the runtime.

\`\`\`bash
# Installation command
npm install -g package-name
\`\`\`

### 3. Version Control
Make sure you have Git installed for version control.

\`\`\`bash
git --version
\`\`\`

## Project Setup

Create a new project folder and initialize it:

\`\`\`bash
mkdir my-project
cd my-project
npm init -y
\`\`\`

## Verification

Run the following command to verify everything is installed correctly:

\`\`\`bash
npm --version
\`\`\`

If you see version numbers, you're all set!

## Next Steps

In the next lesson, we'll explore the core concepts that form the foundation of this subject.`,
        },
        {
          id: "m1-l3",
          title: "Core Concepts Explained",
          duration: "18 min",
          completed: false,
          locked: false,
          content: `# Core Concepts Explained

Now that your environment is ready, let's dive into the fundamental concepts.

## Understanding the Basics

Every complex system is built on simple foundational principles. In this lesson, we'll break down these core concepts into digestible pieces.

### Concept 1: The Foundation

This is the most important concept to understand. Everything else builds on top of this.

**Key Points:**
- Point one explaining the concept
- Point two with additional details
- Point three with practical examples

### Concept 2: Building Blocks

Once you understand the foundation, these building blocks will help you create more complex solutions.

\`\`\`javascript
// Example code demonstrating the concept
const example = {
  property: 'value',
  method: function() {
    return 'result';
  }
};
\`\`\`

### Concept 3: Putting It Together

This is where it all comes together. Let's see how these concepts work in harmony.

## Practice Exercise

Try implementing what you've learned:

1. Create a new file
2. Implement the concepts we discussed
3. Test your implementation
4. Compare with the solution

## Summary

In this lesson, you learned:
- ✓ The fundamental concepts
- ✓ How they work together
- ✓ Practical applications

Ready to move on? Let's continue to the next module!`,
        },
      ],
    },
    {
      id: "m2",
      title: "Building Your First Project",
      expanded: false,
      lessons: [
        {
          id: "m2-l1",
          title: "Project Planning and Setup",
          duration: "15 min",
          completed: false,
          locked: false,
          content: "# Project Planning and Setup\n\nContent for this lesson...",
        },
        {
          id: "m2-l2",
          title: "Implementing Core Features",
          duration: "25 min",
          completed: false,
          locked: false,
          content: "# Implementing Core Features\n\nContent for this lesson...",
        },
        {
          id: "m2-l3",
          title: "Testing and Debugging",
          duration: "20 min",
          completed: false,
          locked: false,
          content: "# Testing and Debugging\n\nContent for this lesson...",
        },
        {
          id: "m2-l4",
          title: "Deployment Basics",
          duration: "10 min",
          completed: false,
          locked: false,
          content: "# Deployment Basics\n\nContent for this lesson...",
        },
      ],
    },
    {
      id: "m3",
      title: "Advanced Techniques",
      expanded: false,
      lessons: [
        {
          id: "m3-l1",
          title: "Optimization Strategies",
          duration: "22 min",
          completed: false,
          locked: true,
          content: "# Optimization Strategies\n\nContent for this lesson...",
        },
        {
          id: "m3-l2",
          title: "Best Practices and Patterns",
          duration: "18 min",
          completed: false,
          locked: true,
          content: "# Best Practices and Patterns\n\nContent for this lesson...",
        },
        {
          id: "m3-l3",
          title: "Real-World Applications",
          duration: "30 min",
          completed: false,
          locked: true,
          content: "# Real-World Applications\n\nContent for this lesson...",
        },
      ],
    },
  ]);

  const [selectedLesson, setSelectedLesson] = useState<{
    moduleId: string;
    lessonId: string;
  }>({ moduleId: "m1", lessonId: "m1-l1" });

  const toggleModule = (moduleId: string) => {
    setModules((prevModules) =>
      prevModules.map((m) =>
        m.id === moduleId ? { ...m, expanded: !m.expanded } : m
      )
    );
  };

  const selectLesson = (moduleId: string, lessonId: string, locked: boolean) => {
    if (!locked) {
      setSelectedLesson({ moduleId, lessonId });
    }
  };

  const markLessonComplete = () => {
    setModules((prevModules) =>
      prevModules.map((m) =>
        m.id === selectedLesson.moduleId
          ? {
              ...m,
              lessons: m.lessons.map((l) =>
                l.id === selectedLesson.lessonId
                  ? { ...l, completed: true }
                  : l
              ),
            }
          : m
      )
    );
  };

  const getNextLesson = () => {
    let foundCurrent = false;
    for (const module of modules) {
      for (const lesson of module.lessons) {
        if (foundCurrent && !lesson.locked) {
          return { moduleId: module.id, lessonId: lesson.id };
        }
        if (
          module.id === selectedLesson.moduleId &&
          lesson.id === selectedLesson.lessonId
        ) {
          foundCurrent = true;
        }
      }
    }
    return null;
  };

  const goToNextLesson = () => {
    const next = getNextLesson();
    if (next) {
      setSelectedLesson(next);
      // Expand the module if it's not already expanded
      setModules((prevModules) =>
        prevModules.map((m) =>
          m.id === next.moduleId ? { ...m, expanded: true } : m
        )
      );
    }
  };

  const getCurrentLessonData = () => {
    const module = modules.find((m) => m.id === selectedLesson.moduleId);
    if (!module) return null;
    const lesson = module.lessons.find((l) => l.id === selectedLesson.lessonId);
    if (!lesson) return null;
    return { module, lesson };
  };

  const calculateProgress = () => {
    let totalLessons = 0;
    let completedLessons = 0;
    modules.forEach((module) => {
      module.lessons.forEach((lesson) => {
        totalLessons++;
        if (lesson.completed) completedLessons++;
      });
    });
    return totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
  };

  const currentLessonData = getCurrentLessonData();
  const progress = calculateProgress();
  const nextLesson = getNextLesson();

  return (
    <DashboardShell>
      <div className="flex flex-col h-full w-full -m-8 overflow-hidden">
        {/* Top Bar with Progress */}
        <div className="bg-white border-b px-8 py-4 shrink-0">
        <Button variant="ghost" className="mb-3 -ml-2" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-gray-900">Introduction to Web Development</h2>
            <p className="text-sm text-gray-600">Master the fundamentals</p>
          </div>
          <div className="text-right min-w-[200px]">
            <p className="text-sm text-gray-600 mb-1">Course Progress</p>
            <div className="flex items-center gap-3">
              <Progress value={progress} className="w-32" />
              <span className="text-sm">{Math.round(progress)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Module & Lesson List */}
        <div className="w-80 bg-white border-r flex flex-col">
              <div className="p-4 border-b">
                <h3 className="flex items-center gap-2 text-gray-900">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  Course Content
                </h3>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-4 space-y-2">
                  {modules.map((module, moduleIndex) => (
                    <div key={module.id}>
                      <button
                        onClick={() => toggleModule(module.id)}
                        className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          {module.expanded ? (
                            <ChevronDown className="h-4 w-4 text-gray-500" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-gray-500" />
                          )}
                          <div className="text-left">
                            <div className="text-xs text-gray-500 mb-1">
                              Module {moduleIndex + 1}
                            </div>
                            <div className="text-sm">{module.title}</div>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {module.lessons.filter((l) => l.completed).length}/
                          {module.lessons.length}
                        </Badge>
                      </button>

                      {module.expanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="ml-4 mt-1 space-y-1"
                        >
                          {module.lessons.map((lesson, lessonIndex) => (
                            <button
                              key={lesson.id}
                              onClick={() =>
                                selectLesson(module.id, lesson.id, lesson.locked)
                              }
                              disabled={lesson.locked}
                              className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                                selectedLesson.moduleId === module.id &&
                                selectedLesson.lessonId === lesson.id
                                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                                  : lesson.locked
                                  ? "opacity-50 cursor-not-allowed"
                                  : "hover:bg-gray-50"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`flex items-center justify-center w-6 h-6 rounded-full text-xs shrink-0 ${
                                    selectedLesson.moduleId === module.id &&
                                    selectedLesson.lessonId === lesson.id
                                      ? "bg-white text-blue-600"
                                      : "bg-gray-100 text-gray-600"
                                  }`}
                                >
                                  {lessonIndex + 1}
                                </div>
                                <div className="text-left">
                                  <div className="text-sm">{lesson.title}</div>
                                  <div
                                    className={`text-xs ${
                                      selectedLesson.moduleId === module.id &&
                                      selectedLesson.lessonId === lesson.id
                                        ? "text-blue-100"
                                        : "text-gray-500"
                                    }`}
                                  >
                                    {lesson.duration}
                                  </div>
                                </div>
                              </div>
                              <div>
                                {lesson.locked ? (
                                  <Lock className="h-4 w-4 text-gray-400" />
                                ) : lesson.completed ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                                ) : (
                                  <Circle className="h-4 w-4 text-gray-300" />
                                )}
                              </div>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Right Content Area - Lesson Display */}
            <div className="flex-1 flex flex-col bg-white relative">
              {currentLessonData ? (
                <>
                  {/* Lesson Header */}
                  <div className="bg-white border-b px-8 py-6 shrink-0">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          {currentLessonData.module.title}
                        </p>
                        <h1 className="text-gray-900">
                          {currentLessonData.lesson.title}
                        </h1>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          <Play className="h-3 w-3" />
                          {currentLessonData.lesson.duration}
                        </Badge>
                        {currentLessonData.lesson.completed && (
                          <Badge className="bg-green-600 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Completed
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Lesson Content - Scrollable */}
                  <div className="flex-1 overflow-y-auto bg-white pb-24">
                    <div className="max-w-4xl mx-auto px-8 py-8">
                      <div className="prose prose-lg max-w-none">
                        <ReactMarkdown
                          components={{
                            h1: ({ node, ...props }) => (
                              <h1 className="text-gray-900 mb-4 mt-8 first:mt-0" {...props} />
                            ),
                            h2: ({ node, ...props }) => (
                              <h2 className="text-gray-900 mb-3 mt-8 first:mt-0" {...props} />
                            ),
                            h3: ({ node, ...props }) => (
                              <h3 className="text-gray-900 mb-2 mt-6 first:mt-0" {...props} />
                            ),
                            h4: ({ node, ...props }) => (
                              <h4 className="text-gray-900 mb-2 mt-4 first:mt-0" {...props} />
                            ),
                            p: ({ node, ...props }) => (
                              <p className="text-gray-700 mb-4 leading-relaxed" {...props} />
                            ),
                            ul: ({ node, ...props }) => (
                              <ul className="list-disc list-inside mb-4 space-y-2 text-gray-700" {...props} />
                            ),
                            ol: ({ node, ...props }) => (
                              <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-700" {...props} />
                            ),
                            li: ({ node, ...props }) => (
                              <li className="text-gray-700" {...props} />
                            ),
                            code: (props) =>
                              (props as any).inline ? (
                                <code className="bg-gray-100 text-pink-600 px-1.5 py-0.5 rounded text-sm" {...props} />
                              ) : (
                                <code className="block bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm" {...props} />
                              ),
                            pre: ({ node, ...props }) => (
                              <pre className="mb-4 overflow-x-auto" {...props} />
                            ),
                            strong: ({ node, ...props }) => (
                              <strong className="text-gray-900" {...props} />
                            ),
                            a: ({ node, ...props }) => (
                              <a className="text-blue-600 hover:text-blue-700 underline" {...props} />
                            ),
                          }}
                        >
                          {currentLessonData.lesson.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Bar */}
                  <div className="absolute bottom-0 left-0 right-0 bg-white border-t px-8 py-4 flex items-center justify-between z-10">
                    <div>
                      {!currentLessonData.lesson.completed && (
                        <Button
                          onClick={markLessonComplete}
                          variant="outline"
                          className="border-green-600 text-green-600 hover:bg-green-50"
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Mark as Complete
                        </Button>
                      )}
                    </div>
                    <div>
                      {nextLesson && (
                        <Button
                          onClick={goToNextLesson}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                          Next Lesson
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">Select a lesson to begin</p>
                </div>
              )}
            </div>
          </div>
        </div>
    </DashboardShell>
  );
}

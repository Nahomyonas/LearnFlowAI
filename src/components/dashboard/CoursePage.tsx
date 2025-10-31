"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "motion/react";
import ReactMarkdown from "react-markdown";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
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
  Loader2,
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
  const params = useParams();
  const courseId = params?.id as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [courseTitle, setCourseTitle] = useState("Course");
  const [courseSummary, setCourseSummary] = useState("");

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.push('/dashboard');
    }
  };

  // Load course data from API
  const [modules, setModules] = useState<Module[]>([]);

  useEffect(() => {
    if (!courseId) return;

    const loadCourseData = async () => {
      try {
        setIsLoading(true);
        const apiHelpers = await import("@/utils/api_helpers");
        
        // Load course details
        const course = await apiHelpers.api.courses.get(courseId);
        setCourseTitle(course.title);
        setCourseSummary(course.summary || "");
        
        // Load modules and lessons
        const dbModules = await apiHelpers.api.modules.listByCourse(courseId);
        
        const modulesWithLessons = await Promise.all(
          dbModules.map(async (mod, index) => {
            const lessons = await apiHelpers.api.lessons.listByModule(mod.id);
            return {
              id: mod.id,
              title: mod.title,
              expanded: index === 0, // Expand first module by default
              lessons: lessons.map((l: any) => ({
                id: l.id,
                title: l.title,
                content: typeof l.content === 'string' ? l.content : JSON.stringify(l.content),
                duration: "5 min", // TODO: Calculate from content or store in DB
                completed: false, // TODO: Track user progress
                locked: false, // TODO: Implement lesson locking logic
              }))
            };
          })
        );
        
        setModules(modulesWithLessons);
      } catch (err) {
        console.error("Failed to load course data", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadCourseData();
  }, [courseId]);

  const [selectedLesson, setSelectedLesson] = useState<{
    moduleId: string;
    lessonId: string;
  } | null>(null);

  // Ref for scrolling content area to top when lesson changes
  const lessonContentRef = useRef<HTMLDivElement>(null);

  // Auto-select first lesson when modules load
  useEffect(() => {
    if (modules.length > 0 && !selectedLesson) {
      const firstModule = modules[0];
      if (firstModule.lessons.length > 0) {
        setSelectedLesson({
          moduleId: firstModule.id,
          lessonId: firstModule.lessons[0].id,
        });
      }
    }
  }, [modules, selectedLesson]);

  // Scroll to top when lesson changes
  useEffect(() => {
    if (lessonContentRef.current) {
      lessonContentRef.current.scrollTop = 0;
    }
  }, [selectedLesson]);

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
    if (!selectedLesson) return;
    
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
    if (!selectedLesson) return null;
    
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
    if (!selectedLesson) return null;
    
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

  if (isLoading) {
    return (
      <DashboardShell noPadding>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading course...</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell noPadding>
      <div className="flex flex-col h-full w-full overflow-hidden">
        {/* Top Bar with Progress */}
        <div className="bg-white border-b px-8 py-4 shrink-0">
        <Button variant="ghost" className="mb-3 -ml-2" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-gray-900">{courseTitle}</h2>
            <p className="text-sm text-gray-600">{courseSummary || "Master the fundamentals"}</p>
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
        <div className="w-80 bg-white border-r flex flex-col overflow-hidden">
              <div className="p-4 border-b shrink-0">
                <h3 className="flex items-center gap-2 text-gray-900">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  Course Content
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto">
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
                                selectedLesson?.moduleId === module.id &&
                                selectedLesson?.lessonId === lesson.id
                                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                                  : lesson.locked
                                  ? "opacity-50 cursor-not-allowed"
                                  : "hover:bg-gray-50"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`flex items-center justify-center w-6 h-6 rounded-full text-xs shrink-0 ${
                                    selectedLesson?.moduleId === module.id &&
                                    selectedLesson?.lessonId === lesson.id
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
                                      selectedLesson?.moduleId === module.id &&
                                      selectedLesson?.lessonId === lesson.id
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
              </div>
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
                  <div ref={lessonContentRef} className="flex-1 overflow-y-auto bg-white pb-24">
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

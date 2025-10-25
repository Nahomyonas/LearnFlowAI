"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/dashboard/ui/card";
import { Button } from "@/components/dashboard/ui/button";
import { Separator } from "@/components/dashboard/ui/separator";
import { Checkbox } from "@/components/dashboard/ui/checkbox";
import { Label } from "@/components/dashboard/ui/label";
import { Badge } from "@/components/dashboard/ui/badge";
import { Textarea } from "@/components/dashboard/ui/textarea";
import { ScrollArea } from "@/components/dashboard/ui/scroll-area";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Sparkles, 
  Check, 
  Loader2,
  ArrowLeft,
  Wand2,
  Edit3,
  Image,
  Video,
  BookOpen,
  ChevronRight,
  FileText,
  Code,
  Link2,
  ImageIcon
} from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  content: string;
  generationStatus?: "pending" | "generating" | "generated";
}

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export function FillCourseContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const briefId = searchParams.get("briefId");

  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);

  // Validate briefId exists and belongs to user
  useEffect(() => {
    if (!briefId) {
      router.push("/dashboard/courses/create");
      return;
    }

    const validateBrief = async () => {
      try {
        const response = await fetch(`/api/course-briefs/${briefId}`);
        if (!response.ok) {
          // Brief doesn't exist or user doesn't have access
          router.push("/dashboard/courses/create");
          return;
        }
        setIsValid(true);
      } catch (error) {
        console.error("Error validating brief:", error);
        router.push("/dashboard/courses/create");
      } finally {
        setIsValidating(false);
      }
    };

    validateBrief();
  }, [briefId, router]);

  const [contentMode, setContentMode] = useState<"ai" | "manual">("ai");
  const [includePhotos, setIncludePhotos] = useState(true);
  const [includeVideos, setIncludeVideos] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  
  // Sample modules and lessons - would come from previous step
  const [modules, setModules] = useState<Module[]>([
    {
      id: "m1",
      title: "Introduction to the Fundamentals",
      lessons: [
        { id: "m1-l1", title: "Welcome and Course Overview", content: "", generationStatus: "pending" },
        { id: "m1-l2", title: "Setting Up Your Environment", content: "", generationStatus: "pending" },
        { id: "m1-l3", title: "Core Concepts Explained", content: "", generationStatus: "pending" },
      ]
    },
    {
      id: "m2",
      title: "Building Your First Project",
      lessons: [
        { id: "m2-l1", title: "Project Planning and Setup", content: "", generationStatus: "pending" },
        { id: "m2-l2", title: "Implementing Core Features", content: "", generationStatus: "pending" },
        { id: "m2-l3", title: "Testing and Debugging", content: "", generationStatus: "pending" },
        { id: "m2-l4", title: "Deployment Basics", content: "", generationStatus: "pending" },
      ]
    },
    {
      id: "m3",
      title: "Advanced Techniques",
      lessons: [
        { id: "m3-l1", title: "Optimization Strategies", content: "", generationStatus: "pending" },
        { id: "m3-l2", title: "Best Practices and Patterns", content: "", generationStatus: "pending" },
        { id: "m3-l3", title: "Real-World Applications", content: "", generationStatus: "pending" },
      ]
    },
  ]);

  const [selectedLesson, setSelectedLesson] = useState<{ moduleId: string; lessonId: string } | null>(null);

  const handleGenerateContent = async () => {
    setIsGenerating(true);
    setHasGenerated(true);

    // Simulate AI generation for each lesson
    const allLessons: Array<{ moduleId: string; lessonId: string }> = [];
    modules.forEach(module => {
      module.lessons.forEach(lesson => {
        allLessons.push({ moduleId: module.id, lessonId: lesson.id });
      });
    });

    // Generate content for each lesson sequentially
    for (let i = 0; i < allLessons.length; i++) {
      const { moduleId, lessonId } = allLessons[i];
      
      // Set to generating
      setModules(prevModules => 
        prevModules.map(m => 
          m.id === moduleId 
            ? {
                ...m,
                lessons: m.lessons.map(l =>
                  l.id === lessonId ? { ...l, generationStatus: "generating" as const } : l
                )
              }
            : m
        )
      );

      // Simulate generation time
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Set to generated with content
      setModules(prevModules => 
        prevModules.map(m => 
          m.id === moduleId 
            ? {
                ...m,
                lessons: m.lessons.map(l =>
                  l.id === lessonId 
                    ? { 
                        ...l, 
                        generationStatus: "generated" as const,
                        content: `# ${l.title}\n\nThis is AI-generated content for ${l.title}. In a real implementation, this would contain comprehensive learning materials, examples, and exercises tailored to the lesson objectives.\n\n## Key Points\n- Important concept 1\n- Important concept 2\n- Important concept 3\n\n## Practice Exercise\nTry implementing what you've learned...`
                      } 
                    : l
                )
              }
            : m
        )
      );
    }

    setIsGenerating(false);
  };

  const getSelectedLessonData = () => {
    if (!selectedLesson) return null;
    const module = modules.find(m => m.id === selectedLesson.moduleId);
    if (!module) return null;
    const lesson = module.lessons.find(l => l.id === selectedLesson.lessonId);
    if (!lesson) return null;
    return { module, lesson };
  };

  const updateLessonContent = (content: string) => {
    if (!selectedLesson) return;
    
    setModules(prevModules =>
      prevModules.map(m =>
        m.id === selectedLesson.moduleId
          ? {
              ...m,
              lessons: m.lessons.map(l =>
                l.id === selectedLesson.lessonId ? { ...l, content } : l
              )
            }
          : m
      )
    );
  };

  const selectedLessonData = getSelectedLessonData();

  // Show loading state while validating
  if (isValidating || !isValid) {
    return (
      <DashboardShell>
        <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Validating course brief...</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" className="mb-4 -ml-2" onClick={() => router.push(`/dashboard/courses/create/outline?briefId=${briefId}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Course Outline
          </Button>
          <h1 className="text-gray-900 mb-2">Fill Course Content</h1>
          <p className="text-gray-600">
            Add engaging content to your course lessons
          </p>
        </div>

        {/* Mode Selection */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card 
            className={`cursor-pointer transition-all border-2 ${
              contentMode === "ai" 
                ? "border-purple-500 bg-gradient-to-br from-purple-50 to-blue-50 shadow-lg" 
                : "border-gray-200 hover:border-gray-300 bg-white"
            }`}
            onClick={() => setContentMode("ai")}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${
                  contentMode === "ai" 
                    ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white" 
                    : "bg-gray-100 text-gray-600"
                }`}>
                  <Wand2 className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    Generate with AI
                    {contentMode === "ai" && (
                      <Badge className="bg-purple-600 hover:bg-purple-700">
                        <Check className="h-3 w-3 mr-1" />
                        Selected
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Let AI create comprehensive lesson content automatically
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card 
            className={`cursor-pointer transition-all border-2 ${
              contentMode === "manual" 
                ? "border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 shadow-lg" 
                : "border-gray-200 hover:border-gray-300 bg-white"
            }`}
            onClick={() => setContentMode("manual")}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${
                  contentMode === "manual" 
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white" 
                    : "bg-gray-100 text-gray-600"
                }`}>
                  <Edit3 className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    Create Manually
                    {contentMode === "manual" && (
                      <Badge className="bg-blue-600 hover:bg-blue-700">
                        <Check className="h-3 w-3 mr-1" />
                        Selected
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Write your own lesson content with full creative control
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* AI Mode */}
        {contentMode === "ai" && (
          <div className="space-y-6">
            {!hasGenerated && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    Content Generation Options
                  </CardTitle>
                  <CardDescription>
                    Customize what type of content you'd like to include
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-4 rounded-lg border bg-white">
                      <Checkbox
                        id="include-photos"
                        checked={includePhotos}
                        onCheckedChange={(checked) => setIncludePhotos(checked as boolean)}
                      />
                      <Label
                        htmlFor="include-photos"
                        className="flex items-center gap-2 flex-1 cursor-pointer"
                      >
                        <Image className="h-4 w-4 text-blue-600" />
                        <div>
                          <div>Include Photo Learning Content</div>
                          <p className="text-xs text-gray-500">Add relevant images and diagrams to lessons</p>
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3 p-4 rounded-lg border bg-white">
                      <Checkbox
                        id="include-videos"
                        checked={includeVideos}
                        onCheckedChange={(checked) => setIncludeVideos(checked as boolean)}
                      />
                      <Label
                        htmlFor="include-videos"
                        className="flex items-center gap-2 flex-1 cursor-pointer"
                      >
                        <Video className="h-4 w-4 text-purple-600" />
                        <div>
                          <div>Include Video Learning Content</div>
                          <p className="text-xs text-gray-500">Add video explanations and demonstrations</p>
                        </div>
                      </Label>
                    </div>
                  </div>

                  <Separator />

                  <div className="text-center py-4">
                    <Button
                      onClick={handleGenerateContent}
                      disabled={isGenerating}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      size="lg"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating Content...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Generate Content
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {hasGenerated && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    Content Generation Progress
                  </CardTitle>
                  <CardDescription>
                    AI is generating content for all your lessons
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {modules.map((module) => (
                      <div key={module.id}>
                        <h4 className="mb-3 text-gray-700">{module.title}</h4>
                        <div className="space-y-2">
                          {module.lessons.map((lesson) => (
                            <div
                              key={lesson.id}
                              className="flex items-center justify-between p-4 rounded-lg border bg-white"
                            >
                              <div className="flex items-center gap-3">
                                <FileText className="h-4 w-4 text-gray-400" />
                                <span className="text-sm">{lesson.title}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {lesson.generationStatus === "pending" && (
                                  <Badge variant="secondary">Pending</Badge>
                                )}
                                {lesson.generationStatus === "generating" && (
                                  <Badge className="bg-blue-500">
                                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                    Generating...
                                  </Badge>
                                )}
                                {lesson.generationStatus === "generated" && (
                                  <Badge className="bg-green-500">
                                    <Check className="h-3 w-3 mr-1" />
                                    Generated
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Manual Mode */}
        {contentMode === "manual" && (
          <div className="grid grid-cols-12 gap-6">
            {/* Left Sidebar - Modules & Lessons */}
            <div className="col-span-12 lg:col-span-4">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    Course Structure
                  </CardTitle>
                  <CardDescription>
                    Select a lesson to edit
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[600px]">
                    <div className="p-4 space-y-4">
                      {modules.map((module, moduleIndex) => (
                        <div key={module.id}>
                          <div className="flex items-center gap-2 mb-2 px-2">
                            <Badge variant="secondary">Module {moduleIndex + 1}</Badge>
                            <span className="text-sm text-gray-700">{module.title}</span>
                          </div>
                          <div className="space-y-1 ml-4">
                            {module.lessons.map((lesson, lessonIndex) => (
                              <button
                                key={lesson.id}
                                onClick={() => setSelectedLesson({ moduleId: module.id, lessonId: lesson.id })}
                                className={`w-full text-left p-3 rounded-lg flex items-center justify-between transition-colors ${
                                  selectedLesson?.lessonId === lesson.id
                                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                                    : "hover:bg-gray-100"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                                    selectedLesson?.lessonId === lesson.id
                                      ? "bg-white text-blue-600"
                                      : "bg-blue-100 text-blue-600"
                                  }`}>
                                    {lessonIndex + 1}
                                  </div>
                                  <span className="text-sm">{lesson.title}</span>
                                </div>
                                {selectedLesson?.lessonId === lesson.id && (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Right Content Area - Lesson Editor */}
            <div className="col-span-12 lg:col-span-8">
              {selectedLessonData ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{selectedLessonData.lesson.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {selectedLessonData.module.title}
                        </CardDescription>
                      </div>
                      <Badge variant="outline">{selectedLessonData.lesson.content ? "Draft Saved" : "Empty"}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Editor Toolbar */}
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border">
                      <Button variant="ghost" size="sm" title="Add code block">
                        <Code className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" title="Add image">
                        <ImageIcon className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" title="Add link">
                        <Link2 className="h-4 w-4" />
                      </Button>
                      <Separator orientation="vertical" className="h-6" />
                      <span className="text-xs text-gray-500">Supports Markdown, HTML, and URLs</span>
                    </div>

                    {/* Content Editor */}
                    <Textarea
                      placeholder="Write your lesson content here... You can use Markdown formatting, add code blocks, embed images, and include links."
                      value={selectedLessonData.lesson.content}
                      onChange={(e) => updateLessonContent(e.target.value)}
                      className="min-h-[500px] font-mono text-sm"
                    />

                    <div className="flex justify-between items-center pt-4 border-t">
                      <p className="text-sm text-gray-500">
                        {selectedLessonData.lesson.content.length} characters
                      </p>
                      <Button variant="outline">
                        <Check className="h-4 w-4 mr-2" />
                        Save Draft
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-20">
                    <FileText className="h-16 w-16 text-gray-300 mb-4" />
                    <h3 className="mb-2 text-gray-900">No Lesson Selected</h3>
                    <p className="text-sm text-gray-600 text-center max-w-md">
                      Select a lesson from the course structure on the left to start editing its content
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Final Action Button */}
        <Separator className="my-6" />
        <div className="flex justify-between items-center p-6 bg-white rounded-lg border-2 border-gray-200">
          <div>
            <h3 className="mb-1 text-gray-900">Finalize Your Course</h3>
            <p className="text-sm text-gray-600">
              {contentMode === "ai" && !hasGenerated && "Generate content to continue."}
              {contentMode === "ai" && hasGenerated && isGenerating && "Please wait for content generation to complete."}
              {contentMode === "ai" && hasGenerated && !isGenerating && "Your course content is ready! Review and publish your course."}
              {contentMode === "manual" && "Save your content and publish your course when ready."}
            </p>
          </div>
          <Button 
            size="lg" 
            disabled={contentMode === "ai" ? (!hasGenerated || isGenerating) : false}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check className="mr-2 h-4 w-4" />
            Publish Course
          </Button>
        </div>
      </div>
    </DashboardShell>
  );
}

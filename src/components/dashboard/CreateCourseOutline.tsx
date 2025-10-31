"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/dashboard/ui/card";
import { Input } from "@/components/dashboard/ui/input";
import { Label } from "@/components/dashboard/ui/label";
import { Button } from "@/components/dashboard/ui/button";
import { Separator } from "@/components/dashboard/ui/separator";
import { Checkbox } from "@/components/dashboard/ui/checkbox";
import { Badge } from "@/components/dashboard/ui/badge";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/utils/api_helpers";
import { 
  Sparkles, 
  Check, 
  Loader2,
  ArrowLeft,
  Brain,
  GraduationCap,
  BookOpen,
  List,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Wand2
} from "lucide-react";

interface Lesson {
  id: string;
  title: string;
}

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface CreateCourseOutlineProps {
  briefId?: string;
}

export function CreateCourseOutline({ briefId: briefIdProp }: CreateCourseOutlineProps) {
  const router = useRouter();
  const briefId = briefIdProp;

  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [briefData, setBriefData] = useState<{
    topic: string | null;
    details: string | null;
    goals: string[] | null;
  } | null>(null);

  // Validate briefId exists and belongs to user
  useEffect(() => {
    if (!briefId) {
      router.push("/dashboard/courses/create");
      return;
    }

    const validateBrief = async () => {
      try {
        const brief = await api.briefs.get(briefId);
        setBriefData({
          topic: brief.topic,
          details: brief.details,
          goals: brief.goals,
        });
        
        // Auto-fill outline if it already exists
        if (brief.planOutline) {
          const outline = brief.planOutline;
          const modules: Module[] = outline.modules.map((mod: any, idx: number) => ({
            id: `m${idx + 1}`,
            title: mod.title,
            lessons: mod.lessons.map((lesson: any, lessonIdx: number) => ({
              id: `m${idx + 1}-l${lessonIdx + 1}`,
              title: lesson.title,
            })),
          }));
          
          setGeneratedModules(modules);
          setExpandedModules(new Set(modules.map(m => m.id)));
          setOutlineMode("ai"); // Set to AI mode since outline was generated
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

  const [outlineMode, setOutlineMode] = useState<"ai" | "manual">("ai");
  
  // Prerequisites state
  const [isAnalyzingPrerequisites, setIsAnalyzingPrerequisites] = useState(false);
  const [prerequisites, setPrerequisites] = useState<Array<{ id: string; text: string; checked: boolean }>>([]);
  
  // Learner level state
  const [isDeterminingLevel, setIsDeterminingLevel] = useState(false);
  const [learnerLevel, setLearnerLevel] = useState<string>("");
  
  // Outline generation state
  const [isGeneratingOutline, setIsGeneratingOutline] = useState(false);
  const [generatedModules, setGeneratedModules] = useState<Module[]>([]);
  
  // Manual outline state
  const [manualModules, setManualModules] = useState<Module[]>([
    { id: "1", title: "", lessons: [{ id: "1-1", title: "" }] }
  ]);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set(["1"]));

  const handleAnalyzePrerequisites = async () => {
    if (!briefData?.topic) return;
    
    setIsAnalyzingPrerequisites(true);
    try {
      const result = await api.ai.analyzePrerequisites({
        topic: briefData.topic,
        details: briefData.details || undefined,
      });
      
      // Transform string array to prerequisite objects with checked state
      const prereqObjects = result.prerequisites.map((text, index) => ({
        id: String(index + 1),
        text,
        checked: false,
      }));
      
      setPrerequisites(prereqObjects);
    } catch (error) {
      console.error("Error analyzing prerequisites:", error);
      alert("Failed to analyze prerequisites. Please try again.");
    } finally {
      setIsAnalyzingPrerequisites(false);
    }
  };

  const handlePrerequisiteToggle = (id: string) => {
    setPrerequisites(prerequisites.map(p => 
      p.id === id ? { ...p, checked: !p.checked } : p
    ));
  };

  const handleDetermineLearnerLevel = async () => {
    if (!briefData?.topic) return;
    
    setIsDeterminingLevel(true);
    try {
      const result = await api.ai.assessLearnerLevel({
        topic: briefData.topic,
        details: briefData.details || undefined,
        prerequisites: prerequisites,
      });
      
      // Format the level with explanation
      const levelMap = {
        novice: "Beginner",
        intermediate: "Intermediate", 
        advanced: "Advanced"
      };
      
      setLearnerLevel(`${levelMap[result.level]} - ${result.explanation}`);
    } catch (error) {
      console.error("Error determining learner level:", error);
      // Fallback to simple calculation
      const checkedCount = prerequisites.filter(p => p.checked).length;
      const total = prerequisites.length;
      const percentage = (checkedCount / total) * 100;
      
      if (percentage >= 80) {
        setLearnerLevel("Advanced - You have strong foundational knowledge");
      } else if (percentage >= 50) {
        setLearnerLevel("Intermediate - You have some prerequisite knowledge");
      } else {
        setLearnerLevel("Beginner - We'll start from the basics");
      }
    } finally {
      setIsDeterminingLevel(false);
    }
  };

  const handleGenerateOutline = async () => {
    if (!briefId || !briefData?.topic) return;
    
    setIsGeneratingOutline(true);
    try {
      // Call the API to generate outline
      await api.ai.generateOutline({
        briefId,
        topic: briefData.topic,
        details: briefData.details || undefined,
        goals: briefData.goals || undefined,
      });
      
      // Fetch the updated brief to get the generated outline
      const updatedBrief = await api.briefs.get(briefId);
      
      if (updatedBrief.planOutline) {
        const outline = updatedBrief.planOutline;
        
        // Transform the outline to our module format
        const modules: Module[] = outline.modules.map((mod: any, idx: number) => ({
          id: `m${idx + 1}`,
          title: mod.title,
          lessons: mod.lessons.map((lesson: any, lessonIdx: number) => ({
            id: `m${idx + 1}-l${lessonIdx + 1}`,
            title: lesson.title,
          })),
        }));
        
        setGeneratedModules(modules);
        
        // Expand all modules by default
        setExpandedModules(new Set(modules.map(m => m.id)));
      }
    } catch (error) {
      console.error("Error generating outline:", error);
      alert("Failed to generate outline. Please try again.");
    } finally {
      setIsGeneratingOutline(false);
    }
  };

  const toggleModuleExpansion = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const addManualModule = () => {
    const newId = String(manualModules.length + 1);
    setManualModules([
      ...manualModules,
      { id: newId, title: "", lessons: [{ id: `${newId}-1`, title: "" }] }
    ]);
    setExpandedModules(new Set([...expandedModules, newId]));
  };

  const removeManualModule = (moduleId: string) => {
    if (manualModules.length > 1) {
      setManualModules(manualModules.filter(m => m.id !== moduleId));
      const newExpanded = new Set(expandedModules);
      newExpanded.delete(moduleId);
      setExpandedModules(newExpanded);
    }
  };

  const updateModuleTitle = (moduleId: string, title: string) => {
    setManualModules(manualModules.map(m =>
      m.id === moduleId ? { ...m, title } : m
    ));
  };

  const addLesson = (moduleId: string) => {
    setManualModules(manualModules.map(m => {
      if (m.id === moduleId) {
        const newLessonId = `${moduleId}-${m.lessons.length + 1}`;
        return {
          ...m,
          lessons: [...m.lessons, { id: newLessonId, title: "" }]
        };
      }
      return m;
    }));
  };

  const removeLesson = (moduleId: string, lessonId: string) => {
    setManualModules(manualModules.map(m => {
      if (m.id === moduleId && m.lessons.length > 1) {
        return {
          ...m,
          lessons: m.lessons.filter(l => l.id !== lessonId)
        };
      }
      return m;
    }));
  };

  const updateLessonTitle = (moduleId: string, lessonId: string, title: string) => {
    setManualModules(manualModules.map(m => {
      if (m.id === moduleId) {
        return {
          ...m,
          lessons: m.lessons.map(l =>
            l.id === lessonId ? { ...l, title } : l
          )
        };
      }
      return m;
    }));
  };

  const isAIModeReady = () => {
    return learnerLevel !== "" && generatedModules.length > 0;
  };

  const isManualModeValid = () => {
    return manualModules.every(m => 
      m.title.trim() !== "" && m.lessons.every(l => l.title.trim() !== "")
    );
  };

  const [isCommitting, setIsCommitting] = useState(false);
  const handleContinue = async () => {
    if (!briefId) return;

    setIsCommitting(true);
    let courseId: string | undefined;
    try {
      const result = await api.briefs.commit(briefId);
      courseId = result.course_id;
    } catch (err: any) {
      // If already committed, we need to get the courseId from the brief
      const msg = err?.message || "";
      const alreadyCommitted = /Already committed/i.test(msg);
      if (!alreadyCommitted) {
        alert(msg || "Failed to create course from outline");
        setIsCommitting(false);
        return;
      }
      
      // Get the courseId from the conflict error details or fetch the brief
      if (err?.details?.courseId) {
        courseId = err.details.courseId;
      } else {
        try {
          const brief = await api.briefs.get(briefId);
          // The brief should have a committedCourseId or we can infer from the error
          // For now, proceed without courseId and let the content page handle it
        } catch {
          // Ignore and proceed
        }
      }
    }

    router.push(`/dashboard/courses/create/content?briefId=${briefId}${courseId ? `&courseId=${courseId}` : ''}`);
  };

  // Show loading state while validating
  if (isValidating || !isValid) {
    return (
      <DashboardShell>
        <div className="max-w-5xl mx-auto flex items-center justify-center min-h-[400px]">
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
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" className="mb-4 -ml-2" onClick={() => router.push(`/dashboard/courses/create?briefId=${briefId}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Course Brief
          </Button>
          <h1 className="text-gray-900 mb-2">Create Course Outline</h1>
          <p className="text-gray-600">
            Design your course structure with AI assistance or create it manually
          </p>
        </div>

        {/* Mode Selection */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card 
            className={`cursor-pointer transition-all border-2 ${
              outlineMode === "ai" 
                ? "border-purple-500 bg-gradient-to-br from-purple-50 to-blue-50 shadow-lg" 
                : "border-gray-200 hover:border-gray-300 bg-white"
            }`}
            onClick={() => setOutlineMode("ai")}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${
                  outlineMode === "ai" 
                    ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white" 
                    : "bg-gray-100 text-gray-600"
                }`}>
                  <Wand2 className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    Outline with AI
                    {outlineMode === "ai" && (
                      <Badge className="bg-purple-600 hover:bg-purple-700">
                        <Check className="h-3 w-3 mr-1" />
                        Selected
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Let AI analyze prerequisites and generate a personalized course structure
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card 
            className={`cursor-pointer transition-all border-2 ${
              outlineMode === "manual" 
                ? "border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 shadow-lg" 
                : "border-gray-200 hover:border-gray-300 bg-white"
            }`}
            onClick={() => setOutlineMode("manual")}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${
                  outlineMode === "manual" 
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white" 
                    : "bg-gray-100 text-gray-600"
                }`}>
                  <List className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    Outline Manually
                    {outlineMode === "manual" && (
                      <Badge className="bg-blue-600 hover:bg-blue-700">
                        <Check className="h-3 w-3 mr-1" />
                        Selected
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Create your course structure step by step with full control
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* AI Mode */}
        {outlineMode === "ai" && (
          <div className="space-y-6">
            {/* Prerequisites Analysis Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  Prerequisites Analysis
                </CardTitle>
                <CardDescription>
                  Let AI analyze and identify the prerequisite knowledge needed for this course
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {prerequisites.length === 0 ? (
                  <div className="text-center py-8">
                    <Button
                      onClick={handleAnalyzePrerequisites}
                      disabled={isAnalyzingPrerequisites}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      size="lg"
                    >
                      {isAnalyzingPrerequisites ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing Prerequisites...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Analyze Prerequisites with AI
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      Check the prerequisites you already have:
                    </p>
                    {prerequisites.map((prereq) => (
                      <div key={prereq.id} className="flex items-center space-x-3 p-3 rounded-lg border bg-white">
                        <Checkbox
                          id={prereq.id}
                          checked={prereq.checked}
                          onCheckedChange={() => handlePrerequisiteToggle(prereq.id)}
                        />
                        <Label
                          htmlFor={prereq.id}
                          className="flex-1 cursor-pointer"
                        >
                          {prereq.text}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Learner Level Determination Card */}
            {prerequisites.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-blue-600" />
                    Learner Level Assessment
                  </CardTitle>
                  <CardDescription>
                    Based on your prerequisites, AI will determine your optimal starting level
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!learnerLevel ? (
                    <div className="text-center py-8">
                      <Button
                        onClick={handleDetermineLearnerLevel}
                        disabled={isDeterminingLevel}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        size="lg"
                      >
                        {isDeterminingLevel ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Determining Level...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Determine Learner Level
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="p-6 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
                      <div className="flex items-start gap-3">
                        <Check className="h-6 w-6 text-green-600 mt-1" />
                        <div>
                          <h4 className="mb-1">Your Recommended Level:</h4>
                          <p className="text-gray-700">{learnerLevel}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Generate Outline Card */}
            {learnerLevel && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    Course Outline
                  </CardTitle>
                  <CardDescription>
                    Generate a personalized course outline based on your level and goals
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {generatedModules.length === 0 ? (
                    <div className="text-center py-8">
                      <Button
                        onClick={handleGenerateOutline}
                        disabled={isGeneratingOutline}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        size="lg"
                      >
                        {isGeneratingOutline ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating Outline...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Generate Outline
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <AnimatePresence mode="popLayout">
                        {generatedModules.map((module, moduleIndex) => (
                          <motion.div
                            key={module.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: moduleIndex * 0.1 }}
                          >
                            <Card className="border-2">
                              <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <Badge variant="secondary">Module {moduleIndex + 1}</Badge>
                                    <CardTitle className="text-lg">{module.title}</CardTitle>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleModuleExpansion(module.id)}
                                  >
                                    {expandedModules.has(module.id) ? (
                                      <ChevronDown className="h-4 w-4" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                              </CardHeader>
                              {expandedModules.has(module.id) && (
                                <CardContent>
                                  <div className="space-y-2">
                                    {module.lessons.map((lesson, lessonIndex) => (
                                      <div
                                        key={lesson.id}
                                        className="flex items-center gap-3 p-3 rounded-lg bg-gray-50"
                                      >
                                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs shrink-0">
                                          {lessonIndex + 1}
                                        </div>
                                        <span className="text-sm">{lesson.title}</span>
                                      </div>
                                    ))}
                                  </div>
                                </CardContent>
                              )}
                            </Card>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Manual Mode */}
        {outlineMode === "manual" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  Course Modules & Lessons
                </CardTitle>
                <CardDescription>
                  Manually create your course structure with modules and lessons
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {manualModules.map((module, moduleIndex) => (
                  <Card key={module.id} className="border-2">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary">Module {moduleIndex + 1}</Badge>
                        <div className="flex-1">
                          <Input
                            placeholder="Enter module title..."
                            value={module.title}
                            onChange={(e) => updateModuleTitle(module.id, e.target.value)}
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleModuleExpansion(module.id)}
                        >
                          {expandedModules.has(module.id) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                        {manualModules.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeManualModule(module.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    {expandedModules.has(module.id) && (
                      <CardContent>
                        <div className="space-y-3">
                          <Label>Lessons</Label>
                          {module.lessons.map((lesson, lessonIndex) => (
                            <div key={lesson.id} className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs shrink-0">
                                {lessonIndex + 1}
                              </div>
                              <Input
                                placeholder="Enter lesson title..."
                                value={lesson.title}
                                onChange={(e) => updateLessonTitle(module.id, lesson.id, e.target.value)}
                              />
                              {module.lessons.length > 1 && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeLesson(module.id, lesson.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              )}
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addLesson(module.id)}
                            className="w-full"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Lesson
                          </Button>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
                <Button
                  variant="outline"
                  onClick={addManualModule}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Module
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Create Course Button */}
        <Separator className="my-6" />
        <div className="flex justify-between items-center p-6 bg-white rounded-lg border-2 border-gray-200">
          <div>
            <h3 className="mb-1 text-gray-900">Ready to create your course?</h3>
            <p className="text-sm text-gray-600">
              {outlineMode === "ai" && !isAIModeReady() && "Complete the AI analysis and generate your outline to continue."}
              {outlineMode === "ai" && isAIModeReady() && "Your AI-generated outline is ready. Click below to create your course and fill in the content."}
              {outlineMode === "manual" && !isManualModeValid() && "Fill in all module and lesson titles to continue."}
              {outlineMode === "manual" && isManualModeValid() && "Your manual outline is complete. Click below to create your course and fill in the content."}
            </p>
          </div>
          <Button 
            size="lg" 
            disabled={(outlineMode === "ai" ? !isAIModeReady() : !isManualModeValid()) || isCommitting}
            onClick={handleContinue}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCommitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Preparing Course...
              </>
            ) : (
              "Create Course & Fill Content"
            )}
          </Button>
        </div>
      </div>
    </DashboardShell>
  );
}

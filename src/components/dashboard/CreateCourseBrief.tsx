"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/dashboard/ui/card";
import { Input } from "@/components/dashboard/ui/input";
import { Textarea } from "@/components/dashboard/ui/textarea";
import { Label } from "@/components/dashboard/ui/label";
import { Button } from "@/components/dashboard/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/dashboard/ui/tooltip";
import { Badge } from "@/components/dashboard/ui/badge";
import { Separator } from "@/components/dashboard/ui/separator";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  Check, 
  Info, 
  Upload, 
  Loader2,
  ArrowLeft,
  BookOpen,
  Plus,
  Trash2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "@/utils/api_helpers";


export function CreateCourseBrief() {

  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    category: "",
    targetAudience: "",
    estimatedDuration: "",
    coverImage: null as File | null,
  });
  const [learningGoals, setLearningGoals] = useState<string[]>([""]);
  // AI suggestions state
  const [isSuggestingGoals, setIsSuggestingGoals] = useState(false);
  const [hasUsedAISuggestions, setHasUsedAISuggestions] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [touched, setTouched] = useState({
    title: false,
    summary: false,
    goals: false,
  });

  const [errors, setErrors] = useState({
    title: "",
    summary: "",
    goals: "",
  });

  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const categories = [
    "Programming & Development",
    "Data Science & Analytics",
    "Design & Creativity",
    "Business & Marketing",
    "Personal Development",
    "Science & Mathematics",
    "Language Learning",
    "Health & Wellness",
  ];

  const suggestedTags = [
    "Beginner Friendly",
    "Hands-on Projects",
    "Career Development",
    "Certification",
    "Self-paced",
    "Interactive",
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    
    // Validate required fields
    if (field === "title" || field === "summary") {
      if (value.trim() === "") {
        setErrors({ ...errors, [field]: "This field is required" });
      } else {
        setErrors({ ...errors, [field]: "" });
      }
    }
  };

  const handleBlur = (field: "title" | "summary" | "goals") => {
    setTouched({ ...touched, [field]: true });
    if (field === "goals") {
      const anyGoal = learningGoals.some((g) => g.trim() !== "");
      setErrors({ ...errors, goals: anyGoal ? "" : "This field is required" });
    } else {
      // title or summary
      // @ts-ignore - index access only for title/summary here
      if (formData[field].trim() === "") {
        setErrors({ ...errors, [field]: "This field is required" });
      }
    }
  };

  // Goals helpers
  const addGoal = () => {
    setLearningGoals([...learningGoals, ""]);
  };

  const removeGoal = (index: number) => {
    if (learningGoals.length > 1) {
      const newGoals = learningGoals.filter((_, i) => i !== index);
      setLearningGoals(newGoals);
      // Re-validate
      const hasAtLeastOneGoal = newGoals.some(goal => goal.trim() !== "");
      if (!hasAtLeastOneGoal && touched.goals) {
        setErrors({ ...errors, goals: "At least one learning goal is required" });
      }
    }
  };

  const handleGoalChange = (index: number, value: string) => {
    const newGoals = [...learningGoals];
    newGoals[index] = value;
    setLearningGoals(newGoals);
    // Validate goals
    const hasAtLeastOneGoal = newGoals.some(goal => goal.trim() !== "");
    if (hasAtLeastOneGoal) {
      setErrors({ ...errors, goals: "" });
    } else if (touched.goals) {
      setErrors({ ...errors, goals: "At least one learning goal is required" });
    }
  };

  // AI goal suggestion
  const handleSuggestGoals = () => {
    setIsSuggestingGoals(true);
    // Placeholder - simulate AI goal generation
    setTimeout(() => {
      const suggestedGoals = [
        "Understand core concepts and fundamentals",
        "Apply knowledge through practical exercises",
        "Build real-world projects and examples",
        "Master advanced techniques and best practices",
      ];
      // Filter out empty existing goals and append new suggestions
      const existingGoals = learningGoals.filter(goal => goal.trim() !== "");
      const combinedGoals = [...existingGoals, ...suggestedGoals];
      setLearningGoals(combinedGoals);
      setErrors({ ...errors, goals: "" });
      setIsSuggestingGoals(false);
      setHasUsedAISuggestions(true);
    }, 2000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, coverImage: file });
    }
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const isFormValid = () => {
    const hasGoal = learningGoals.some((g) => g.trim() !== "");
    return formData.title.trim() !== "" && formData.summary.trim() !== "" && hasGoal;
  };

  const handleSaveAndContinue = async () => {
    if (!isFormValid()) return;

    setIsSaving(true);
    try {
      // Save the course brief
      const response = await fetch("/api/course-briefs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source: "manual",
          topic: formData.title,
          details: formData.summary,
          goals: learningGoals.filter(g => g.trim() !== ""),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save course brief");
      }

      const data = await response.json();
      const briefId = data.id;

      // Navigate to outline page with the brief ID
      router.push(`/dashboard/courses/create/outline?briefId=${briefId}`);
    } catch (error) {
      console.error("Error saving course brief:", error);
      // TODO: Show error toast
      setIsSaving(false);
    }
  };

  return (
    <DashboardShell>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" className="mb-4 -ml-2" onClick={() => router.push("/dashboard")}> 
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Courses
          </Button>
          <h1 className="text-gray-900 mb-2">Create Course Brief</h1>
          <p className="text-gray-600">
            Fill in the details below to create a personalized learning course with AI assistance
          </p>
        </div>
        <TooltipProvider>
          <div className="space-y-6">
            {/* Basic Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  Course Details
                </CardTitle>
                <CardDescription>
                  Provide the essential details about your course
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Course Title */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="title">
                      Course Title <span className="text-red-500">*</span>
                    </Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Give your course a clear, descriptive title that reflects what learners will achieve</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="title"
                    placeholder="e.g., Master JavaScript in 30 Days"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    onBlur={() => handleBlur("title")}
                    className={touched.title && errors.title ? "border-red-500" : ""}
                  />
                  {touched.title && errors.title && (
                    <p className="text-sm text-red-500">{errors.title}</p>
                  )}
                </div>
                {/* Summary */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="summary">
                      Summary <span className="text-red-500">*</span>
                    </Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Write a brief overview of what this course covers and why it matters</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Textarea
                    id="summary"
                    placeholder="Provide a concise summary of what this course is about..."
                    value={formData.summary}
                    onChange={(e) => handleInputChange("summary", e.target.value)}
                    onBlur={() => handleBlur("summary")}
                    className={`min-h-[100px] ${touched.summary && errors.summary ? "border-red-500" : ""}`}
                  />
                  {touched.summary && errors.summary && (
                    <p className="text-sm text-red-500">{errors.summary}</p>
                  )}
                </div>
                {/* Goals */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Label>
                        Learning Goals <span className="text-red-500">*</span>
                      </Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">List the key skills and knowledge learners will gain from this course</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleSuggestGoals}
                        disabled={isSuggestingGoals || hasUsedAISuggestions || !formData.title.trim() || !formData.summary.trim()}
                        className="bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSuggestingGoals ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            Suggesting...
                          </>
                        ) : hasUsedAISuggestions ? (
                          <>
                            <Check className="h-4 w-4 mr-1" />
                            AI Suggested
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-1" />
                            Suggest with AI
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addGoal}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Goal
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <AnimatePresence mode="popLayout">
                      {learningGoals.map((goal, index) => (
                        <motion.div 
                          key={index}
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ 
                            duration: 0.3,
                            delay: index * 0.1,
                            ease: "easeOut"
                          }}
                          className="flex gap-2"
                        >
                          <div className="flex-1">
                            <Input
                              placeholder={`Learning goal ${index + 1}`}
                              value={goal}
                              onChange={(e) => handleGoalChange(index, e.target.value)}
                              onBlur={() => handleBlur("goals")}
                              className={touched.goals && errors.goals && learningGoals.every(g => g.trim() === "") ? "border-red-500" : ""}
                            />
                          </div>
                          {learningGoals.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => removeGoal(index)}
                              className="shrink-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                  {touched.goals && errors.goals && (
                    <p className="text-sm text-red-500">{errors.goals}</p>
                  )}
                </div>
                {/* Cover Image Upload */}
                <div className="space-y-2">
                  <Label htmlFor="coverImage">Course Cover Image (Optional)</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <input
                      type="file"
                      id="coverImage"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <label htmlFor="coverImage" className="cursor-pointer">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        {formData.coverImage ? formData.coverImage.name : "Click to upload or drag and drop"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG or WebP (max. 5MB)</p>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Separator />
            <div className="flex justify-between items-center p-6 bg-white rounded-lg border-2 border-gray-200">
              <div>
                <h3 className="mb-1 text-gray-900">Ready to continue?</h3>
                <p className="text-sm text-gray-600">
                  {isFormValid() 
                    ? "Your course brief is complete. Click below to proceed with course creation."
                    : "Please complete all required fields to continue."}
                </p>
              </div>
              <Button 
                size="lg" 
                disabled={!isFormValid() || isSaving}
                onClick={handleSaveAndContinue}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Save & Continue
                  </>
                )}
              </Button>
            </div>
          </div>
        </TooltipProvider>
      </div>
    </DashboardShell>
  );
}

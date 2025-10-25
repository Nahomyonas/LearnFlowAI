import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Clock, BookOpen, BarChart } from "lucide-react";

type Course = {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "published" | "archived";
  visibility: "private" | "unlisted" | "public";
  updated_at: string;
  goals?: string[] | null;
};

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  const { title, slug, status, goals } = course;

  const statusColors = {
    draft: "bg-gray-100 text-gray-700",
    published: "bg-green-100 text-green-700",
    archived: "bg-orange-100 text-orange-700",
  };

  // Pick a gradient based on first letter of title for visual variety
  const gradients = [
    "bg-gradient-to-br from-blue-500 to-blue-600",
    "bg-gradient-to-br from-purple-500 to-purple-600",
    "bg-gradient-to-br from-pink-500 to-pink-600",
    "bg-gradient-to-br from-orange-500 to-orange-600",
    "bg-gradient-to-br from-green-500 to-green-600",
  ];
  const colorIndex = title.charCodeAt(0) % gradients.length;
  const gradient = gradients[colorIndex];

  // Placeholder values until we have user progress (Issue #17)
  const progress = 0;
  const totalLessons = 0;
  const completedLessons = 0;
  const estimatedTime = "Not started";

  // Use first goal as description, or show status
  const description = goals && goals.length > 0 
    ? goals[0] 
    : `${status} course - /${slug}`;

  return (
    <Card className="bg-white hover:shadow-lg transition-shadow cursor-pointer">
  <CardHeader>
        <div className="flex items-start justify-between">
          <div className={`p-3 rounded-lg ${gradient} mb-3`}>
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <Badge className={statusColors[status]}>{status}</Badge>
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Progress</span>
              <span className="text-gray-900">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <BarChart className="h-4 w-4" />
              <span>{completedLessons}/{totalLessons} lessons</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{estimatedTime}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

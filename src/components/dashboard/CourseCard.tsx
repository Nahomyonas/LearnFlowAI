import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Clock, BookOpen, BarChart } from "lucide-react";

interface CourseCardProps {
  title: string;
  description: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  estimatedTime: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  color: string;
}

export function CourseCard({
  title,
  description,
  progress,
  totalLessons,
  completedLessons,
  estimatedTime,
  difficulty,
  color,
}: CourseCardProps) {
  const difficultyColors = {
    Beginner: "bg-green-100 text-green-700",
    Intermediate: "bg-yellow-100 text-yellow-700",
    Advanced: "bg-red-100 text-red-700",
  };

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className={`p-3 rounded-lg ${color} mb-3`}>
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <Badge className={difficultyColors[difficulty]}>{difficulty}</Badge>
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

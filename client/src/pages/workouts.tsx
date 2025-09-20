import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import WorkoutModal from "@/components/modals/workout-modal";
import { useToast } from "@/hooks/use-toast";
import { Plus, Dumbbell, Clock, ChevronRight, Search, Trash2 } from "lucide-react";
import { format } from "date-fns";

export default function Workouts() {
  const [workoutModalOpen, setWorkoutModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: workouts, isLoading } = useQuery({
    queryKey: ["/api/workouts"],
  });

  const deleteWorkoutMutation = useMutation({
    mutationFn: async (workoutId: string) => {
      const response = await apiRequest("DELETE", `/api/workouts/${workoutId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workouts"] });
      toast({
        title: "Success",
        description: "Workout deleted successfully!"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete workout.",
        variant: "destructive"
      });
    }
  });

  const exerciseDatabase = [
    { name: "Bench Press", category: "Chest", description: "Compound movement targeting chest, shoulders, and triceps", primary: "Pectorals" },
    { name: "Squats", category: "Legs", description: "Fundamental lower body exercise for strength and mass", primary: "Quadriceps" },
    { name: "Pull-ups", category: "Back", description: "Bodyweight exercise for back and bicep development", primary: "Latissimus Dorsi" },
    { name: "Deadlifts", category: "Back", description: "Full body compound movement", primary: "Hamstrings" },
    { name: "Overhead Press", category: "Shoulders", description: "Vertical pressing movement", primary: "Deltoids" },
    { name: "Barbell Rows", category: "Back", description: "Horizontal pulling movement", primary: "Rhomboids" },
  ];

  const templates = [
    { name: "Upper Body Strength", exercises: 6, duration: "45-60 min", icon: Dumbbell },
    { name: "Lower Body Power", exercises: 8, duration: "60-75 min", icon: Dumbbell },
    { name: "HIIT Cardio", exercises: 12, duration: "30-40 min", icon: Dumbbell },
  ];

  const filteredExercises = exerciseDatabase.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || exercise.category.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      chest: "bg-primary/10 text-primary",
      legs: "bg-secondary/10 text-secondary",
      back: "bg-accent/10 text-accent",
      shoulders: "bg-destructive/10 text-destructive",
      arms: "bg-purple-500/10 text-purple-500",
    };
    return colors[category.toLowerCase()] || "bg-muted/10 text-muted-foreground";
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading workouts...</div>;
  }

  return (
    <div data-testid="page-workouts">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-foreground">Workout Tracking</h2>
        <Button onClick={() => setWorkoutModalOpen(true)} data-testid="button-new-workout">
          <Plus className="w-4 h-4 mr-2" />
          New Workout
        </Button>
      </div>

      {/* Workout History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Workouts */}
        <div className="bg-card p-6 rounded-lg border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Recent Workouts</h3>
          <div className="space-y-4">
            {(workouts as any[])?.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No workouts logged yet. Start by adding your first workout!
              </p>
            ) : (
              (workouts as any[])?.map((workout: any) => (
                <div 
                  key={workout.id} 
                  className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  data-testid={`workout-${workout.id}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-foreground">{workout.name}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(workout.date), 'MMM d')}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteWorkoutMutation.mutate(workout.id)}
                        data-testid={`button-delete-workout-${workout.id}`}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Duration: {workout.duration ? `${workout.duration}m` : "Not set"} | 
                    Exercises: {workout.exercises?.length || 0}
                  </p>
                  {workout.exercises?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {workout.exercises.slice(0, 3).map((exercise: any, index: number) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                        >
                          {exercise.name}
                        </span>
                      ))}
                      {workout.exercises.length > 3 && (
                        <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                          +{workout.exercises.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Workout Templates */}
        <div className="bg-card p-6 rounded-lg border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Workout Templates</h3>
          <div className="space-y-3">
            {templates.map((template, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                data-testid={`template-${index}`}
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mr-3">
                    <template.icon className="text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{template.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {template.exercises} exercises • {template.duration}
                    </p>
                  </div>
                </div>
                <ChevronRight className="text-muted-foreground" />
              </div>
            ))}

            <Button 
              variant="outline" 
              className="w-full mt-4 border-2 border-dashed"
              data-testid="button-create-template"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Custom Template
            </Button>
          </div>
        </div>
      </div>

      {/* Exercise Database */}
      <div className="mt-8 bg-card p-6 rounded-lg border border-border">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-foreground">Exercise Database</h3>
          <div className="flex items-center space-x-4">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48" data-testid="select-exercise-category">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="chest">Chest</SelectItem>
                <SelectItem value="back">Back</SelectItem>
                <SelectItem value="legs">Legs</SelectItem>
                <SelectItem value="arms">Arms</SelectItem>
                <SelectItem value="shoulders">Shoulders</SelectItem>
                <SelectItem value="cardio">Cardio</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search exercises..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
                data-testid="input-search-exercises"
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExercises.map((exercise, index) => (
            <div 
              key={index}
              className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
              data-testid={`exercise-${index}`}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-foreground">{exercise.name}</h4>
                <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(exercise.category)}`}>
                  {exercise.category}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{exercise.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Primary: {exercise.primary}</span>
                <Button 
                  size="sm" 
                  variant="ghost"
                  data-testid={`button-add-exercise-${index}`}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <WorkoutModal open={workoutModalOpen} onOpenChange={setWorkoutModalOpen} />
    </div>
  );
}

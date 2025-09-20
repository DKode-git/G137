import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, X } from "lucide-react";

interface Exercise {
  name: string;
  sets: number;
  reps: number;
  weight: number;
  notes?: string;
}

interface WorkoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function WorkoutModal({ open, onOpenChange }: WorkoutModalProps) {
  const [workoutName, setWorkoutName] = useState("");
  const [duration, setDuration] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([
    { name: "", sets: 0, reps: 0, weight: 0, notes: "" }
  ]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createWorkoutMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/workouts", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workouts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Workout logged successfully!"
      });
      resetForm();
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to log workout. Please try again.",
        variant: "destructive"
      });
    }
  });

  const resetForm = () => {
    setWorkoutName("");
    setDuration("");
    setExercises([{ name: "", sets: 0, reps: 0, weight: 0, notes: "" }]);
  };

  const addExercise = () => {
    setExercises([...exercises, { name: "", sets: 0, reps: 0, weight: 0, notes: "" }]);
  };

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const updateExercise = (index: number, field: keyof Exercise, value: string | number) => {
    const updated = [...exercises];
    updated[index] = { ...updated[index], [field]: value };
    setExercises(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validExercises = exercises.filter(ex => 
      ex.name.trim() && ex.sets > 0 && ex.reps > 0
    );

    if (!workoutName.trim() || validExercises.length === 0) {
      toast({
        title: "Error",
        description: "Please provide a workout name and at least one exercise.",
        variant: "destructive"
      });
      return;
    }

    createWorkoutMutation.mutate({
      name: workoutName,
      duration: duration ? parseInt(duration) : null,
      exercises: validExercises
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="modal-workout">
        <DialogHeader>
          <DialogTitle>Log New Workout</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="workout-name">Workout Name</Label>
            <Input
              id="workout-name"
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
              placeholder="e.g., Push Day - Chest & Triceps"
              data-testid="input-workout-name"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="60"
                data-testid="input-duration"
              />
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                defaultValue={new Date().toISOString().split('T')[0]}
                data-testid="input-date"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <Label>Exercises</Label>
              <Button type="button" variant="outline" size="sm" onClick={addExercise} data-testid="button-add-exercise">
                <Plus className="w-4 h-4 mr-1" />
                Add Exercise
              </Button>
            </div>
            
            <div className="space-y-4">
              {exercises.map((exercise, index) => (
                <div key={index} className="border border-border rounded-lg p-4" data-testid={`exercise-${index}`}>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="md:col-span-2">
                      <Input
                        value={exercise.name}
                        onChange={(e) => updateExercise(index, "name", e.target.value)}
                        placeholder="Exercise name"
                        data-testid={`input-exercise-name-${index}`}
                      />
                    </div>
                    <div>
                      <Input
                        type="number"
                        value={exercise.sets || ""}
                        onChange={(e) => updateExercise(index, "sets", parseInt(e.target.value) || 0)}
                        placeholder="Sets"
                        data-testid={`input-sets-${index}`}
                      />
                    </div>
                    <div>
                      <Input
                        type="number"
                        value={exercise.reps || ""}
                        onChange={(e) => updateExercise(index, "reps", parseInt(e.target.value) || 0)}
                        placeholder="Reps"
                        data-testid={`input-reps-${index}`}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <Input
                      type="number"
                      step="0.01"
                      value={exercise.weight || ""}
                      onChange={(e) => updateExercise(index, "weight", parseFloat(e.target.value) || 0)}
                      placeholder="Weight (lbs)"
                      data-testid={`input-weight-${index}`}
                    />
                    <div className="flex gap-2">
                      <Input
                        value={exercise.notes || ""}
                        onChange={(e) => updateExercise(index, "notes", e.target.value)}
                        placeholder="Notes (optional)"
                        data-testid={`input-notes-${index}`}
                      />
                      {exercises.length > 1 && (
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          onClick={() => removeExercise(index)}
                          data-testid={`button-remove-exercise-${index}`}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-workout"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createWorkoutMutation.isPending}
              data-testid="button-save-workout"
            >
              {createWorkoutMutation.isPending ? "Saving..." : "Save Workout"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

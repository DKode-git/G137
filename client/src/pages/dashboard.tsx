import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import StatsCard from "@/components/stats-card";
import WeightChart from "@/components/charts/weight-chart";
import WorkoutChart from "@/components/charts/workout-chart";
import WorkoutModal from "@/components/modals/workout-modal";
import NutritionModal from "@/components/modals/nutrition-modal";
import { Flame, Dumbbell, Weight, Calendar, Plus, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export default function Dashboard() {
  const [workoutModalOpen, setWorkoutModalOpen] = useState(false);
  const [nutritionModalOpen, setNutritionModalOpen] = useState(false);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: weightEntries } = useQuery({
    queryKey: ["/api/weight"],
  });

  const { data: workouts } = useQuery({
    queryKey: ["/api/workouts"],
  });

  const { data: todaysMeals } = useQuery({
    queryKey: ["/api/meals", { date: format(new Date(), "yyyy-MM-dd") }],
  });

  // Mock data for charts
  const weightData = (weightEntries as any[])?.slice(-7).map((entry: any) => ({
    date: entry.date,
    weight: parseFloat(entry.weight)
  })) || [];

  const workoutData = [
    { day: "Mon", sets: 15, duration: 75 },
    { day: "Tue", sets: 0, duration: 0 },
    { day: "Wed", sets: 18, duration: 90 },
    { day: "Thu", sets: 0, duration: 0 },
    { day: "Fri", sets: 12, duration: 60 },
    { day: "Sat", sets: 20, duration: 85 },
    { day: "Sun", sets: 0, duration: 0 },
  ];

  // Calculate nutrition totals
  const nutritionTotals = (todaysMeals as any[])?.reduce((acc: any, meal: any) => ({
    calories: acc.calories + meal.calories,
    protein: acc.protein + parseFloat(meal.protein || 0),
    carbs: acc.carbs + parseFloat(meal.carbs || 0),
    fats: acc.fats + parseFloat(meal.fats || 0),
  }), { calories: 0, protein: 0, carbs: 0, fats: 0 }) || { calories: 0, protein: 0, carbs: 0, fats: 0 };

  if (statsLoading) {
    return <div className="text-center py-8">Loading dashboard...</div>;
  }

  return (
    <div data-testid="page-dashboard">
      {/* Hero Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Today's Calories"
          value={nutritionTotals.calories}
          change="+12% vs yesterday"
          icon={<Flame className="text-accent text-xl" />}
          iconBgColor="bg-accent/10"
        />
        <StatsCard
          title="Workouts This Week"
          value={(stats as any)?.weeklyWorkouts || 0}
          change="Goal: 6/week"
          icon={<Dumbbell className="text-primary text-xl" />}
          iconBgColor="bg-primary/10"
        />
        <StatsCard
          title="Current Weight"
          value={(stats as any)?.currentWeight ? `${(stats as any).currentWeight} lbs` : "Not set"}
          change="-2.3 lbs this month"
          icon={<Weight className="text-secondary text-xl" />}
          iconBgColor="bg-secondary/10"
        />
        <StatsCard
          title="Streak"
          value={`${(stats as any)?.streak || 0} days`}
          change="Personal best!"
          icon={<Calendar className="text-destructive text-xl" />}
          iconBgColor="bg-destructive/10"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Weight Progress Chart */}
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Weight Progress</h3>
            <select className="text-sm bg-background border border-border rounded px-3 py-1" data-testid="select-weight-period">
              <option>Last 30 Days</option>
              <option>Last 3 Months</option>
              <option>Last Year</option>
            </select>
          </div>
          <WeightChart data={weightData} />
        </div>

        {/* Workout Volume Chart */}
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Weekly Workout Volume</h3>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-primary rounded-full"></span>
              <span className="text-sm text-muted-foreground">Sets</span>
              <span className="w-3 h-3 bg-secondary rounded-full ml-4"></span>
              <span className="text-sm text-muted-foreground">Duration</span>
            </div>
          </div>
          <WorkoutChart data={workoutData} />
        </div>
      </div>

      {/* Today's Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Workout */}
        <div className="bg-card p-6 rounded-lg border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Today's Workout</h3>
          <div className="space-y-3">
            {(workouts as any[])?.slice(0, 2).map((workout: any) => (
              <div key={workout.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mr-3">
                    <Dumbbell className="text-primary-foreground text-sm" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{workout.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {workout.exercises?.length || 0} exercises
                    </p>
                  </div>
                </div>
                <span className="text-sm font-medium text-foreground">
                  {workout.duration ? `${workout.duration}m` : "-"}
                </span>
              </div>
            )) || (
              <p className="text-muted-foreground text-center py-4">No workouts today</p>
            )}
            <Button 
              className="w-full mt-4" 
              onClick={() => setWorkoutModalOpen(true)}
              data-testid="button-add-exercise"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Exercise
            </Button>
          </div>
        </div>

        {/* Nutrition Summary */}
        <div className="bg-card p-6 rounded-lg border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Nutrition Today</h3>
          <div className="space-y-4">
            {/* Calories Progress */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-foreground">Calories</span>
                <span className="text-sm text-muted-foreground" data-testid="text-calories-progress">
                  {nutritionTotals.calories} / 2,200
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-accent h-2 rounded-full" 
                  style={{ width: `${Math.min((nutritionTotals.calories / 2200) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
            {/* Protein Progress */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-foreground">Protein</span>
                <span className="text-sm text-muted-foreground" data-testid="text-protein-progress">
                  {nutritionTotals.protein.toFixed(1)}g / 150g
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full" 
                  style={{ width: `${Math.min((nutritionTotals.protein / 150) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
            {/* Carbs Progress */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-foreground">Carbs</span>
                <span className="text-sm text-muted-foreground" data-testid="text-carbs-progress">
                  {nutritionTotals.carbs.toFixed(1)}g / 220g
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-secondary h-2 rounded-full" 
                  style={{ width: `${Math.min((nutritionTotals.carbs / 220) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
            <Button 
              className="w-full mt-4 bg-secondary text-secondary-foreground hover:bg-secondary/90" 
              onClick={() => setNutritionModalOpen(true)}
              data-testid="button-log-meal"
            >
              <Plus className="w-4 h-4 mr-2" />
              Log Meal
            </Button>
          </div>
        </div>

        {/* Goals Progress */}
        <div className="bg-card p-6 rounded-lg border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Monthly Goals</h3>
          <div className="space-y-6">
            {/* Goal 1 */}
            <div className="text-center">
              <div className="relative w-20 h-20 mx-auto mb-2">
                <svg className="w-20 h-20 progress-ring" data-testid="progress-ring-weight">
                  <circle cx="40" cy="40" r="30" stroke="hsl(var(--muted))" strokeWidth="6" fill="transparent"/>
                  <circle cx="40" cy="40" r="30" stroke="hsl(var(--primary))" strokeWidth="6" fill="transparent" 
                          strokeDasharray="188.4" strokeDashoffset="37.68" className="progress-ring-fill"/>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-foreground">80%</span>
                </div>
              </div>
              <p className="text-sm font-medium text-foreground">Lose 5 lbs</p>
              <p className="text-xs text-muted-foreground">4/5 lbs lost</p>
            </div>

            {/* Goal 2 */}
            <div className="text-center">
              <div className="relative w-20 h-20 mx-auto mb-2">
                <svg className="w-20 h-20 progress-ring" data-testid="progress-ring-workouts">
                  <circle cx="40" cy="40" r="30" stroke="hsl(var(--muted))" strokeWidth="6" fill="transparent"/>
                  <circle cx="40" cy="40" r="30" stroke="hsl(var(--secondary))" strokeWidth="6" fill="transparent" 
                          strokeDasharray="188.4" strokeDashoffset="56.52" className="progress-ring-fill"/>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-foreground">70%</span>
                </div>
              </div>
              <p className="text-sm font-medium text-foreground">20 Workouts</p>
              <p className="text-xs text-muted-foreground">14/20 completed</p>
            </div>
          </div>
        </div>
      </div>

      <WorkoutModal open={workoutModalOpen} onOpenChange={setWorkoutModalOpen} />
      <NutritionModal open={nutritionModalOpen} onOpenChange={setNutritionModalOpen} />
    </div>
  );
}

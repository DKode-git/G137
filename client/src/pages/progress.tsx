import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import WeightChart from "@/components/charts/weight-chart";
import { Camera, Plus, Trophy, Medal, Star, Ruler, Import } from "lucide-react";

export default function Progress() {
  const { data: weightEntries, isLoading: weightLoading } = useQuery({
    queryKey: ["/api/weight"],
  });

  const { data: measurements } = useQuery({
    queryKey: ["/api/measurements"],
  });

  const { data: goals } = useQuery({
    queryKey: ["/api/goals"],
  });

  // Prepare weight chart data
  const weightData = (weightEntries as any[])?.map((entry: any) => ({
    date: entry.date,
    weight: parseFloat(entry.weight)
  })) || [];

  const currentWeight = (weightEntries as any[])?.length > 0 
    ? parseFloat((weightEntries as any[])[(weightEntries as any[]).length - 1].weight) 
    : null;
  
  const startingWeight = (weightEntries as any[])?.length > 0 
    ? parseFloat((weightEntries as any[])[0].weight) 
    : null;

  const weightLoss = startingWeight && currentWeight 
    ? (startingWeight - currentWeight).toFixed(1)
    : "0";

  // Mock measurement data
  const measurementData = [
    { name: "Waist", value: "32 in", change: "-1.5 in", icon: Import, color: "bg-primary" },
    { name: "Chest", value: "40 in", change: "+0.8 in", icon: Import, color: "bg-secondary" },
    { name: "Arms", value: "14.5 in", change: "+0.3 in", icon: Ruler, color: "bg-accent" },
    { name: "Thighs", value: "24 in", change: "-0.5 in", icon: Ruler, color: "bg-destructive" },
  ];

  // Mock goals data
  const mockGoals = [
    { title: "Lose 10 lbs", target: "March 31, 2024", progress: 70, completed: "7 lbs lost", remaining: "3 lbs remaining" },
    { title: "Bench Press 200 lbs", target: "April 15, 2024", progress: 85, completed: "Current max: 185 lbs", remaining: "15 lbs to go" },
    { title: "Run 5K under 25 minutes", target: "May 1, 2024", progress: 60, completed: "Current best: 27:30", remaining: "2:30 to improve" },
  ];

  const achievements = [
    { title: "7-Day Streak!", description: "Logged workouts for 7 days straight", icon: Trophy, color: "bg-accent" },
    { title: "New PR: Squats", description: "Personal record of 225 lbs achieved", icon: Medal, color: "bg-primary" },
    { title: "Nutrition Goal Met", description: "Hit protein target for 30 days", icon: Star, color: "bg-secondary" },
  ];

  if (weightLoading) {
    return <div className="text-center py-8">Loading progress data...</div>;
  }

  return (
    <div data-testid="page-progress">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-foreground">Progress Tracking</h2>
        <div className="flex space-x-3">
          <Button 
            variant="outline"
            className="bg-accent text-accent-foreground hover:bg-accent/90"
            data-testid="button-progress-photo"
          >
            <Camera className="w-4 h-4 mr-2" />
            Progress Photo
          </Button>
          <Button data-testid="button-log-measurement">
            <Plus className="w-4 h-4 mr-2" />
            Log Measurement
          </Button>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Weight Progress Chart */}
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-foreground">Weight Progress</h3>
            <select className="text-sm bg-background border border-border rounded px-3 py-1" data-testid="select-weight-period">
              <option>Last 3 Months</option>
              <option>Last 6 Months</option>
              <option>Last Year</option>
            </select>
          </div>
          {weightData.length > 0 ? (
            <>
              <WeightChart data={weightData} />
              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-foreground" data-testid="text-starting-weight">
                    {startingWeight} lbs
                  </p>
                  <p className="text-sm text-muted-foreground">Starting Weight</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground" data-testid="text-current-weight">
                    {currentWeight} lbs
                  </p>
                  <p className="text-sm text-muted-foreground">Current Weight</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-secondary" data-testid="text-weight-loss">
                    -{weightLoss} lbs
                  </p>
                  <p className="text-sm text-muted-foreground">Total Loss</p>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No weight entries yet</p>
              <Button data-testid="button-add-weight">
                <Plus className="w-4 h-4 mr-2" />
                Add Weight Entry
              </Button>
            </div>
          )}
        </div>

        {/* Body Measurements */}
        <div className="bg-card p-6 rounded-lg border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Body Measurements</h3>
          <div className="space-y-4">
            {measurementData.map((measurement, index) => (
              <div 
                key={index}
                className="flex justify-between items-center p-3 bg-muted rounded-lg"
                data-testid={`measurement-${measurement.name.toLowerCase()}`}
              >
                <div className="flex items-center">
                  <div className={`w-8 h-8 ${measurement.color} rounded-full flex items-center justify-center mr-3`}>
                    <measurement.icon className="text-primary-foreground text-sm" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{measurement.name}</p>
                    <p className="text-sm text-muted-foreground">Last updated 2 days ago</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-foreground">{measurement.value}</p>
                  <p className={`text-sm ${measurement.change.startsWith('+') ? 'text-accent' : 'text-secondary'}`}>
                    {measurement.change}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Goals & Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Goals */}
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-foreground">Current Goals</h3>
            <Button variant="ghost" size="sm" data-testid="button-add-goal">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-4">
            {mockGoals.map((goal, index) => (
              <div key={index} className="border border-border rounded-lg p-4" data-testid={`goal-${index}`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium text-foreground">{goal.title}</h4>
                    <p className="text-sm text-muted-foreground">Target: {goal.target}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    index === 0 ? 'bg-accent/10 text-accent' : 
                    index === 1 ? 'bg-primary/10 text-primary' : 
                    'bg-secondary/10 text-secondary'
                  }`}>
                    {goal.progress}% Complete
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 mb-2">
                  <div 
                    className={`h-2 rounded-full ${
                      index === 0 ? 'bg-accent' : 
                      index === 1 ? 'bg-primary' : 
                      'bg-secondary'
                    }`}
                    style={{ width: `${goal.progress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {goal.completed} • {goal.remaining}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Photos & Achievements */}
        <div className="space-y-6">
          {/* Progress Photos */}
          <div className="bg-card p-6 rounded-lg border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Progress Photos</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="relative group cursor-pointer">
                <img 
                  src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400" 
                  alt="Progress photo from 3 months ago" 
                  className="w-full h-24 object-cover rounded-lg"
                  data-testid="photo-3-months"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs font-medium">3 months ago</span>
                </div>
              </div>
              <div className="relative group cursor-pointer">
                <img 
                  src="https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400" 
                  alt="Progress photo from 1 month ago" 
                  className="w-full h-24 object-cover rounded-lg"
                  data-testid="photo-1-month"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs font-medium">1 month ago</span>
                </div>
              </div>
              <div className="border-2 border-dashed border-border rounded-lg h-24 flex items-center justify-center cursor-pointer hover:border-primary transition-colors" data-testid="button-add-photo">
                <div className="text-center">
                  <Camera className="text-muted-foreground text-lg mb-1 mx-auto" />
                  <p className="text-xs text-muted-foreground">Add Photo</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Achievements */}
          <div className="bg-card p-6 rounded-lg border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Recent Achievements</h3>
            <div className="space-y-3">
              {achievements.map((achievement, index) => (
                <div 
                  key={index}
                  className="flex items-center p-3 bg-muted rounded-lg"
                  data-testid={`achievement-${index}`}
                >
                  <div className={`w-10 h-10 ${achievement.color} rounded-full flex items-center justify-center mr-3`}>
                    <achievement.icon className="text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{achievement.title}</p>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

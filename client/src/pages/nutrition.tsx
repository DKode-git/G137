import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import NutritionChart from "@/components/charts/nutrition-chart";
import NutritionModal from "@/components/modals/nutrition-modal";
import { Plus, Sun, Moon, Egg, Apple, Drumstick } from "lucide-react";
import { format } from "date-fns";

export default function Nutrition() {
  const [nutritionModalOpen, setNutritionModalOpen] = useState(false);
  const [waterGlasses, setWaterGlasses] = useState(6);

  const today = format(new Date(), "yyyy-MM-dd");
  
  const { data: todaysMeals, isLoading } = useQuery({
    queryKey: ["/api/meals", { date: today }],
  });

  // Calculate daily nutrition totals
  const nutritionTotals = (todaysMeals as any[])?.reduce((acc: any, meal: any) => ({
    calories: acc.calories + meal.calories,
    protein: acc.protein + parseFloat(meal.protein || 0),
    carbs: acc.carbs + parseFloat(meal.carbs || 0),
    fats: acc.fats + parseFloat(meal.fats || 0),
  }), { calories: 0, protein: 0, carbs: 0, fats: 0 }) || { calories: 0, protein: 0, carbs: 0, fats: 0 };

  // Mock nutrition chart data
  const nutritionChartData = [
    { day: "Mon", calories: 2100 },
    { day: "Tue", calories: 1950 },
    { day: "Wed", calories: 2200 },
    { day: "Thu", calories: 1800 },
    { day: "Fri", calories: 2050 },
    { day: "Sat", calories: 2300 },
    { day: "Sun", calories: 1900 },
  ];

  // Group meals by type
  const mealsByType = (todaysMeals as any[])?.reduce((acc: any, meal: any) => {
    if (!acc[meal.type]) acc[meal.type] = [];
    acc[meal.type].push(meal);
    return acc;
  }, {}) || {};

  const frequentFoods = [
    { name: "Eggs", calories: 70, icon: Egg, color: "bg-accent" },
    { name: "Apple", calories: 95, icon: Apple, color: "bg-secondary" },
    { name: "Chicken", calories: 185, icon: Drumstick, color: "bg-primary" },
    { name: "Almonds", calories: 160, icon: Apple, color: "bg-accent" },
  ];

  const addWaterGlass = () => {
    if (waterGlasses < 8) {
      setWaterGlasses(waterGlasses + 1);
    }
  };

  const getMealIcon = (type: string) => {
    switch (type) {
      case "breakfast":
        return <Sun className="text-accent mr-2" />;
      case "lunch":
        return <Sun className="text-accent mr-2" />;
      case "dinner":
        return <Moon className="text-primary mr-2" />;
      default:
        return <Sun className="text-accent mr-2" />;
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading nutrition data...</div>;
  }

  return (
    <div data-testid="page-nutrition">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-foreground">Nutrition Tracking</h2>
        <Button 
          onClick={() => setNutritionModalOpen(true)}
          className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
          data-testid="button-log-meal"
        >
          <Plus className="w-4 h-4 mr-2" />
          Log Meal
        </Button>
      </div>

      {/* Daily Nutrition Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Calories Overview */}
        <div className="bg-card p-6 rounded-lg border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Daily Calories</h3>
          <div className="text-center">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg className="w-32 h-32 progress-ring" data-testid="calories-ring">
                <circle cx="64" cy="64" r="50" stroke="hsl(var(--muted))" strokeWidth="8" fill="transparent"/>
                <circle 
                  cx="64" 
                  cy="64" 
                  r="50" 
                  stroke="hsl(var(--accent))" 
                  strokeWidth="8" 
                  fill="transparent"
                  strokeDasharray="314.16" 
                  strokeDashoffset={314.16 - (314.16 * Math.min(nutritionTotals.calories / 2200, 1))}
                  className="progress-ring-fill"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground" data-testid="text-calories-total">
                    {nutritionTotals.calories}
                  </div>
                  <div className="text-xs text-muted-foreground">/ 2,200</div>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {2200 - nutritionTotals.calories} calories remaining
            </p>
          </div>
        </div>

        {/* Macros Breakdown */}
        <div className="bg-card p-6 rounded-lg border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Macronutrients</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-primary rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-foreground">Protein</span>
                </div>
                <span className="text-sm text-muted-foreground" data-testid="text-protein-total">
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

            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-secondary rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-foreground">Carbs</span>
                </div>
                <span className="text-sm text-muted-foreground" data-testid="text-carbs-total">
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

            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-accent rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-foreground">Fats</span>
                </div>
                <span className="text-sm text-muted-foreground" data-testid="text-fats-total">
                  {nutritionTotals.fats.toFixed(1)}g / 80g
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-accent h-2 rounded-full" 
                  style={{ width: `${Math.min((nutritionTotals.fats / 80) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Water Intake */}
        <div className="bg-card p-6 rounded-lg border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Water Intake</h3>
          <div className="text-center">
            <div className="relative w-20 h-32 mx-auto mb-4 bg-muted rounded-full overflow-hidden">
              <div 
                className="absolute bottom-0 w-full bg-gradient-to-t from-blue-400 to-blue-300 rounded-full transition-all duration-500" 
                style={{ height: `${(waterGlasses / 8) * 100}%` }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-foreground z-10" data-testid="text-water-glasses">
                  {waterGlasses}/8
                </span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-3">glasses (8oz each)</p>
            <Button
              onClick={addWaterGlass}
              disabled={waterGlasses >= 8}
              className="bg-blue-500 text-white hover:bg-blue-600"
              data-testid="button-add-water"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Glass
            </Button>
          </div>
        </div>
      </div>

      {/* Meal Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Meals */}
        <div className="bg-card p-6 rounded-lg border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Today's Meals</h3>
          <div className="space-y-4">
            {["breakfast", "lunch", "dinner", "snack"].map((mealType) => (
              <div key={mealType} className="border border-border rounded-lg p-4" data-testid={`meals-${mealType}`}>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-foreground flex items-center capitalize">
                    {getMealIcon(mealType)}
                    {mealType}
                  </h4>
                  <span className="text-sm font-medium text-foreground">
                    {mealsByType[mealType]?.reduce((sum: number, meal: any) => sum + meal.calories, 0) || 0} cal
                  </span>
                </div>
                <div className="space-y-2">
                  {mealsByType[mealType]?.length > 0 ? (
                    mealsByType[mealType].map((meal: any) => (
                      <div key={meal.id} className="flex justify-between items-center text-sm">
                        <span className="text-foreground">{meal.name}</span>
                        <span className="text-muted-foreground">{meal.calories} cal</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No meals logged</p>
                  )}
                </div>
              </div>
            ))}

            <Button 
              variant="outline" 
              className="w-full border-2 border-dashed"
              onClick={() => setNutritionModalOpen(true)}
              data-testid="button-add-meal"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Meal
            </Button>
          </div>
        </div>

        {/* Nutrition Insights */}
        <div className="space-y-6">
          {/* Weekly Nutrition Chart */}
          <div className="bg-card p-6 rounded-lg border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Weekly Nutrition Trends</h3>
            <NutritionChart data={nutritionChartData} />
          </div>

          {/* Quick Add Foods */}
          <div className="bg-card p-6 rounded-lg border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Frequent Foods</h3>
            <div className="grid grid-cols-2 gap-3">
              {frequentFoods.map((food, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="flex items-center justify-between p-3 h-auto"
                  data-testid={`button-quick-add-${food.name.toLowerCase()}`}
                >
                  <div className="flex items-center">
                    <div className={`w-8 h-8 ${food.color} rounded-full flex items-center justify-center mr-3`}>
                      <food.icon className="text-white text-sm" />
                    </div>
                    <span className="text-sm font-medium text-foreground">{food.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{food.calories} cal</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <NutritionModal open={nutritionModalOpen} onOpenChange={setNutritionModalOpen} />
    </div>
  );
}

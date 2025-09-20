import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertWorkoutSchema, 
  insertExerciseSchema, 
  insertMealSchema, 
  insertWeightEntrySchema, 
  insertMeasurementSchema,
  insertGoalSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // For demo purposes, we'll use a dummy user ID
  const DEMO_USER_ID = "demo-user";

  // Workouts
  app.get("/api/workouts", async (req, res) => {
    try {
      const workouts = await storage.getWorkouts(DEMO_USER_ID);
      
      // Get exercises for each workout
      const workoutsWithExercises = await Promise.all(
        workouts.map(async (workout) => {
          const exercises = await storage.getExercisesByWorkout(workout.id);
          return { ...workout, exercises };
        })
      );
      
      res.json(workoutsWithExercises);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workouts" });
    }
  });

  app.post("/api/workouts", async (req, res) => {
    try {
      const { exercises, ...workoutData } = req.body;
      
      // Validate workout data
      const validatedWorkout = insertWorkoutSchema.parse(workoutData);
      
      // Create workout
      const workout = await storage.createWorkout(DEMO_USER_ID, validatedWorkout);
      
      // Create exercises if provided
      const createdExercises = [];
      if (exercises && Array.isArray(exercises)) {
        for (const exercise of exercises) {
          const validatedExercise = insertExerciseSchema.parse(exercise);
          const createdExercise = await storage.createExercise(workout.id, validatedExercise);
          createdExercises.push(createdExercise);
        }
      }
      
      res.json({ ...workout, exercises: createdExercises });
    } catch (error) {
      res.status(400).json({ message: "Failed to create workout" });
    }
  });

  app.delete("/api/workouts/:id", async (req, res) => {
    try {
      await storage.deleteWorkout(req.params.id);
      res.json({ message: "Workout deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete workout" });
    }
  });

  // Meals
  app.get("/api/meals", async (req, res) => {
    try {
      const { date } = req.query;
      const meals = await storage.getMeals(DEMO_USER_ID, date as string);
      res.json(meals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch meals" });
    }
  });

  app.post("/api/meals", async (req, res) => {
    try {
      const validatedMeal = insertMealSchema.parse(req.body);
      const meal = await storage.createMeal(DEMO_USER_ID, validatedMeal);
      res.json(meal);
    } catch (error) {
      res.status(400).json({ message: "Failed to create meal" });
    }
  });

  app.delete("/api/meals/:id", async (req, res) => {
    try {
      await storage.deleteMeal(req.params.id);
      res.json({ message: "Meal deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete meal" });
    }
  });

  // Weight entries
  app.get("/api/weight", async (req, res) => {
    try {
      const entries = await storage.getWeightEntries(DEMO_USER_ID);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch weight entries" });
    }
  });

  app.post("/api/weight", async (req, res) => {
    try {
      const validatedEntry = insertWeightEntrySchema.parse(req.body);
      const entry = await storage.createWeightEntry(DEMO_USER_ID, validatedEntry);
      res.json(entry);
    } catch (error) {
      res.status(400).json({ message: "Failed to create weight entry" });
    }
  });

  // Measurements
  app.get("/api/measurements", async (req, res) => {
    try {
      const measurements = await storage.getMeasurements(DEMO_USER_ID);
      res.json(measurements);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch measurements" });
    }
  });

  app.post("/api/measurements", async (req, res) => {
    try {
      const validatedMeasurement = insertMeasurementSchema.parse(req.body);
      const measurement = await storage.createMeasurement(DEMO_USER_ID, validatedMeasurement);
      res.json(measurement);
    } catch (error) {
      res.status(400).json({ message: "Failed to create measurement" });
    }
  });

  // Goals
  app.get("/api/goals", async (req, res) => {
    try {
      const goals = await storage.getGoals(DEMO_USER_ID);
      res.json(goals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch goals" });
    }
  });

  app.post("/api/goals", async (req, res) => {
    try {
      const validatedGoal = insertGoalSchema.parse(req.body);
      const goal = await storage.createGoal(DEMO_USER_ID, validatedGoal);
      res.json(goal);
    } catch (error) {
      res.status(400).json({ message: "Failed to create goal" });
    }
  });

  app.patch("/api/goals/:id", async (req, res) => {
    try {
      const goal = await storage.updateGoal(req.params.id, req.body);
      if (!goal) {
        return res.status(404).json({ message: "Goal not found" });
      }
      res.json(goal);
    } catch (error) {
      res.status(400).json({ message: "Failed to update goal" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const today = new Date().toDateString();
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 7);

      // Get today's meals for calories
      const todaysMeals = await storage.getMeals(DEMO_USER_ID, today);
      const todayCalories = todaysMeals.reduce((sum, meal) => sum + meal.calories, 0);

      // Get this week's workouts
      const allWorkouts = await storage.getWorkouts(DEMO_USER_ID);
      const weeklyWorkouts = allWorkouts.filter(
        workout => new Date(workout.date) >= weekStart
      ).length;

      // Get latest weight
      const weightEntries = await storage.getWeightEntries(DEMO_USER_ID);
      const currentWeight = weightEntries.length > 0 ? weightEntries[weightEntries.length - 1].weight : null;

      // Calculate streak (simplified - consecutive days with workouts)
      let streak = 0;
      const sortedWorkouts = allWorkouts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const workoutDates = new Set(sortedWorkouts.map(w => new Date(w.date).toDateString()));
      
      let currentDate = new Date();
      while (workoutDates.has(currentDate.toDateString())) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      }

      res.json({
        todayCalories,
        weeklyWorkouts,
        currentWeight,
        streak
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

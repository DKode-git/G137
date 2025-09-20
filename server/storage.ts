import { 
  type User, 
  type InsertUser,
  type Workout,
  type InsertWorkout,
  type Exercise,
  type InsertExercise,
  type Meal,
  type InsertMeal,
  type WeightEntry,
  type InsertWeightEntry,
  type Measurement,
  type InsertMeasurement,
  type Goal,
  type InsertGoal
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Workout operations
  getWorkouts(userId: string): Promise<Workout[]>;
  getWorkout(id: string): Promise<Workout | undefined>;
  createWorkout(userId: string, workout: InsertWorkout): Promise<Workout>;
  deleteWorkout(id: string): Promise<void>;

  // Exercise operations
  getExercisesByWorkout(workoutId: string): Promise<Exercise[]>;
  createExercise(workoutId: string, exercise: InsertExercise): Promise<Exercise>;

  // Meal operations
  getMeals(userId: string, date?: string): Promise<Meal[]>;
  createMeal(userId: string, meal: InsertMeal): Promise<Meal>;
  deleteMeal(id: string): Promise<void>;

  // Weight tracking
  getWeightEntries(userId: string): Promise<WeightEntry[]>;
  createWeightEntry(userId: string, entry: InsertWeightEntry): Promise<WeightEntry>;

  // Measurements
  getMeasurements(userId: string): Promise<Measurement[]>;
  createMeasurement(userId: string, measurement: InsertMeasurement): Promise<Measurement>;

  // Goals
  getGoals(userId: string): Promise<Goal[]>;
  createGoal(userId: string, goal: InsertGoal): Promise<Goal>;
  updateGoal(id: string, updates: Partial<Goal>): Promise<Goal | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private workouts: Map<string, Workout>;
  private exercises: Map<string, Exercise>;
  private meals: Map<string, Meal>;
  private weightEntries: Map<string, WeightEntry>;
  private measurements: Map<string, Measurement>;
  private goals: Map<string, Goal>;

  constructor() {
    this.users = new Map();
    this.workouts = new Map();
    this.exercises = new Map();
    this.meals = new Map();
    this.weightEntries = new Map();
    this.measurements = new Map();
    this.goals = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getWorkouts(userId: string): Promise<Workout[]> {
    return Array.from(this.workouts.values())
      .filter(workout => workout.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getWorkout(id: string): Promise<Workout | undefined> {
    return this.workouts.get(id);
  }

  async createWorkout(userId: string, insertWorkout: InsertWorkout): Promise<Workout> {
    const id = randomUUID();
    const workout: Workout = {
      ...insertWorkout,
      id,
      userId,
      date: new Date(),
      duration: insertWorkout.duration ?? null,
      notes: insertWorkout.notes ?? null,
    };
    this.workouts.set(id, workout);
    return workout;
  }

  async deleteWorkout(id: string): Promise<void> {
    this.workouts.delete(id);
    // Also delete associated exercises
    Array.from(this.exercises.entries()).forEach(([exerciseId, exercise]) => {
      if (exercise.workoutId === id) {
        this.exercises.delete(exerciseId);
      }
    });
  }

  async getExercisesByWorkout(workoutId: string): Promise<Exercise[]> {
    return Array.from(this.exercises.values())
      .filter(exercise => exercise.workoutId === workoutId);
  }

  async createExercise(workoutId: string, insertExercise: InsertExercise): Promise<Exercise> {
    const id = randomUUID();
    const exercise: Exercise = {
      ...insertExercise,
      id,
      workoutId,
      notes: insertExercise.notes ?? null,
      weight: insertExercise.weight ?? null,
    };
    this.exercises.set(id, exercise);
    return exercise;
  }

  async getMeals(userId: string, date?: string): Promise<Meal[]> {
    let meals = Array.from(this.meals.values())
      .filter(meal => meal.userId === userId);

    if (date) {
      const targetDate = new Date(date).toDateString();
      meals = meals.filter(meal => new Date(meal.date).toDateString() === targetDate);
    }

    return meals.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async createMeal(userId: string, insertMeal: InsertMeal): Promise<Meal> {
    const id = randomUUID();
    const meal: Meal = {
      ...insertMeal,
      id,
      userId,
      date: new Date(),
      protein: insertMeal.protein ?? null,
      carbs: insertMeal.carbs ?? null,
      fats: insertMeal.fats ?? null,
    };
    this.meals.set(id, meal);
    return meal;
  }

  async deleteMeal(id: string): Promise<void> {
    this.meals.delete(id);
  }

  async getWeightEntries(userId: string): Promise<WeightEntry[]> {
    return Array.from(this.weightEntries.values())
      .filter(entry => entry.userId === userId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  async createWeightEntry(userId: string, insertEntry: InsertWeightEntry): Promise<WeightEntry> {
    const id = randomUUID();
    const entry: WeightEntry = {
      ...insertEntry,
      id,
      userId,
      date: new Date(),
    };
    this.weightEntries.set(id, entry);
    return entry;
  }

  async getMeasurements(userId: string): Promise<Measurement[]> {
    return Array.from(this.measurements.values())
      .filter(measurement => measurement.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async createMeasurement(userId: string, insertMeasurement: InsertMeasurement): Promise<Measurement> {
    const id = randomUUID();
    const measurement: Measurement = {
      ...insertMeasurement,
      id,
      userId,
      date: new Date(),
      waist: insertMeasurement.waist ?? null,
      chest: insertMeasurement.chest ?? null,
      arms: insertMeasurement.arms ?? null,
      thighs: insertMeasurement.thighs ?? null,
    };
    this.measurements.set(id, measurement);
    return measurement;
  }

  async getGoals(userId: string): Promise<Goal[]> {
    return Array.from(this.goals.values())
      .filter(goal => goal.userId === userId)
      .sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime());
  }

  async createGoal(userId: string, insertGoal: InsertGoal): Promise<Goal> {
    const id = randomUUID();
    const goal: Goal = {
      ...insertGoal,
      id,
      userId,
      description: insertGoal.description ?? null,
      currentValue: insertGoal.currentValue ?? null,
      completed: insertGoal.completed ?? null,
    };
    this.goals.set(id, goal);
    return goal;
  }

  async updateGoal(id: string, updates: Partial<Goal>): Promise<Goal | undefined> {
    const goal = this.goals.get(id);
    if (!goal) return undefined;

    const updatedGoal = { ...goal, ...updates };
    this.goals.set(id, updatedGoal);
    return updatedGoal;
  }
}

export const storage = new MemStorage();

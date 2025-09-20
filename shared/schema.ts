import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const workouts = pgTable("workouts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  duration: integer("duration"), // minutes
  date: timestamp("date").notNull().defaultNow(),
  notes: text("notes"),
});

export const exercises = pgTable("exercises", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workoutId: varchar("workout_id").notNull(),
  name: text("name").notNull(),
  sets: integer("sets").notNull(),
  reps: integer("reps").notNull(),
  weight: decimal("weight", { precision: 5, scale: 2 }), // pounds
  notes: text("notes"),
});

export const meals = pgTable("meals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(), // breakfast, lunch, dinner, snack
  date: timestamp("date").notNull().defaultNow(),
  calories: integer("calories").notNull(),
  protein: decimal("protein", { precision: 5, scale: 2 }), // grams
  carbs: decimal("carbs", { precision: 5, scale: 2 }), // grams
  fats: decimal("fats", { precision: 5, scale: 2 }), // grams
});

export const weightEntries = pgTable("weight_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  weight: decimal("weight", { precision: 5, scale: 2 }).notNull(), // pounds
  date: timestamp("date").notNull().defaultNow(),
});

export const measurements = pgTable("measurements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  waist: decimal("waist", { precision: 5, scale: 2 }), // inches
  chest: decimal("chest", { precision: 5, scale: 2 }), // inches
  arms: decimal("arms", { precision: 5, scale: 2 }), // inches
  thighs: decimal("thighs", { precision: 5, scale: 2 }), // inches
  date: timestamp("date").notNull().defaultNow(),
});

export const goals = pgTable("goals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  targetValue: decimal("target_value", { precision: 8, scale: 2 }).notNull(),
  currentValue: decimal("current_value", { precision: 8, scale: 2 }).default('0'),
  unit: text("unit").notNull(), // lbs, reps, minutes, etc.
  targetDate: timestamp("target_date").notNull(),
  completed: integer("completed").default(0), // 0 or 1 for boolean
});

// Insert schemas
export const insertWorkoutSchema = createInsertSchema(workouts).omit({
  id: true,
  userId: true,
  date: true,
});

export const insertExerciseSchema = createInsertSchema(exercises).omit({
  id: true,
  workoutId: true,
});

export const insertMealSchema = createInsertSchema(meals).omit({
  id: true,
  userId: true,
  date: true,
});

export const insertWeightEntrySchema = createInsertSchema(weightEntries).omit({
  id: true,
  userId: true,
  date: true,
});

export const insertMeasurementSchema = createInsertSchema(measurements).omit({
  id: true,
  userId: true,
  date: true,
});

export const insertGoalSchema = createInsertSchema(goals).omit({
  id: true,
  userId: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Workout = typeof workouts.$inferSelect;
export type InsertWorkout = z.infer<typeof insertWorkoutSchema>;
export type Exercise = typeof exercises.$inferSelect;
export type InsertExercise = z.infer<typeof insertExerciseSchema>;
export type Meal = typeof meals.$inferSelect;
export type InsertMeal = z.infer<typeof insertMealSchema>;
export type WeightEntry = typeof weightEntries.$inferSelect;
export type InsertWeightEntry = z.infer<typeof insertWeightEntrySchema>;
export type Measurement = typeof measurements.$inferSelect;
export type InsertMeasurement = z.infer<typeof insertMeasurementSchema>;
export type Goal = typeof goals.$inferSelect;
export type InsertGoal = z.infer<typeof insertGoalSchema>;

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

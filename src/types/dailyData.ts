import { Task } from './task';

export type DailyMeta = {
  caloriesGoal: number;
  proteinGoal: number;
  fatGoal: number;
  carbsGoal: number;

  weight?: number;
  weightGoal?: number;
};

export type DailyData = {
  user_id: string;
  day_key: string;
  tasks: Task[];
  meta: DailyMeta;
  updated_at: string;
};
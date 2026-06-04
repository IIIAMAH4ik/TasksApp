import { CategoryKey } from './category';

export type Nutrition = {
  calories?: number;
  protein?: number;
  fat?: number;
  carbs?: number;
};

export type Task = {
  id: string;
  title: string;
  categoryKey: CategoryKey;

  done: boolean;

  expectedCount?: number;
  expectedTime?: number;

  actualCount?: number;
  actualTime?: number;

  nutrition?: Nutrition;

  isGlobal?: boolean;
  globalId?: string;

  createdAt: string;
  updatedAt: string;
};
import {
  getLocalCategories,
  getLocalGlobalTasks,
  saveLocalCategories,
  saveLocalGlobalTasks,
} from '@/services/localfileservice';
import { Category } from '@/types/category';
import { Task } from '@/types/task';

export async function getUserSettings(_userId: string): Promise<Category[]> {
  return getLocalCategories();
}

export async function saveUserSettings(
  _userId: string,
  categories: Category[]
) {
  await saveLocalCategories(categories);
}

export async function getGlobalTasks(_userId: string): Promise<Task[]> {
  return getLocalGlobalTasks();
}

export async function saveGlobalTasks(
  _userId: string,
  globalTasks: Task[]
) {
  await saveLocalGlobalTasks(globalTasks);
}
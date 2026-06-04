import { defaultCategories } from '@/constants/categories';
import { supabase } from '@/lib/supabase';
import { Category } from '@/types/category';
import { Task } from '@/types/task';

type UserSettingsRow = {
  user_id: string;
  categories: Category[];
  global_tasks?: Task[];
  updated_at: string;
};

export async function getUserSettings(userId: string): Promise<Category[]> {
  const { data, error } = await supabase
    .from('user_settings')
    .select('user_id, categories, updated_at')
    .eq('user_id', userId)
    .maybeSingle<UserSettingsRow>();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    await saveUserSettings(userId, defaultCategories);
    return defaultCategories;
  }

  if (!Array.isArray(data.categories)) {
    await saveUserSettings(userId, defaultCategories);
    return defaultCategories;
  }

  return data.categories;
}

export async function saveUserSettings(userId: string, categories: Category[]) {
  const row: UserSettingsRow = {
    user_id: userId,
    categories,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('user_settings')
    .upsert(row, {
      onConflict: 'user_id',
    });

  if (error) {
    throw new Error(error.message);
  }
}

export async function getGlobalTasks(userId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from('user_settings')
    .select('global_tasks')
    .eq('user_id', userId)
    .maybeSingle<{ global_tasks: Task[] | null }>();

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.global_tasks || !Array.isArray(data.global_tasks)) {
    return [];
  }

  return data.global_tasks;
}

export async function saveGlobalTasks(userId: string, globalTasks: Task[]) {
  const { error } = await supabase
    .from('user_settings')
    .update({
      global_tasks: globalTasks,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  if (error) {
    throw new Error(error.message);
  }
}
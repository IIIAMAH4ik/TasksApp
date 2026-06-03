import { defaultCategories } from '@/constants/categories';
import { supabase } from '@/lib/supabase';
import { Category } from '@/types/category';

type UserSettingsRow = {
  user_id: string;
  categories: Category[];
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
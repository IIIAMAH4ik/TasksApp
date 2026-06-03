import { createDefaultAutoTasks } from '@/constants/autoTasks';
import { defaultDailyMeta } from '@/constants/dailyMeta';
import { supabase } from '@/lib/supabase';
import { DailyData, DailyMeta } from '@/types/dailyData';
import { Task } from '@/types/task';

type DailyDataRow = {
  user_id: string;
  day_key: string;
  tasks: Task[];
  meta: DailyMeta;
  updated_at: string;
};

function mergeAutoTasks(tasks: Task[]): Task[] {
  const autoTasks = createDefaultAutoTasks();

  const existingIds = new Set(tasks.map((task) => task.id));

  const missingAutoTasks = autoTasks.filter((task) => !existingIds.has(task.id));

  return [...missingAutoTasks, ...tasks];
}

function createEmptyDailyData(userId: string, dayKey: string): DailyData {
  return {
    user_id: userId,
    day_key: dayKey,
    tasks: createDefaultAutoTasks(),
    meta: defaultDailyMeta,
    updated_at: new Date().toISOString(),
  };
}

export async function getDailyData(userId: string, dayKey: string): Promise<DailyData> {
  const { data, error } = await supabase
    .from('daily_data')
    .select('user_id, day_key, tasks, meta, updated_at')
    .eq('user_id', userId)
    .eq('day_key', dayKey)
    .maybeSingle<DailyDataRow>();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    const emptyDay = createEmptyDailyData(userId, dayKey);
    await saveDailyData(emptyDay);
    return emptyDay;
  }

  const normalizedDay: DailyData = {
    user_id: data.user_id,
    day_key: data.day_key,
    tasks: mergeAutoTasks(Array.isArray(data.tasks) ? data.tasks : []),
    meta: {
      ...defaultDailyMeta,
      ...(data.meta ?? {}),
    },
    updated_at: data.updated_at,
  };

  return normalizedDay;
}

export async function saveDailyData(dailyData: DailyData) {
  const row: DailyDataRow = {
    user_id: dailyData.user_id,
    day_key: dailyData.day_key,
    tasks: dailyData.tasks,
    meta: dailyData.meta,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('daily_data')
    .upsert(row, {
      onConflict: 'user_id,day_key',
    });

  if (error) {
    throw new Error(error.message);
  }
}
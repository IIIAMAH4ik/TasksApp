import * as FileSystem from 'expo-file-system/legacy';

import { createDefaultAutoTasks } from '@/constants/autoTasks';
import { defaultCategories } from '@/constants/categories';
import { defaultDailyMeta } from '@/constants/dailyMeta';
import { Category } from '@/types/category';
import { DailyData, DailyMeta } from '@/types/dailyData';
import { Task } from '@/types/task';

const storageRoot = `${FileSystem.documentDirectory}my-tasks-data/`;
const daysDirectory = `${storageRoot}days/`;

const settingsFile = `${storageRoot}settings.json`;
const globalTasksFile = `${storageRoot}global-tasks.json`;

type LocalSettings = {
  categories: Category[];
  hasCompletedOnboarding?: boolean;
  updated_at: string;
};

async function ensureDirectoryExists(directoryUri: string) {
  const info = await FileSystem.getInfoAsync(directoryUri);

  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(directoryUri, {
      intermediates: true,
    });
  }
}

export async function ensureLocalStorageReady() {
  await ensureDirectoryExists(storageRoot);
  await ensureDirectoryExists(daysDirectory);
}

async function readJsonFile<T>(fileUri: string, fallback: T): Promise<T> {
  await ensureLocalStorageReady();

  const info = await FileSystem.getInfoAsync(fileUri);

  if (!info.exists) {
    return fallback;
  }

  const rawContent = await FileSystem.readAsStringAsync(fileUri);

  if (!rawContent.trim()) {
    return fallback;
  }

  try {
    return JSON.parse(rawContent) as T;
  } catch (error) {
    console.log('local json parse error:', fileUri, error);
    return fallback;
  }
}

async function writeJsonFile<T>(fileUri: string, data: T) {
  await ensureLocalStorageReady();

  await FileSystem.writeAsStringAsync(
    fileUri,
    JSON.stringify(data, null, 2)
  );
}

function getDayFile(dayKey: string) {
  return `${daysDirectory}${dayKey}.json`;
}

function mergeAutoTasks(tasks: Task[]): Task[] {
  const autoTasks = createDefaultAutoTasks();
  const existingIds = new Set(tasks.map((task) => task.id));
  const missingAutoTasks = autoTasks.filter((task) => !existingIds.has(task.id));

  return [...missingAutoTasks, ...tasks];
}

function mergeGlobalTasks(
  tasks: Task[],
  globalTasks: Task[],
  hiddenGlobalTaskIds: string[] = []
): Task[] {
  const existingGlobalIds = new Set(
    tasks
      .filter((task) => task.globalId)
      .map((task) => task.globalId)
  );

  const hiddenIds = new Set(hiddenGlobalTaskIds);

  const missingGlobalTasks = globalTasks
    .filter((task) => {
      const globalId = task.globalId ?? task.id;

      if (hiddenIds.has(globalId)) {
        return false;
      }

      return !existingGlobalIds.has(globalId);
    })
    .map((task) => ({
      ...task,
      id: task.globalId ?? task.id,
      done: false,
      actualCount: task.expectedCount ? 0 : undefined,
      actualTime: task.expectedTime ? 0 : undefined,
      isGlobal: true,
      globalId: task.globalId ?? task.id,
      updatedAt: new Date().toISOString(),
    }));

  return [...missingGlobalTasks, ...tasks];
}

function createEmptyDailyData(dayKey: string): DailyData {
  return {
    user_id: 'local',
    day_key: dayKey,
    tasks: createDefaultAutoTasks(),
    meta: defaultDailyMeta,
    updated_at: new Date().toISOString(),
  };
}

export async function getLocalDailyData(dayKey: string): Promise<DailyData> {
  const globalTasks = await getLocalGlobalTasks();

  const fallbackDay = createEmptyDailyData(dayKey);

  const savedDay = await readJsonFile<DailyData | null>(
    getDayFile(dayKey),
    null
  );

  if (!savedDay) {
    return {
      ...fallbackDay,
      tasks: mergeGlobalTasks(
        fallbackDay.tasks,
        globalTasks,
        fallbackDay.meta.hiddenGlobalTaskIds ?? []
      ),
    };
  }

  const normalizedMeta: DailyMeta = {
    ...defaultDailyMeta,
    ...(savedDay.meta ?? {}),
    hiddenGlobalTaskIds: Array.isArray(savedDay.meta?.hiddenGlobalTaskIds)
      ? savedDay.meta.hiddenGlobalTaskIds
      : [],
  };

  return {
    ...savedDay,
    user_id: 'local',
    day_key: dayKey,
    tasks: mergeGlobalTasks(
      mergeAutoTasks(Array.isArray(savedDay.tasks) ? savedDay.tasks : []),
      globalTasks,
      normalizedMeta.hiddenGlobalTaskIds
    ),
    meta: normalizedMeta,
    updated_at: savedDay.updated_at ?? new Date().toISOString(),
  };
}

export async function saveLocalDailyData(dailyData: DailyData) {
  const nextDailyData: DailyData = {
    ...dailyData,
    user_id: 'local',
    updated_at: new Date().toISOString(),
  };

  await writeJsonFile(getDayFile(dailyData.day_key), nextDailyData);
}

export async function getLocalCategories(): Promise<Category[]> {
  const settings = await readJsonFile<LocalSettings | null>(
    settingsFile,
    null
  );

  if (!settings || !Array.isArray(settings.categories)) {
    await saveLocalCategories(defaultCategories);
    return defaultCategories;
  }

  return settings.categories;
}

export async function saveLocalCategories(categories: Category[]) {
  const currentSettings = await readJsonFile<LocalSettings | null>(
    settingsFile,
    null
  );

  const settings: LocalSettings = {
    categories,
    hasCompletedOnboarding: currentSettings?.hasCompletedOnboarding ?? false,
    updated_at: new Date().toISOString(),
  };

  await writeJsonFile(settingsFile, settings);
}

export async function getLocalOnboardingCompleted(): Promise<boolean> {
  const settings = await readJsonFile<LocalSettings | null>(
    settingsFile,
    null
  );

  return settings?.hasCompletedOnboarding === true;
}

export async function saveLocalOnboardingCompleted(value: boolean) {
  const currentSettings = await readJsonFile<LocalSettings | null>(
    settingsFile,
    null
  );

  const nextSettings: LocalSettings = {
    categories: currentSettings?.categories ?? defaultCategories,
    hasCompletedOnboarding: value,
    updated_at: new Date().toISOString(),
  };

  await writeJsonFile(settingsFile, nextSettings);
}

export async function getLocalGlobalTasks(): Promise<Task[]> {
  const globalTasks = await readJsonFile<Task[]>(
    globalTasksFile,
    []
  );

  if (!Array.isArray(globalTasks)) {
    return [];
  }

  return globalTasks;
}

export async function saveLocalGlobalTasks(globalTasks: Task[]) {
  await writeJsonFile(globalTasksFile, globalTasks);
}
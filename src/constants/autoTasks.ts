import { Task } from '@/types/task';

function createAutoTask(params: {
  id: string;
  title: string;
  categoryKey: string;
  expectedCount?: number;
  expectedTime?: number;
}): Task {
  const now = new Date().toISOString();

  return {
    id: params.id,
    title: params.title,
    categoryKey: params.categoryKey,

    done: false,

    expectedCount: params.expectedCount,
    expectedTime: params.expectedTime,

    actualCount: undefined,
    actualTime: undefined,

    createdAt: now,
    updatedAt: now,
  };
}

export function createDefaultAutoTasks(): Task[] {
  return [
    createAutoTask({
      id: 'auto-sport-steps',
      title: 'Шаги',
      categoryKey: 'sport',
      expectedCount: 10000,
    }),

    createAutoTask({
      id: 'auto-prayer-fajr',
      title: 'Фаджр',
      categoryKey: 'prayer',
    }),
    createAutoTask({
      id: 'auto-prayer-dhuhr',
      title: 'Зухр',
      categoryKey: 'prayer',
    }),
    createAutoTask({
      id: 'auto-prayer-asr',
      title: 'Аср',
      categoryKey: 'prayer',
    }),
    createAutoTask({
      id: 'auto-prayer-maghrib',
      title: 'Магриб',
      categoryKey: 'prayer',
    }),
    createAutoTask({
      id: 'auto-prayer-isha',
      title: 'Иша',
      categoryKey: 'prayer',
    }),
  ];
}
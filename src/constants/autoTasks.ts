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
  return [];
}
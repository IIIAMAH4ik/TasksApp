import { Task } from '@/types/task';

export function getTaskIsDone(task: Task): boolean {
  const hasExpectedCount = typeof task.expectedCount === 'number' && task.expectedCount > 0;
  const hasExpectedTime = typeof task.expectedTime === 'number' && task.expectedTime > 0;

  if (hasExpectedCount) {
    const actualCount = task.actualCount ?? 0;

    if (actualCount < task.expectedCount!) {
      return false;
    }
  }

  if (hasExpectedTime) {
    const actualTime = task.actualTime ?? 0;

    if (actualTime < task.expectedTime!) {
      return false;
    }
  }

  if (hasExpectedCount || hasExpectedTime) {
    return true;
  }

  return task.done;
}

export function getDayProgress(tasks: Task[]) {
  const total = tasks.length;
  const done = tasks.filter(getTaskIsDone).length;
  const left = total - done;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  return {
    total,
    done,
    left,
    percent,
  };
}
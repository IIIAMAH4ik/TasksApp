import {
  getLocalDailyData,
  saveLocalDailyData,
} from '@/services/localfileservice';
import { DailyData } from '@/types/dailyData';

export async function getDailyData(
  _userId: string,
  dayKey: string
): Promise<DailyData> {
  return getLocalDailyData(dayKey);
}

export async function saveDailyData(dailyData: DailyData) {
  await saveLocalDailyData(dailyData);
}
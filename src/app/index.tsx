import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import ProgressCard from '@/components/tasks/ProgressCard';
import { defaultCategories } from '@/constants/categories';
import { useAuth } from '@/context/AuthContext';
import { getDailyData, saveDailyData } from '@/services/dailydataservice';
import {
  getGlobalTasks,
  getUserSettings,
  saveGlobalTasks,
  saveUserSettings,
} from '@/services/settingsservice';
import { styles } from '@/styles/index.styles';
import { Category } from '@/types/category';
import { DailyData } from '@/types/dailyData';
import { Task } from '@/types/task';
import { addDays, formatDateTitle, getDayKey, isSameDay } from '@/utils/date';
import { getDayProgress, getTaskIsDone } from '@/utils/progress';

export default function IndexScreen() {
  const { user, signOut } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeCategoryKey, setActiveCategoryKey] = useState('all');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [isNutritionOpen, setIsNutritionOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategoryKey, setNewTaskCategoryKey] = useState('work');
  const [newTaskExpectedCount, setNewTaskExpectedCount] = useState('');
  const [newTaskExpectedTime, setNewTaskExpectedTime] = useState('');
  const [foodTitle, setFoodTitle] = useState('');
  const [isNewTaskGlobal, setIsNewTaskGlobal] = useState(false);
  const [foodCalories, setFoodCalories] = useState('');
  const [foodProtein, setFoodProtein] = useState('');
  const [foodFat, setFoodFat] = useState('');
  const [foodCarbs, setFoodCarbs] = useState('');
  

  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [dailyData, setDailyData] = useState<DailyData | null>(null);

  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const progress = useMemo(() => {
    return getDayProgress(dailyData?.tasks ?? []);
  }, [dailyData]);

  const visibleTasks = useMemo(() => {
    const tasks = dailyData?.tasks ?? [];

    if (activeCategoryKey === 'all') {
      return tasks;
    }

    return tasks.filter((task) => task.categoryKey === activeCategoryKey);
  }, [dailyData, activeCategoryKey]);

  const groupedTasks = useMemo(() => {
    if (activeCategoryKey !== 'all') {
      return [];
    }

    return categories
      .map((category) => ({
        category,
        tasks: visibleTasks.filter((task) => task.categoryKey === category.key),
      }))
      .filter((group) => group.tasks.length > 0);
  }, [categories, visibleTasks, activeCategoryKey]);

  const consumedNutrition = useMemo(() => {
    const foodTasks = (dailyData?.tasks ?? []).filter(
      (task) => task.categoryKey === 'food' && task.nutrition
    );

    return foodTasks.reduce(
      (sum, task) => {
        return {
          calories: sum.calories + (task.nutrition?.calories ?? 0),
          protein: sum.protein + (task.nutrition?.protein ?? 0),
          fat: sum.fat + (task.nutrition?.fat ?? 0),
          carbs: sum.carbs + (task.nutrition?.carbs ?? 0),
        };
      },
      {
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0,
      }
    );
  }, [dailyData]);

  useEffect(() => {
    if (!user) {
      return;
    }

    loadInitialData();
  }, [user, selectedDate]);

  const customCategoryColors = [
    '#7ea8d4',
    '#e07a5f',
    '#81b29a',
    '#f2cc8f',
    '#c08497',
    '#9d8df1',
    '#6dbf8e',
    '#d4c9ae',
  ];

  function createCategoryKey() {
    return `custom-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function getNextCategoryColor() {
    return customCategoryColors[categories.length % customCategoryColors.length];
  }

  async function loadInitialData() {
    if (!user) {
      return;
    }

    try {
      setIsLoadingData(true);
      setErrorMessage('');

      const selectedDayKey = getDayKey(selectedDate);

      const loadedCategories = await getUserSettings(user.id);
      const loadedDailyData = await getDailyData(user.id, selectedDayKey);

      setCategories(loadedCategories);
      setDailyData(loadedDailyData);
    } catch (error) {
      console.log('load initial data error:', error);
      setErrorMessage('Ошибка загрузки данных.');
    } finally {
      setIsLoadingData(false);
    }
  }

  function changeDay(days: number) {
    setSelectedDate((currentDate) => addDays(currentDate, days));
  }

  function goToday() {
   setSelectedDate(new Date());
  }

  function createTaskId() {
    return `task-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function createGlobalTaskId() {
    return `global-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function isAutoTask(task: Task) {
    return task.id.startsWith('auto-');
  }

  async function updateTasks(nextTasks: Task[]) {
    if (!dailyData) {
      return;
    }

    const nextDailyData: DailyData = {
      ...dailyData,
      tasks: nextTasks,
      updated_at: new Date().toISOString(),
    };

    setDailyData(nextDailyData);

    try {
      setIsSaving(true);
      setErrorMessage('');
      await saveDailyData(nextDailyData);
    } catch (error) {
      console.log('save daily data error:', error);
      setErrorMessage('Ошибка сохранения данных.');
    } finally {
      setIsSaving(false);
    }
  }

  function toggleTask(taskId: string) {
    if (!dailyData) {
      return;
    }

    const nextTasks = dailyData.tasks.map((task) => {
      if (task.id !== taskId) {
        return task;
      }

      const nextDone = !getTaskIsDone(task);

      return {
        ...task,
        done: nextDone,
        actualCount: task.expectedCount ? (nextDone ? task.expectedCount : 0) : task.actualCount,
        actualTime: task.expectedTime ? (nextDone ? task.expectedTime : 0) : task.actualTime,
        updatedAt: new Date().toISOString(),
      };
    });

    updateTasks(nextTasks);
  }

  function updateTaskActualValue(
    taskId: string,
    field: 'actualCount' | 'actualTime',
    value: string
  ) {
    if (!dailyData) {
      return;
    }

    const numericValue = value.trim() === '' ? undefined : Number(value);

    if (numericValue !== undefined && Number.isNaN(numericValue)) {
      setErrorMessage('Факт должен быть числом.');
      return;
    }

    const nextTasks = dailyData.tasks.map((task) => {
      if (task.id !== taskId) {
        return task;
      }

      const nextTask: Task = {
        ...task,
        [field]: numericValue,
        updatedAt: new Date().toISOString(),
      };

      return {
        ...nextTask,
        done: getTaskIsDone(nextTask),
      };
    });

    updateTasks(nextTasks);
  }

  async function deleteTask(taskId: string) {
    if (!dailyData) {
      return;
    }

    const taskToDelete = dailyData.tasks.find((task) => task.id === taskId);

    if (!taskToDelete) {
      return;
    }

    if (isAutoTask(taskToDelete)) {
      setErrorMessage('Автоматические задачи удалить нельзя.');
      return;
    }

    const nextTasks = dailyData.tasks.filter((task) => task.id !== taskId);

    const hiddenGlobalTaskIds = dailyData.meta.hiddenGlobalTaskIds ?? [];

    const nextMeta = taskToDelete.globalId
      ? {
          ...dailyData.meta,
          hiddenGlobalTaskIds: Array.from(
            new Set([...hiddenGlobalTaskIds, taskToDelete.globalId])
          ),
        }
      : dailyData.meta;

    const nextDailyData: DailyData = {
      ...dailyData,
      tasks: nextTasks,
      meta: nextMeta,
      updated_at: new Date().toISOString(),
    };

    setDailyData(nextDailyData);

    try {
      setErrorMessage('');
      await saveDailyData(nextDailyData);
    } catch (error) {
      console.log('delete task error:', error);
      setErrorMessage('Ошибка удаления задачи.');
    }
  }

  async function disableGlobalTask(taskId: string) {
    if (!dailyData || !user) {
      return;
    }

    const taskToUpdate = dailyData.tasks.find((task) => task.id === taskId);

    if (!taskToUpdate || !taskToUpdate.globalId) {
      return;
    }

    try {
      setErrorMessage('');

      const currentGlobalTasks = await getGlobalTasks(user.id);

      const nextGlobalTasks = currentGlobalTasks.filter(
        (task) => task.globalId !== taskToUpdate.globalId && task.id !== taskToUpdate.globalId
      );

      await saveGlobalTasks(user.id, nextGlobalTasks);

      const nextTasks = dailyData.tasks.map((task) => {
        if (task.id !== taskId) {
          return task;
        }

        return {
          ...task,
          isGlobal: false,
          globalId: undefined,
          updatedAt: new Date().toISOString(),
        };
      });

      await updateTasks(nextTasks);
    } catch (error) {
      console.log('disable global task error:', error);
      setErrorMessage('Ошибка отключения вечной задачи.');
    }
  }

  async function addTask() {
    if (!dailyData || !user) {
      return;
    }

    const title = newTaskTitle.trim();

    if (!title) {
      setErrorMessage('Введите название задачи.');
      return;
    }

    const expectedCount = newTaskExpectedCount.trim()
      ? Number(newTaskExpectedCount)
      : undefined;

    const expectedTime = newTaskExpectedTime.trim()
      ? Number(newTaskExpectedTime)
      : undefined;

    if (
      (expectedCount !== undefined && Number.isNaN(expectedCount)) ||
      (expectedTime !== undefined && Number.isNaN(expectedTime))
    ) {
      setErrorMessage('Количество и время должны быть числами.');
      return;
    }

    const now = new Date().toISOString();

    const globalId = isNewTaskGlobal ? createGlobalTaskId() : undefined;

    const nextTask: Task = {
      id: globalId ?? createTaskId(),
      title,
      categoryKey: newTaskCategoryKey,
      done: false,

      expectedCount,
      expectedTime,

      actualCount: expectedCount ? 0 : undefined,
      actualTime: expectedTime ? 0 : undefined,

      isGlobal: isNewTaskGlobal,
      globalId,

      createdAt: now,
      updatedAt: now,
    };

    try {
      setErrorMessage('');

      if (isNewTaskGlobal) {
        const currentGlobalTasks = await getGlobalTasks(user.id);
        await saveGlobalTasks(user.id, [...currentGlobalTasks, nextTask]);
      }

      await updateTasks([...dailyData.tasks, nextTask]);

      setNewTaskTitle('');
      setNewTaskExpectedCount('');
      setNewTaskExpectedTime('');
      setIsNewTaskGlobal(false);
      setIsAddTaskOpen(false);
    } catch (error) {
      console.log('add task error:', error);
      setErrorMessage('Ошибка создания задачи.');
    }
  }

  function addFoodTask() {
    if (!dailyData) {
      return;
    }

    const title = foodTitle.trim();

    if (!title) {
      setErrorMessage('Введите название еды.');
      return;
    }

    const calories = foodCalories.trim() ? Number(foodCalories) : 0;
    const protein = foodProtein.trim() ? Number(foodProtein) : 0;
    const fat = foodFat.trim() ? Number(foodFat) : 0;
    const carbs = foodCarbs.trim() ? Number(foodCarbs) : 0;

    if (
      Number.isNaN(calories) ||
      Number.isNaN(protein) ||
      Number.isNaN(fat) ||
      Number.isNaN(carbs)
    ) {
      setErrorMessage('КБЖУ должны быть числами.');
      return;
    }

    const now = new Date().toISOString();

    const nextTask: Task = {
      id: createTaskId(),
      title,
      categoryKey: 'food',
      done: true,

      nutrition: {
        calories,
        protein,
        fat,
        carbs,
      },

      createdAt: now,
      updatedAt: now,
    };

    updateTasks([...dailyData.tasks, nextTask]);

    setFoodTitle('');
    setFoodCalories('');
    setFoodProtein('');
    setFoodFat('');
    setFoodCarbs('');
    setErrorMessage('');
  }

  function getCategoryName(categoryKey: string) {
    return categories.find((category) => category.key === categoryKey)?.name ?? categoryKey;
  }

  function calculateMacrosByCalories(calories: number) {
    return {
      proteinGoal: Math.round((calories * 0.3) / 4),
      fatGoal: Math.round((calories * 0.3) / 9),
      carbsGoal: Math.round((calories * 0.4) / 4),
    };
  }

  async function updateDailyMetaValue(
    field: 'caloriesGoal' | 'proteinGoal' | 'fatGoal' | 'carbsGoal',
    value: string
  ) {
    if (!dailyData) {
      return;
    }

    const numericValue = value.trim() === '' ? 0 : Number(value);

    if (Number.isNaN(numericValue)) {
      setErrorMessage('Значение КБЖУ должно быть числом.');
      return;
    }

    const nextMeta = {
      ...dailyData.meta,
      [field]: numericValue,
    };

    if (field === 'caloriesGoal') {
      const macros = calculateMacrosByCalories(numericValue);

      nextMeta.proteinGoal = macros.proteinGoal;
      nextMeta.fatGoal = macros.fatGoal;
      nextMeta.carbsGoal = macros.carbsGoal;
    }

    const nextDailyData: DailyData = {
      ...dailyData,
      meta: nextMeta,
      updated_at: new Date().toISOString(),
    };

    setDailyData(nextDailyData);

    try {
      setErrorMessage('');
      await saveDailyData(nextDailyData);
    } catch (error) {
      console.log('save daily meta error:', error);
      setErrorMessage('Ошибка сохранения КБЖУ.');
    }
  }

  async function addCategory() {
    if (!user) {
      return;
    }

    const name = newCategoryName.trim();

    if (!name) {
      setErrorMessage('Введите название темы.');
      return;
    }

    const alreadyExists = categories.some(
      (category) => category.name.toLowerCase() === name.toLowerCase()
    );

    if (alreadyExists) {
      setErrorMessage('Такая тема уже есть.');
      return;
    }

    const nextCategory: Category = {
      key: createCategoryKey(),
      name,
      color: getNextCategoryColor(),
      isDefault: false,
    };

    const nextCategories = [...categories, nextCategory];

    try {
      setErrorMessage('');
      setCategories(nextCategories);
      setNewCategoryName('');
      setNewTaskCategoryKey(nextCategory.key);
      setActiveCategoryKey(nextCategory.key);

      await saveUserSettings(user.id, nextCategories);
    } catch (error) {
      console.log('add category error:', error);
      setErrorMessage('Ошибка сохранения темы.');
      setCategories(categories);
    }
  }

  async function deleteCategory(categoryKey: string) {
    if (!user) {
      return;
    }

    const categoryToDelete = categories.find((category) => category.key === categoryKey);

    if (!categoryToDelete) {
      return;
    }

    if (categoryToDelete.isDefault) {
      setErrorMessage('Стандартные темы удалить нельзя.');
      return;
    }

    const hasTasksInThisDay = (dailyData?.tasks ?? []).some(
      (task) => task.categoryKey === categoryKey
    );

    if (hasTasksInThisDay) {
      setErrorMessage('Нельзя удалить тему, пока в выбранном дне есть задачи этой темы.');
      return;
    }

    const nextCategories = categories.filter((category) => category.key !== categoryKey);

    try {
      setErrorMessage('');
      setCategories(nextCategories);

      if (activeCategoryKey === categoryKey) {
        setActiveCategoryKey('all');
      }

      if (newTaskCategoryKey === categoryKey) {
        setNewTaskCategoryKey('work');
      }

      await saveUserSettings(user.id, nextCategories);
    } catch (error) {
      console.log('delete category error:', error);
      setErrorMessage('Ошибка удаления темы.');
      setCategories(categories);
    }
  }

  function renderTask(task: Task) {
    const done = getTaskIsDone(task);

    return (
      <View
        key={task.id}
        style={[styles.taskItem, done && styles.taskItemDone]}
      >
        <Pressable
          style={styles.taskMain}
          onPress={() => toggleTask(task.id)}
        >
          <View style={[styles.checkbox, done && styles.checkboxDone]}>
            {done && <Text style={styles.checkboxText}>✓</Text>}
          </View>

          <View style={styles.taskBody}>
            <Text style={[styles.taskTitle, done && styles.taskTitleDone]}>
              {task.title}
            </Text>

            <Text style={styles.taskMeta}>
              {getCategoryName(task.categoryKey)}
            </Text>

            {(task.expectedCount || task.expectedTime) && (
              <Text style={styles.taskSub}>
                {task.expectedCount ? `План: ${task.expectedCount}` : ''}
                {task.expectedCount && task.expectedTime ? ' · ' : ''}
                {task.expectedTime ? `Время: ${task.expectedTime} мин` : ''}
              </Text>
            )}

            {(task.expectedCount || task.expectedTime) && (
              <View style={styles.actualRow}>
                {task.expectedCount ? (
                  <TextInput
                    style={styles.actualInput}
                    placeholder="факт"
                    placeholderTextColor="#6d6963"
                    value={task.actualCount === undefined ? '' : String(task.actualCount)}
                    onChangeText={(value) => updateTaskActualValue(task.id, 'actualCount', value)}
                    keyboardType="numeric"
                  />
                ) : null}

                {task.expectedTime ? (
                  <TextInput
                    style={styles.actualInput}
                    placeholder="мин"
                    placeholderTextColor="#6d6963"
                    value={task.actualTime === undefined ? '' : String(task.actualTime)}
                    onChangeText={(value) => updateTaskActualValue(task.id, 'actualTime', value)}
                    keyboardType="numeric"
                  />
                ) : null}
              </View>
            )}

            {task.nutrition && (
              <Text style={styles.taskSub}>
                {task.nutrition.calories ?? 0} ккал · Б {task.nutrition.protein ?? 0} · Ж {task.nutrition.fat ?? 0} · У {task.nutrition.carbs ?? 0}
              </Text>
            )}
          </View>
        </Pressable>

        {!isAutoTask(task) && (
          <View style={styles.taskActions}>
            {task.isGlobal && (
              <Pressable
                style={styles.taskActionButton}
                onPress={() => disableGlobalTask(task.id)}
              >
                <Text style={styles.globalTaskActiveIcon}>★</Text>
              </Pressable>
            )}

            <Pressable
              style={styles.taskActionButton}
              onPress={() => deleteTask(task.id)}
            >
              <Text style={styles.deleteButtonText}>×</Text>
            </Pressable>
          </View>
        )}
      </View>
    );
  }
  
  if (isLoadingData && !dailyData) {
    return (
      <View style={styles.centerScreen}>
        <ActivityIndicator />
        <Text style={styles.muted}>Загружаю задачи...</Text>
      </View>
    );
  }

  if (isSettingsOpen) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <View style={styles.settingsHeader}>
          <View>
            <Text style={styles.title}>Настройки</Text>
            <Text style={styles.subtitle}>Аккаунт, темы и внешний вид</Text>
          </View>

          <Pressable style={styles.settingsBackButton} onPress={() => setIsSettingsOpen(false)}>
            <Text style={styles.settingsBackText}>Назад</Text>
          </Pressable>
        </View>

        <View style={styles.settingsCard}>
          <Text style={styles.settingsSectionTitle}>Аккаунт</Text>
          <Text style={styles.accountLabel}>Текущий аккаунт</Text>
          <Text style={styles.accountEmail}>{user?.email}</Text>
        </View>

        <View style={styles.settingsCard}>
          <Text style={styles.settingsSectionTitle}>Темы</Text>

          <View style={styles.categoryAddRow}>
            <TextInput
              style={styles.categoryInput}
              placeholder="Новая тема..."
              placeholderTextColor="#6d6963"
              value={newCategoryName}
              onChangeText={setNewCategoryName}
            />

            <Pressable style={styles.categoryAddButton} onPress={addCategory}>
              <Text style={styles.categoryAddButtonText}>+</Text>
            </Pressable>
          </View>

          <View style={styles.managerCategoryList}>
            {categories.map((category) => (
              <View key={category.key} style={styles.managerCategoryChip}>
                <View
                  style={[
                    styles.managerCategoryDot,
                    { backgroundColor: category.color },
                  ]}
                />

                <Text style={styles.managerCategoryText}>{category.name}</Text>

                {!category.isDefault && (
                  <Pressable
                    style={styles.managerDeleteButton}
                    onPress={() => deleteCategory(category.key)}
                  >
                    <Text style={styles.managerDeleteButtonText}>×</Text>
                  </Pressable>
                )}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.settingsCard}>
          <Text style={styles.settingsSectionTitle}>Внешний вид</Text>

          <View style={styles.themeRow}>
            <Pressable style={[styles.themeButton, styles.themeButtonActive]}>
              <Text style={[styles.themeButtonText, styles.themeButtonTextActive]}>Тёмная</Text>
            </Pressable>

            <Pressable style={styles.themeButton}>
              <Text style={styles.themeButtonText}>Светлая</Text>
            </Pressable>
          </View>

          <Text style={styles.settingsHint}>
            Смену темы подключим позже. Сейчас приложение остаётся в тёмном оформлении.
          </Text>
        </View>

        <Pressable style={styles.signOutButton} onPress={signOut}>
          <Text style={styles.signOutButtonText}>Выйти из аккаунта</Text>
        </Pressable>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Tasks</Text>
          <Text style={styles.subtitle}>
            {dailyData?.day_key ?? getDayKey(selectedDate)}
          </Text>
        </View>

        <Pressable style={styles.settingsButton} onPress={() => setIsSettingsOpen(true)}>
          <Text style={styles.settingsButtonIcon}>⚙</Text>
          <Text style={styles.settingsButtonText}>Настройки</Text>
        </Pressable>
      </View>

      <View style={styles.dateNav}>
        <Pressable style={styles.dateButton} onPress={() => changeDay(-1)}>
          <Text style={styles.dateButtonText}>←</Text>
        </Pressable>

        <Pressable
          style={[styles.todayButton, isSameDay(selectedDate, new Date()) && styles.todayButtonActive]}
          onPress={goToday}
        >
          <Text style={styles.todayButtonText}>{formatDateTitle(selectedDate)}</Text>
        </Pressable>

        <Pressable style={styles.dateButton} onPress={() => changeDay(1)}>
          <Text style={styles.dateButtonText}>→</Text>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterRow}
      >
        <Pressable
          style={[
            styles.filterChip,
            activeCategoryKey === 'all' && styles.filterChipActive,
          ]}
          onPress={() => setActiveCategoryKey('all')}
        >
          <Text
            style={[
              styles.filterChipText,
              activeCategoryKey === 'all' && styles.filterChipTextActive,
            ]}
          >
            Все
          </Text>
        </Pressable>

        {categories.map((category) => (
          <Pressable
            key={category.key}
            style={[
              styles.filterChip,
              activeCategoryKey === category.key && styles.filterChipActive,
            ]}
            onPress={() => setActiveCategoryKey(category.key)}
          >
            <Text
              style={[
                styles.filterChipText,
                activeCategoryKey === category.key && styles.filterChipTextActive,
              ]}
            >
              {category.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {activeCategoryKey === 'food' && (
        <View style={styles.foodCard}>
          <Text style={styles.foodTitle}>Еда / КБЖУ</Text>

          <View style={styles.foodSummary}>
            <Text style={styles.foodSummaryText}>
              Потреблено: {consumedNutrition.calories} / {dailyData?.meta.caloriesGoal ?? 0} ккал
            </Text>
            <Text style={styles.foodSummaryText}>
              Б: {consumedNutrition.protein} / {dailyData?.meta.proteinGoal ?? 0}
            </Text>
            <Text style={styles.foodSummaryText}>
              Ж: {consumedNutrition.fat} / {dailyData?.meta.fatGoal ?? 0}
            </Text>
            <Text style={styles.foodSummaryText}>
              У: {consumedNutrition.carbs} / {dailyData?.meta.carbsGoal ?? 0}
            </Text>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Название еды..."
            placeholderTextColor="#6d6963"
            value={foodTitle}
            onChangeText={setFoodTitle}
          />

          <View style={styles.foodGrid}>
            <TextInput
              style={styles.foodInput}
              placeholder="ккал"
              placeholderTextColor="#6d6963"
              value={foodCalories}
              onChangeText={setFoodCalories}
              keyboardType="numeric"
            />

            <TextInput
              style={styles.foodInput}
              placeholder="белки"
              placeholderTextColor="#6d6963"
              value={foodProtein}
              onChangeText={setFoodProtein}
              keyboardType="numeric"
            />

            <TextInput
              style={styles.foodInput}
              placeholder="жиры"
              placeholderTextColor="#6d6963"
              value={foodFat}
              onChangeText={setFoodFat}
              keyboardType="numeric"
            />

            <TextInput
              style={styles.foodInput}
              placeholder="углеводы"
              placeholderTextColor="#6d6963"
              value={foodCarbs}
              onChangeText={setFoodCarbs}
              keyboardType="numeric"
            />
          </View>

          <Pressable style={styles.foodAddButton} onPress={addFoodTask}>
            <Text style={styles.foodAddButtonText}>Добавить еду</Text>
          </Pressable>
        </View>
      )}

      <ProgressCard progress={progress} />

      {!!errorMessage && <Text style={styles.error}>{errorMessage}</Text>}

      <Text style={styles.sectionTitle}>Задачи</Text>

      <View style={styles.addCard}>
        <Pressable
          style={styles.addCardHandleWrap}
          onPress={() => setIsAddTaskOpen((current) => !current)}
        >
          <View style={[styles.addCardHandle, isAddTaskOpen && styles.addCardHandleActive]} />
        </Pressable>

        {isAddTaskOpen && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Новая задача..."
              placeholderTextColor="#6d6963"
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
            />

            <View style={styles.categorySelectRow}>
              <View style={styles.categoryRow}>
                {categories
                  .filter((category) => category.key !== 'food')
                  .map((category) => (
                    <Pressable
                      key={category.key}
                      style={[
                        styles.categoryChip,
                        newTaskCategoryKey === category.key && styles.categoryChipActive,
                      ]}
                      onPress={() => setNewTaskCategoryKey(category.key)}
                    >
                      <Text
                        style={[
                          styles.categoryChipText,
                          newTaskCategoryKey === category.key && styles.categoryChipTextActive,
                        ]}
                      >
                        {category.name}
                      </Text>
                    </Pressable>
                  ))}
              </View>

              <Pressable
                style={[
                  styles.globalTaskButton,
                  isNewTaskGlobal && styles.globalTaskButtonActive,
                ]}
                onPress={() => setIsNewTaskGlobal((current) => !current)}
              >
                <Text
                  style={[
                    styles.globalTaskButtonText,
                    isNewTaskGlobal && styles.globalTaskButtonTextActive,
                  ]}
                >
                  ★
                </Text>
              </Pressable>
            </View>

            <View style={styles.addMetaRow}>
              <TextInput
                style={[styles.input, styles.metaInput]}
                placeholder="кол-во"
                placeholderTextColor="#6d6963"
                value={newTaskExpectedCount}
                onChangeText={setNewTaskExpectedCount}
                keyboardType="numeric"
              />

              <TextInput
                style={[styles.input, styles.metaInput]}
                placeholder="мин"
                placeholderTextColor="#6d6963"
                value={newTaskExpectedTime}
                onChangeText={setNewTaskExpectedTime}
                keyboardType="numeric"
              />

              <Pressable style={styles.addButton} onPress={addTask}>
                <Text style={styles.addButtonText}>+</Text>
              </Pressable>
            </View>
          </>
        )}
      </View>

      {activeCategoryKey === 'all' ? (
        <View style={styles.groupList}>
          {groupedTasks.map((group) => (
            <View key={group.category.key} style={styles.groupBlock}>
              <View style={styles.groupHeader}>
                <View
                  style={[
                    styles.groupDot,
                    { backgroundColor: group.category.color },
                  ]}
                />
                <Text style={styles.groupTitle}>{group.category.name}</Text>
                <Text style={styles.groupCount}>{group.tasks.length}</Text>
              </View>

              <View style={styles.tasksCard}>
                {group.tasks.map(renderTask)}
              </View>
            </View>
          ))}

          {groupedTasks.length === 0 && (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>На этот день задач пока нет.</Text>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.tasksCard}>
          {visibleTasks.map(renderTask)}

          {visibleTasks.length === 0 && (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>В этой категории пока нет задач.</Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}
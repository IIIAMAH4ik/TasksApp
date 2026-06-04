import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import FoodCard from '@/components/food/FoodCard';
import SettingsScreen from '@/components/settings/SettingsScreen';
import AddTaskCard from '@/components/tasks/AddTaskCard';
import TaskCard from '@/components/tasks/TaskCard';
import TaskList from '@/components/tasks/TaskList';
import { defaultCategories } from '@/constants/categories';
import { useAppTheme } from '@/context/appthemecontext';
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
  const localUserId = 'local';
  const { colors } = useAppTheme();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeCategoryKey, setActiveCategoryKey] = useState('all');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isCategoryPanelOpen, setIsCategoryPanelOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(true);

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
    loadInitialData();
  }, [selectedDate]);

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
    // Локальный режим: пользователь не нужен.

    try {
      setIsLoadingData(true);
      setErrorMessage('');

      const selectedDayKey = getDayKey(selectedDate);

      const loadedCategories = await getUserSettings(localUserId);
      const loadedDailyData = await getDailyData(localUserId, selectedDayKey);

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
      setErrorMessage('');
      await saveDailyData(nextDailyData);
    } catch (error) {
      console.log('save daily data error:', error);
      setErrorMessage('Ошибка сохранения данных.');
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
    if (!dailyData) {
      return;
    }

    const taskToUpdate = dailyData.tasks.find((task) => task.id === taskId);

    if (!taskToUpdate || !taskToUpdate.globalId) {
      return;
    }

    try {
      setErrorMessage('');

      const currentGlobalTasks = await getGlobalTasks(localUserId);

      const nextGlobalTasks = currentGlobalTasks.filter(
        (task) => task.globalId !== taskToUpdate.globalId && task.id !== taskToUpdate.globalId
      );

      
      await saveGlobalTasks(localUserId, nextGlobalTasks);

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
    if (!dailyData) {
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
        const currentGlobalTasks = await getGlobalTasks(localUserId);
        await saveGlobalTasks(localUserId, [...currentGlobalTasks, nextTask]);
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

  async function addCategory() {

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

      await saveUserSettings(localUserId, nextCategories);
    } catch (error) {
      console.log('add category error:', error);
      setErrorMessage('Ошибка сохранения темы.');
      setCategories(categories);
    }
  }

  async function deleteCategory(categoryKey: string) {
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

      await saveUserSettings(localUserId, nextCategories);
    } catch (error) {
      console.log('delete category error:', error);
      setErrorMessage('Ошибка удаления темы.');
      setCategories(categories);
    }
  }

  function renderTask(task: Task) {
    return (
      <TaskCard
        key={task.id}
        task={task}
        categoryName={getCategoryName(task.categoryKey)}
        isAutoTask={isAutoTask(task)}
        onToggle={toggleTask}
        onDelete={deleteTask}
        onDisableGlobal={disableGlobalTask}
        onUpdateActualValue={updateTaskActualValue}
      />
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
      <SettingsScreen
        progress={progress}
        onClose={() => setIsSettingsOpen(false)}
      />
    );
  }

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.screen }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>My Tasks</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            {dailyData?.day_key ?? getDayKey(selectedDate)}
          </Text>
        </View>

        <Pressable
          style={[
            styles.settingsButton,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
          onPress={() => setIsSettingsOpen(true)}
        >
          <Text style={[styles.settingsButtonIcon, { color: colors.accent }]}>⚙</Text>
          <Text style={[styles.settingsButtonText, { color: colors.textMuted }]}>
            Настройки
          </Text>
        </Pressable>
      </View>

      <View style={styles.dateNav}>
        <Pressable
          style={[
            styles.dateButton,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
          onPress={() => changeDay(-1)}
        >
          <Text style={[styles.dateButtonText, { color: colors.text }]}>←</Text>
        </Pressable>

        <Pressable
          style={[
            styles.todayButton,
            {
              backgroundColor: isSameDay(selectedDate, new Date())
                ? colors.accent
                : colors.card,
              borderColor: isSameDay(selectedDate, new Date())
                ? colors.accent
                : colors.border,
            },
          ]}
          onPress={goToday}
        >
          <Text
            style={[
              styles.todayButtonText,
              {
                color: isSameDay(selectedDate, new Date())
                  ? colors.accentText
                  : colors.text,
              },
            ]}
          >
            {formatDateTitle(selectedDate)}
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.dateButton,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
          onPress={() => changeDay(1)}
        >
          <Text style={[styles.dateButtonText, { color: colors.text }]}>→</Text>
        </Pressable>
      </View>

      <View style={styles.categoryFilterBlock}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterRow}
        >
          <Pressable
            style={[
              styles.filterChip,
              {
                backgroundColor:
                  activeCategoryKey === 'all' ? colors.accent : colors.card,
                borderColor:
                  activeCategoryKey === 'all' ? colors.accent : colors.border,
              },
            ]}
            onPress={() => setActiveCategoryKey('all')}
          >
            <Text
              style={[
                styles.filterChipText,
                {
                  color:
                    activeCategoryKey === 'all' ? colors.accentText : colors.textMuted,
                },
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
                {
                  backgroundColor:
                    activeCategoryKey === category.key ? colors.accent : colors.card,
                  borderColor:
                    activeCategoryKey === category.key ? colors.accent : colors.border,
                },
              ]}
              onPress={() => setActiveCategoryKey(category.key)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  {
                    color:
                      activeCategoryKey === category.key
                        ? colors.accentText
                        : colors.textMuted,
                  },
                ]}
              >
                {category.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.categoryScrollHint}>
          <Text style={[styles.categoryScrollHintText, { color: colors.textSoft }]}>›</Text>
        </View>

        <Pressable
          style={[
            styles.categoryPanelButton,
            {
              backgroundColor: isCategoryPanelOpen ? colors.accent : colors.card,
              borderColor: isCategoryPanelOpen ? colors.accent : colors.border,
            },
          ]}
          onPress={() => setIsCategoryPanelOpen((current) => !current)}
        >
          <Text
            style={[
              styles.categoryPanelButtonText,
              {
                color: isCategoryPanelOpen ? colors.accentText : colors.accent,
              },
            ]}
          >
            {isCategoryPanelOpen ? '−' : '+'}
          </Text>
        </Pressable>
      </View>

      {isCategoryPanelOpen && (
        <View
          style={[
            styles.categoryPanel,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.settingsSectionTitle, { color: colors.textSoft }]}>
            Темы
          </Text>
          <View style={styles.categoryAddRow}>
            <TextInput
              style={[
                styles.categoryInput,
                {
                  backgroundColor: colors.input,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="Новая тема..."
              placeholderTextColor={colors.textSoft}
              value={newCategoryName}
              onChangeText={setNewCategoryName}
            />

            <Pressable
              style={[styles.categoryAddButton, { backgroundColor: colors.accent }]}
              onPress={addCategory}
            >
              <Text style={[styles.categoryAddButtonText, { color: colors.accentText }]}>
                +
              </Text>
            </Pressable>
          </View>

          <View style={styles.managerCategoryList}>
            {categories.map((category) => (
              <View
                key={category.key}
                style={[
                  styles.managerCategoryChip,
                  {
                    backgroundColor: colors.cardSoft,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.managerCategoryDot,
                    { backgroundColor: category.color },
                  ]}
                />

                <Text style={[styles.managerCategoryText, { color: colors.textMuted }]}>
                  {category.name}
                </Text>

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
      )}

      {activeCategoryKey === 'food' && (
        <FoodCard
          dailyData={dailyData}
          consumedNutrition={consumedNutrition}
          foodTitle={foodTitle}
          setFoodTitle={setFoodTitle}
          foodCalories={foodCalories}
          setFoodCalories={setFoodCalories}
          foodProtein={foodProtein}
          setFoodProtein={setFoodProtein}
          foodFat={foodFat}
          setFoodFat={setFoodFat}
          foodCarbs={foodCarbs}
          setFoodCarbs={setFoodCarbs}
          onAddFoodTask={addFoodTask}
        />
      )}

      {!!errorMessage && (
        <Text style={[styles.error, { color: colors.error }]}>
          {errorMessage}
        </Text>
      )}

      <Text style={[styles.sectionTitle, { color: colors.textSoft }]}>Задачи</Text>

      <AddTaskCard
        categories={categories}
        isAddTaskOpen={isAddTaskOpen}
        setIsAddTaskOpen={setIsAddTaskOpen}
        newTaskTitle={newTaskTitle}
        setNewTaskTitle={setNewTaskTitle}
        newTaskCategoryKey={newTaskCategoryKey}
        setNewTaskCategoryKey={setNewTaskCategoryKey}
        newTaskExpectedCount={newTaskExpectedCount}
        setNewTaskExpectedCount={setNewTaskExpectedCount}
        newTaskExpectedTime={newTaskExpectedTime}
        setNewTaskExpectedTime={setNewTaskExpectedTime}
        isNewTaskGlobal={isNewTaskGlobal}
        setIsNewTaskGlobal={setIsNewTaskGlobal}
        onAddTask={addTask}
      />

      <TaskList
        activeCategoryKey={activeCategoryKey}
        groupedTasks={groupedTasks}
        visibleTasks={visibleTasks}
        renderTask={renderTask}
      />
    </ScrollView>
  );
}
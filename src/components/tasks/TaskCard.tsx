import { Pressable, Text, TextInput, View } from 'react-native';

import { styles } from '@/styles/index.styles';
import { Task } from '@/types/task';
import { getTaskIsDone } from '@/utils/progress';

type TaskCardProps = {
  task: Task;
  categoryName: string;
  isAutoTask: boolean;
  onToggle: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onDisableGlobal: (taskId: string) => void;
  onUpdateActualValue: (
    taskId: string,
    field: 'actualCount' | 'actualTime',
    value: string
  ) => void;
};

export default function TaskCard({
  task,
  categoryName,
  isAutoTask,
  onToggle,
  onDelete,
  onDisableGlobal,
  onUpdateActualValue,
}: TaskCardProps) {
  const done = getTaskIsDone(task);

  return (
    <View style={[styles.taskItem, done && styles.taskItemDone]}>
      <Pressable style={styles.taskMain} onPress={() => onToggle(task.id)}>
        <View style={[styles.checkbox, done && styles.checkboxDone]}>
          {done && <Text style={styles.checkboxText}>✓</Text>}
        </View>

        <View style={styles.taskBody}>
          <Text style={[styles.taskTitle, done && styles.taskTitleDone]}>
            {task.title}
          </Text>

          <Text style={styles.taskMeta}>{categoryName}</Text>

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
                  onChangeText={(value) =>
                    onUpdateActualValue(task.id, 'actualCount', value)
                  }
                  keyboardType="numeric"
                />
              ) : null}

              {task.expectedTime ? (
                <TextInput
                  style={styles.actualInput}
                  placeholder="мин"
                  placeholderTextColor="#6d6963"
                  value={task.actualTime === undefined ? '' : String(task.actualTime)}
                  onChangeText={(value) =>
                    onUpdateActualValue(task.id, 'actualTime', value)
                  }
                  keyboardType="numeric"
                />
              ) : null}
            </View>
          )}

          {task.nutrition && (
            <Text style={styles.taskSub}>
              {task.nutrition.calories ?? 0} ккал · Б {task.nutrition.protein ?? 0} · Ж{' '}
              {task.nutrition.fat ?? 0} · У {task.nutrition.carbs ?? 0}
            </Text>
          )}
        </View>
      </Pressable>

      {!isAutoTask && (
        <View style={styles.taskActions}>
          {task.isGlobal && (
            <Pressable
              style={styles.taskActionButton}
              onPress={() => onDisableGlobal(task.id)}
            >
              <Text style={styles.globalTaskActiveIcon}>★</Text>
            </Pressable>
          )}

          <Pressable
            style={styles.taskActionButton}
            onPress={() => onDelete(task.id)}
          >
            <Text style={styles.deleteButtonText}>×</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
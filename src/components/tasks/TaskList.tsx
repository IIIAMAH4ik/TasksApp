import { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { useAppTheme } from '@/context/appthemecontext';
import { styles } from '@/styles/index.styles';
import { Category } from '@/types/category';
import { Task } from '@/types/task';

type TaskGroup = {
  category: Category;
  tasks: Task[];
};

type TaskListProps = {
  activeCategoryKey: string;
  groupedTasks: TaskGroup[];
  visibleTasks: Task[];
  renderTask: (task: Task) => ReactNode;
};

export default function TaskList({
  activeCategoryKey,
  groupedTasks,
  visibleTasks,
  renderTask,
}: TaskListProps) {
  const { colors } = useAppTheme();
  if (activeCategoryKey === 'all') {
    return (
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
                <Text style={[styles.groupTitle, { color: colors.textMuted }]}>
                {group.category.name}
                </Text>
                <Text style={[styles.groupCount, { color: colors.textSoft }]}>
                {group.tasks.length}
                </Text>
            </View>

            <View
            style={[
                styles.tasksCard,
                {
                backgroundColor: colors.card,
                borderColor: colors.border,
                },
            ]}
            >
              {group.tasks.map(renderTask)}
            </View>
          </View>
        ))}

        {groupedTasks.length === 0 && (
          <View style={styles.emptyBox}>
            <Text style={[styles.emptyText, { color: colors.textSoft }]}>На этот день задач пока нет.</Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View
        style={[
        styles.tasksCard,
        {
            backgroundColor: colors.card,
            borderColor: colors.border,
        },
        ]}
    >
      {visibleTasks.map(renderTask)}

      {visibleTasks.length === 0 && (
        <View style={styles.emptyBox}>
          <Text style={[styles.emptyText, { color: colors.textSoft }]}>В этой категории пока нет задач.</Text>
        </View>
      )}
    </View>
  );
}
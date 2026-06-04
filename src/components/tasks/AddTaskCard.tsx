import { Pressable, Text, TextInput, View } from 'react-native';

import { useAppTheme } from '@/context/appthemecontext';
import { styles } from '@/styles/index.styles';
import { Category } from '@/types/category';

type AddTaskCardProps = {
  categories: Category[];

  isAddTaskOpen: boolean;
  setIsAddTaskOpen: (value: boolean | ((current: boolean) => boolean)) => void;

  newTaskTitle: string;
  setNewTaskTitle: (value: string) => void;

  newTaskCategoryKey: string;
  setNewTaskCategoryKey: (value: string) => void;

  newTaskExpectedCount: string;
  setNewTaskExpectedCount: (value: string) => void;

  newTaskExpectedTime: string;
  setNewTaskExpectedTime: (value: string) => void;

  isNewTaskGlobal: boolean;
  setIsNewTaskGlobal: (value: boolean | ((current: boolean) => boolean)) => void;

  onAddTask: () => void;
};

export default function AddTaskCard({
  categories,
  isAddTaskOpen,
  setIsAddTaskOpen,
  newTaskTitle,
  setNewTaskTitle,
  newTaskCategoryKey,
  setNewTaskCategoryKey,
  newTaskExpectedCount,
  setNewTaskExpectedCount,
  newTaskExpectedTime,
  setNewTaskExpectedTime,
  isNewTaskGlobal,
  setIsNewTaskGlobal,
  onAddTask,
}: AddTaskCardProps) {
  const { colors } = useAppTheme();
  return (
    <View
      style={[
        styles.addCard,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      <Pressable
        style={styles.addCardHandleWrap}
        onPress={() => setIsAddTaskOpen((current) => !current)}
      >
        <View
          style={[
            styles.addCardHandle,
            {
              backgroundColor: colors.accent,
              opacity: isAddTaskOpen ? 1 : 0.55,
            },
          ]}
        />
      </Pressable>

      {isAddTaskOpen && (
        <>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.input,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder="Новая задача..."
            placeholderTextColor={colors.textSoft}
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
                      {
                        backgroundColor:
                          newTaskCategoryKey === category.key ? colors.accent : colors.cardSoft,
                        borderColor:
                          newTaskCategoryKey === category.key ? colors.accent : colors.border,
                      },
                    ]}
                    onPress={() => setNewTaskCategoryKey(category.key)}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        {
                          color:
                            newTaskCategoryKey === category.key
                              ? colors.accentText
                              : colors.textMuted,
                          fontWeight: newTaskCategoryKey === category.key ? '700' : '400',
                        },
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
                {
                  backgroundColor: isNewTaskGlobal ? colors.accent : colors.cardSoft,
                  borderColor: isNewTaskGlobal ? colors.accent : colors.border,
                },
              ]}
              onPress={() => setIsNewTaskGlobal((current) => !current)}
            >
              <Text
                style={[
                  styles.globalTaskButtonText,
                  {
                    color: isNewTaskGlobal ? colors.accentText : colors.textMuted,
                  },
                ]}
              >
                ★
              </Text>
            </Pressable>
          </View>

          <View style={styles.addMetaRow}>
            <TextInput
              style={[
                styles.input,
                styles.metaInput,
                {
                  backgroundColor: colors.input,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholderTextColor={colors.textSoft}
              placeholder="кол-во"
              value={newTaskExpectedCount}
              onChangeText={setNewTaskExpectedCount}
              keyboardType="numeric"
            />

            <TextInput
              style={[
                styles.input,
                styles.metaInput,
                {
                  backgroundColor: colors.input,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholderTextColor={colors.textSoft}
              placeholder="мин"
              value={newTaskExpectedTime}
              onChangeText={setNewTaskExpectedTime}
              keyboardType="numeric"
            />

            <Pressable
              style={[styles.addButton, { backgroundColor: colors.accent }]}
              onPress={onAddTask}
            >
              <Text style={[styles.addButtonText, { color: colors.accentText }]}>+</Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}
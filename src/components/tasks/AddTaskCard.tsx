import { Pressable, Text, TextInput, View } from 'react-native';

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
  return (
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

            <Pressable style={styles.addButton} onPress={onAddTask}>
              <Text style={styles.addButtonText}>+</Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}
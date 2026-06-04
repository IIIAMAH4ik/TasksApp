import { Pressable, Text, TextInput, View } from 'react-native';

import { styles } from '@/styles/index.styles';
import { DailyData } from '@/types/dailyData';

type ConsumedNutrition = {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
};

type FoodCardProps = {
  dailyData: DailyData | null;
  consumedNutrition: ConsumedNutrition;

  foodTitle: string;
  setFoodTitle: (value: string) => void;

  foodCalories: string;
  setFoodCalories: (value: string) => void;

  foodProtein: string;
  setFoodProtein: (value: string) => void;

  foodFat: string;
  setFoodFat: (value: string) => void;

  foodCarbs: string;
  setFoodCarbs: (value: string) => void;

  onAddFoodTask: () => void;
};

export default function FoodCard({
  dailyData,
  consumedNutrition,
  foodTitle,
  setFoodTitle,
  foodCalories,
  setFoodCalories,
  foodProtein,
  setFoodProtein,
  foodFat,
  setFoodFat,
  foodCarbs,
  setFoodCarbs,
  onAddFoodTask,
}: FoodCardProps) {
  return (
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

      <Pressable style={styles.foodAddButton} onPress={onAddFoodTask}>
        <Text style={styles.foodAddButtonText}>Добавить еду</Text>
      </Pressable>
    </View>
  );
}
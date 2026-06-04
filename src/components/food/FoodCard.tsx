import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { useAppTheme } from '@/context/appthemecontext';
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
  const [isFoodFormOpen, setIsFoodFormOpen] = useState(false);
  const { colors } = useAppTheme();

  function handleAddFoodTask() {
    onAddFoodTask();
    setIsFoodFormOpen(false);
  }

  return (
    <View
      style={[
        styles.foodCard,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      <Text style={[styles.foodTitle, { color: colors.accent }]}>Еда / КБЖУ</Text>

      <View
        style={[
          styles.foodSummary,
          {
            backgroundColor: colors.cardSoft,
            borderColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.foodSummaryText, { color: colors.textMuted }]}>
          Потреблено: {consumedNutrition.calories} / {dailyData?.meta.caloriesGoal ?? 0} ккал
        </Text>

        <Text style={[styles.foodSummaryText, { color: colors.text }]}>
          Б: {consumedNutrition.protein} / {dailyData?.meta.proteinGoal ?? 0}
        </Text>

        <Text style={[styles.foodSummaryText, { color: colors.text }]}>
          Ж: {consumedNutrition.fat} / {dailyData?.meta.fatGoal ?? 0}
        </Text>

        <Text style={[styles.foodSummaryText, { color: colors.text }]}>
          У: {consumedNutrition.carbs} / {dailyData?.meta.carbsGoal ?? 0}
        </Text>
      </View>

      <Pressable
        style={styles.foodHandleWrap}
        onPress={() => setIsFoodFormOpen((current) => !current)}
      >
        <View
          style={[
            styles.foodHandle,
            {
              backgroundColor: colors.accent,
              opacity: isFoodFormOpen ? 1 : 0.55,
            },
          ]}
        />
      </Pressable>

      {isFoodFormOpen && (
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
            placeholder="Название еды..."
            placeholderTextColor={colors.textSoft}
            value={foodTitle}
            onChangeText={setFoodTitle}
          />

          <View style={styles.foodGrid}>
            <TextInput
              style={[
                styles.foodInput,
                {
                  backgroundColor: colors.input,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholderTextColor={colors.textSoft}
              placeholder="ккал"
              value={foodCalories}
              onChangeText={setFoodCalories}
              keyboardType="numeric"
            />

            <TextInput
              style={[
                styles.foodInput,
                {
                  backgroundColor: colors.input,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholderTextColor={colors.textSoft}
              placeholder="белки"
              value={foodProtein}
              onChangeText={setFoodProtein}
              keyboardType="numeric"
            />

            <TextInput
              style={[
                styles.foodInput,
                {
                  backgroundColor: colors.input,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholderTextColor={colors.textSoft}
              placeholder="жиры"
              value={foodFat}
              onChangeText={setFoodFat}
              keyboardType="numeric"
            />

            <TextInput
              style={[
                styles.foodInput,
                {
                  backgroundColor: colors.input,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholderTextColor={colors.textSoft}
              placeholder="углеводы"
              value={foodCarbs}
              onChangeText={setFoodCarbs}
              keyboardType="numeric"
            />
          </View>

          <Pressable
            style={[styles.foodAddButton, { backgroundColor: colors.accent }]}
            onPress={handleAddFoodTask}
          >
            <Text style={[styles.foodAddButtonText, { color: colors.accentText }]}>
              Добавить еду
            </Text>
          </Pressable>
        </>
      )}
    </View>
  );
}
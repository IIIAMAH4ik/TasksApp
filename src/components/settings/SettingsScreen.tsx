import { Pressable, ScrollView, Text, View } from 'react-native';

import ProgressCard from '@/components/tasks/ProgressCard';
import { styles } from '@/styles/index.styles';

type SettingsScreenProps = {
  progress: {
    total: number;
    done: number;
    left: number;
    percent: number;
  };
  onClose: () => void;
};

export default function SettingsScreen({
  progress,
  onClose,
}: SettingsScreenProps) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.settingsHeader}>
        <View>
          <Text style={styles.title}>Настройки</Text>
          <Text style={styles.subtitle}>Аккаунт, темы и внешний вид</Text>
        </View>

        <Pressable style={styles.settingsBackButton} onPress={onClose}>
          <Text style={styles.settingsBackText}>Назад</Text>
        </Pressable>
      </View>

      <View style={styles.settingsCard}>
        <Text style={styles.settingsSectionTitle}>Статистика за день</Text>
        <ProgressCard progress={progress} />
      </View>

      <View style={styles.settingsCard}>
        <Text style={styles.settingsSectionTitle}>Внешний вид</Text>

        <View style={styles.themeRow}>
          <Pressable style={[styles.themeButton, styles.themeButtonActive]}>
            <Text style={[styles.themeButtonText, styles.themeButtonTextActive]}>
              Тёмная
            </Text>
          </Pressable>

          <Pressable style={styles.themeButton}>
            <Text style={styles.themeButtonText}>Светлая</Text>
          </Pressable>
        </View>

        <Text style={styles.settingsHint}>
          Смену темы подключим позже. Сейчас приложение остаётся в тёмном оформлении.
        </Text>
      </View>
    </ScrollView>
  );
}
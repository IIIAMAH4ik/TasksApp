import { Pressable, ScrollView, Text, View } from 'react-native';

import ProgressCard from '@/components/tasks/ProgressCard';
import { useAppTheme } from '@/context/appthemecontext';
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
  const { themeMode, setThemeMode, colors } = useAppTheme();

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.screen }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.settingsHeader}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Настройки</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Статистика и внешний вид
          </Text>
        </View>

        <Pressable
          style={[
            styles.settingsBackButton,
            {
              borderColor: colors.border,
              backgroundColor: colors.card,
            },
          ]}
          onPress={onClose}
        >
          <Text style={[styles.settingsBackText, { color: colors.textMuted }]}>
            Назад
          </Text>
        </Pressable>
      </View>

      <View
        style={[
          styles.settingsCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.settingsSectionTitle, { color: colors.textSoft }]}>
          Статистика за день
        </Text>

        <ProgressCard progress={progress} />
      </View>

      <View
        style={[
          styles.settingsCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.settingsSectionTitle, { color: colors.textSoft }]}>
          Внешний вид
        </Text>

        <View style={styles.themeRow}>
          <Pressable
            style={[
              styles.themeButton,
              {
                backgroundColor:
                  themeMode === 'dark' ? colors.accent : colors.cardSoft,
                borderColor:
                  themeMode === 'dark' ? colors.accent : colors.border,
              },
            ]}
            onPress={() => setThemeMode('dark')}
          >
            <Text
              style={[
                styles.themeButtonText,
                {
                  color:
                    themeMode === 'dark' ? colors.accentText : colors.textMuted,
                },
              ]}
            >
              Тёмная
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.themeButton,
              {
                backgroundColor:
                  themeMode === 'light' ? colors.accent : colors.cardSoft,
                borderColor:
                  themeMode === 'light' ? colors.accent : colors.border,
              },
            ]}
            onPress={() => setThemeMode('light')}
          >
            <Text
              style={[
                styles.themeButtonText,
                {
                  color:
                    themeMode === 'light' ? colors.accentText : colors.textMuted,
                },
              ]}
            >
              Светлая
            </Text>
          </Pressable>
        </View>

        <Text style={[styles.settingsHint, { color: colors.textSoft }]}>
          Тема сохраняется локально на устройстве.
        </Text>
      </View>
    </ScrollView>
  );
}
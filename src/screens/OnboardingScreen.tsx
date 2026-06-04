import { Pressable, StyleSheet, Text, View } from 'react-native';

type OnboardingScreenProps = {
  onStart: () => void;
};

export default function OnboardingScreen({ onStart }: OnboardingScreenProps) {
  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.badge}>Локальный планер</Text>

        <Text style={styles.title}>My Tasks</Text>

        <Text style={styles.subtitle}>
          Планер работает без регистрации и хранит данные локально на устройстве.
        </Text>

        <View style={styles.steps}>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>1</Text>
            <View style={styles.stepBody}>
              <Text style={styles.stepTitle}>Задачи по дням</Text>
              <Text style={styles.stepText}>
                Создавай задачи на конкретную дату и переключайся между днями стрелками.
              </Text>
            </View>
          </View>

          <View style={styles.step}>
            <Text style={styles.stepNumber}>2</Text>
            <View style={styles.stepBody}>
              <Text style={styles.stepTitle}>Темы и вечные задачи</Text>
              <Text style={styles.stepText}>
                Разделяй задачи по темам. Звёздочка делает задачу повторяющейся каждый день.
              </Text>
            </View>
          </View>

          <View style={styles.step}>
            <Text style={styles.stepNumber}>3</Text>
            <View style={styles.stepBody}>
              <Text style={styles.stepTitle}>Еда и КБЖУ</Text>
              <Text style={styles.stepText}>
                Во вкладке “Еда” можно записывать приёмы пищи и видеть дневную сумму.
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.hint}>
          Позже добавим экспорт и импорт данных, чтобы переносить планер между телефоном и компьютером.
        </Text>

        <Pressable style={styles.startButton} onPress={onStart}>
          <Text style={styles.startButtonText}>Начать</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0f0f11',
    justifyContent: 'center',
    padding: 18,
  },
  card: {
    backgroundColor: '#18181c',
    borderColor: 'rgba(255,255,255,0.09)',
    borderWidth: 1,
    borderRadius: 22,
    padding: 22,
  },
  badge: {
    alignSelf: 'flex-start',
    color: '#0f0f11',
    backgroundColor: '#b8a98a',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  title: {
    color: '#f6f2ec',
    fontSize: 38,
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {
    color: '#aaa6a0',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  steps: {
    gap: 14,
    marginBottom: 18,
  },
  step: {
    flexDirection: 'row',
    gap: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 999,
    backgroundColor: 'rgba(184,169,138,0.16)',
    color: '#b8a98a',
    textAlign: 'center',
    lineHeight: 28,
    fontWeight: '700',
  },
  stepBody: {
    flex: 1,
  },
  stepTitle: {
    color: '#f6f2ec',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 3,
  },
  stepText: {
    color: '#6d6963',
    fontSize: 13,
    lineHeight: 18,
  },
  hint: {
    color: '#6d6963',
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 18,
  },
  startButton: {
    backgroundColor: '#b8a98a',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#0f0f11',
    fontSize: 15,
    fontWeight: '700',
  },
});
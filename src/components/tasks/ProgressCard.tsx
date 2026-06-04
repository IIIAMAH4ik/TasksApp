import { Text, View } from 'react-native';

import ProgressRing from '@/components/progressring';
import { useAppTheme } from '@/context/appthemecontext';
import { styles } from '@/styles/index.styles';

type ProgressCardProps = {
  progress: {
    total: number;
    done: number;
    left: number;
    percent: number;
  };
};

export default function ProgressCard({ progress }: ProgressCardProps) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.progressCard,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.progressTopRow}>
        <View style={styles.progressMain}>
          <Text style={[styles.progressPercent, { color: colors.success }]}>
            {progress.percent}%
          </Text>

          <Text style={[styles.progressHint, { color: colors.textSoft }]}>
            прогресс за день
          </Text>
        </View>

        <View style={styles.progressChartWrap}>
          <ProgressRing progress={progress.percent} />
        </View>
      </View>

      <View style={styles.progressStats}>
        <View>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {progress.total}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSoft }]}>
            Всего
          </Text>
        </View>

        <View>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {progress.done}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSoft }]}>
            Готово
          </Text>
        </View>

        <View>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {progress.left}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSoft }]}>
            Осталось
          </Text>
        </View>
      </View>
    </View>
  );
}
import { Text, View } from 'react-native';

import ProgressRing from '@/components/progressring';
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
  return (
    <View style={styles.progressCard}>
      <View style={styles.progressTopRow}>
        <View style={styles.progressMain}>
          <Text style={styles.progressPercent}>{progress.percent}%</Text>
          <Text style={styles.progressHint}>прогресс за день</Text>
        </View>

        <View style={styles.progressChartWrap}>
          <ProgressRing progress={progress.percent} />
        </View>
      </View>

      <View style={styles.progressStats}>
        <View>
          <Text style={styles.statValue}>{progress.total}</Text>
          <Text style={styles.statLabel}>Всего</Text>
        </View>

        <View>
          <Text style={styles.statValue}>{progress.done}</Text>
          <Text style={styles.statLabel}>Готово</Text>
        </View>

        <View>
          <Text style={styles.statValue}>{progress.left}</Text>
          <Text style={styles.statLabel}>Осталось</Text>
        </View>
      </View>
    </View>
  );
}
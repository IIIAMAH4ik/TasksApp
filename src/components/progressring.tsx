import { StyleSheet, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

type ProgressRingProps = {
  progress: number;
  size?: number;
  strokeWidth?: number;
};

export default function ProgressRing({
  progress,
  size = 92,
  strokeWidth = 10,
}: ProgressRingProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (clampedProgress / 100) * circumference;

  return (
    <View style={styles.wrapper}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${center}, ${center}`}>
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={strokeWidth}
            fill="none"
          />

          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke="#6dbf8e"
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
          />
        </G>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: 92,
    height: 92,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
});
import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';
import { Colors, BorderRadius } from '../../constants/theme';

export function LoadingSkeleton({
  width, height, style,
}: { width?: number | string; height?: number; style?: ViewStyle }) {
  const opacity = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View
      style={[
        {
          opacity,
          backgroundColor: Colors.surfaceElevated,
          borderRadius: BorderRadius.md,
          width: (width as any) ?? '100%',
          height: height ?? 16,
        },
        style,
      ]}
    />
  );
}


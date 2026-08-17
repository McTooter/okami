import { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { PlatformPressable } from "@react-navigation/elements";
import * as Haptics from "expo-haptics";
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

import { useSphynx } from "@/lib/sphynx-store";

const AnimatedPlatformPressable = Animated.createAnimatedComponent(PlatformPressable);

export function HapticTab(props: BottomTabBarButtonProps) {
  const press = useSharedValue(0);
  const { material, sound } = useSphynx();
  const direction = material.id === "noir-pulse" ? -1 : material.id === "sunlit-signal" ? 1 : 0;
  const motionStyle = useAnimatedStyle(() => ({
    opacity: interpolate(press.value, [0, 1], [1, 0.78]),
    transform: sound.motionReduced ? [] : [{ scale: interpolate(press.value, [0, 1], [1, 0.94]) }, { translateX: press.value * direction * 1.5 }],
  }), [direction, sound.motionReduced]);

  return (
    <AnimatedPlatformPressable
      {...props}
      style={[props.style, motionStyle]}
      onPressIn={(ev) => {
        press.value = withTiming(1, { duration: 90 });
        if (process.env.EXPO_OS === "ios") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        props.onPressIn?.(ev);
      }}
      onPressOut={(ev) => {
        press.value = withTiming(0, { duration: 145 });
        props.onPressOut?.(ev);
      }}
    />
  );
}

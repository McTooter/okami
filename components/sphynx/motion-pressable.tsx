import { type ReactNode } from "react";
import { Pressable, type PressableProps, type PressableStateCallbackType, type StyleProp, type ViewStyle } from "react-native";
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

import { useSphynx } from "@/lib/sphynx-store";

type MotionPressableProps = Omit<PressableProps, "children" | "style"> & {
  children: ReactNode;
  style?: StyleProp<ViewStyle> | ((state: PressableStateCallbackType) => StyleProp<ViewStyle>);
  emphasis?: "standard" | "primary" | "compact";
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Shared interaction feedback for Sphynx controls. The treatment remains
 * intentionally brief, while material-specific directional response makes
 * every direct control feel alive without delaying its action.
 */
export function MotionPressable({ children, emphasis = "standard", onPressIn, onPressOut, style, ...props }: MotionPressableProps) {
  const { material, sound } = useSphynx();
  const press = useSharedValue(0);
  const motionReduced = sound.motionReduced;
  const direction = material.id === "noir-pulse" ? -1 : material.id === "sunlit-signal" ? 1 : 0;
  const compression = emphasis === "primary" ? 0.968 : emphasis === "compact" ? 0.982 : 0.976;
  const travel = emphasis === "primary" ? 2.4 : 1.4;

  const feedbackStyle = useAnimatedStyle(() => ({
    opacity: interpolate(press.value, [0, 1], [1, 0.86]),
    transform: motionReduced
      ? []
      : [
          { scale: interpolate(press.value, [0, 1], [1, compression]) },
          { translateX: press.value * direction * travel },
          { translateY: material.id === "sunlit-signal" ? press.value * travel : 0 },
        ],
  }), [compression, direction, material.id, motionReduced, travel]);

  return (
    <AnimatedPressable
      {...props}
      onPressIn={(event) => {
        press.value = withTiming(1, { duration: 90 });
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        press.value = withTiming(0, { duration: 145 });
        onPressOut?.(event);
      }}
      style={(state) => [typeof style === "function" ? style(state) : style, feedbackStyle]}
    >
      {children}
    </AnimatedPressable>
  );
}

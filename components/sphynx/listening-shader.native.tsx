import { Canvas, Fill, Shader, Skia, vec } from "@shopify/react-native-skia";
import { useMemo } from "react";
import { StyleSheet } from "react-native";

const LISTENING_FIELD_SHADER = Skia.RuntimeEffect.Make(`
  uniform vec2 resolution;
  uniform vec4 accent;
  uniform vec4 ink;
  uniform float activity;

  half4 main(vec2 pos) {
    vec2 uv = pos / resolution;
    vec2 point = uv - vec2(0.5);
    float radius = length(point);
    float rings = 0.5 + 0.5 * sin(radius * 70.0 - activity * 1.4);
    float bands = 0.5 + 0.5 * sin(point.y * 31.0 + sin(point.x * 9.0) * 1.9 + activity);
    float vignette = smoothstep(0.79, 0.16, radius);
    float signal = rings * 0.18 + bands * 0.11;
    vec3 color = mix(ink.rgb, accent.rgb, signal * vignette);
    return half4(color, (0.14 + signal * 0.34) * vignette);
  }
`);

function rgbaFromHex(value: string): [number, number, number, number] {
  const normalized = value.replace("#", "").trim();
  const expanded = normalized.length === 3
    ? normalized.split("").map((character) => `${character}${character}`).join("")
    : normalized;

  if (!/^[0-9a-fA-F]{6}$/.test(expanded)) return [1, 1, 1, 1];

  return [
    Number.parseInt(expanded.slice(0, 2), 16) / 255,
    Number.parseInt(expanded.slice(2, 4), 16) / 255,
    Number.parseInt(expanded.slice(4, 6), 16) / 255,
    1,
  ];
}

type ListeningShaderProps = {
  accent: string;
  foreground: string;
  isPlaying: boolean;
  motionReduced: boolean;
  size: number;
};

/**
 * A compact GPU shader layer. Its low opacity supports the album artwork rather
 * than replacing it, and it intentionally never represents audio measurements.
 */
export function ListeningShader({ accent, foreground, isPlaying, motionReduced, size }: ListeningShaderProps) {
  const uniforms = useMemo(() => ({
    resolution: vec(size, size),
    accent: rgbaFromHex(accent),
    ink: rgbaFromHex(foreground),
    activity: isPlaying && !motionReduced ? 1 : 0,
  }), [accent, foreground, isPlaying, motionReduced, size]);

  if (!LISTENING_FIELD_SHADER) return null;

  return (
    <Canvas pointerEvents="none" style={styles.canvas}>
      <Fill>
        <Shader source={LISTENING_FIELD_SHADER} uniforms={uniforms} />
      </Fill>
    </Canvas>
  );
}

const styles = StyleSheet.create({
  canvas: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0 },
});

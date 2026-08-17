import { Canvas, Fill, Shader, Skia, vec } from "@shopify/react-native-skia";
import { useMemo } from "react";
import { StyleSheet } from "react-native";

const LISTENING_FIELD_SHADER = Skia.RuntimeEffect.Make(`
  uniform vec2 resolution;
  uniform vec4 accent;
  uniform vec4 ink;
  uniform float activity;
  uniform float material;
  uniform float energy;

  half4 main(vec2 pos) {
    vec2 uv = pos / resolution;
    vec2 point = uv - vec2(0.5);
    float radius = length(point);
    float rings = 0.5 + 0.5 * sin(radius * (70.0 + material * 14.0) - activity * 1.4);
    float bands = 0.5 + 0.5 * sin(point.y * (31.0 + material * 5.0) + sin(point.x * (9.0 + material * 2.0)) * 1.9 + activity);
    float broadcast = 0.5 + 0.5 * sin((point.x + point.y) * 42.0 + radius * 9.0);
    float vignette = smoothstep(0.79, 0.16, radius);
    float field = mix(rings, bands, material * 0.52);
    field = mix(field, broadcast, max(0.0, material - 1.0));
    float signal = (field * 0.29) * energy;
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
  mode: 0 | 1 | 2;
  energy: number;
};

/**
 * A compact GPU shader layer. Its low opacity supports the album artwork rather
 * than replacing it, and it intentionally never represents audio measurements.
 */
export function ListeningShader({ accent, foreground, isPlaying, motionReduced, size, mode, energy }: ListeningShaderProps) {
  const uniforms = useMemo(() => ({
    resolution: vec(size, size),
    accent: rgbaFromHex(accent),
    ink: rgbaFromHex(foreground),
    activity: isPlaying && !motionReduced ? 1 : 0,
    material: mode,
    energy,
  }), [accent, energy, foreground, isPlaying, mode, motionReduced, size]);

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

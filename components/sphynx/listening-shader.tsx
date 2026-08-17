type ListeningShaderProps = {
  accent: string;
  foreground: string;
  isPlaying: boolean;
  motionReduced: boolean;
  size: number;
  mode: 0 | 1 | 2;
  energy: number;
};

/** Platform-specific native and web implementations override this fallback. */
export function ListeningShader(_: ListeningShaderProps) {
  return null;
}

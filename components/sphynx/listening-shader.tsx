type ListeningShaderProps = {
  accent: string;
  foreground: string;
  isPlaying: boolean;
  motionReduced: boolean;
  size: number;
};

/** Platform-specific native and web implementations override this fallback. */
export function ListeningShader(_: ListeningShaderProps) {
  return null;
}

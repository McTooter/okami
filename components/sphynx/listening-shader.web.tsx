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
 * Web retains the SVG atmosphere from the parent listening field. This avoids
 * loading CanvasKit in the regular web preview while keeping visual hierarchy.
 */
export function ListeningShader(_: ListeningShaderProps) {
  return null;
}

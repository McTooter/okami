export type ListeningFieldTilt = {
  x: number;
  y: number;
};

export const MAX_LISTENING_FIELD_TILT = 3.5;

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

/**
 * Converts a point inside the listening field into a deliberately shallow
 * perspective tilt. This is a visual response to touch, not an audio meter.
 */
export function listeningFieldTiltFromPoint(
  x: number,
  y: number,
  width: number,
  height: number,
): ListeningFieldTilt {
  if (!Number.isFinite(x) || !Number.isFinite(y) || width <= 0 || height <= 0) {
    return { x: 0, y: 0 };
  }

  const horizontal = clamp((x / width - 0.5) * 2, -1, 1);
  const vertical = clamp((y / height - 0.5) * 2, -1, 1);

  const tiltX = clamp(-vertical * MAX_LISTENING_FIELD_TILT, -MAX_LISTENING_FIELD_TILT, MAX_LISTENING_FIELD_TILT);
  const tiltY = clamp(horizontal * MAX_LISTENING_FIELD_TILT, -MAX_LISTENING_FIELD_TILT, MAX_LISTENING_FIELD_TILT);

  return {
    x: Object.is(tiltX, -0) ? 0 : tiltX,
    y: Object.is(tiltY, -0) ? 0 : tiltY,
  };
}

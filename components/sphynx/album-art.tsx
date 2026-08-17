import Svg, {
  Circle,
  Defs,
  G,
  Line,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from "react-native-svg";

import { type ArtworkId } from "@/lib/sphynx-store";

type AlbumArtProps = {
  artwork: ArtworkId;
  size: number;
  radius?: number;
};

export function AlbumArt({ artwork, size, radius = 16 }: AlbumArtProps) {
  const common = { width: size, height: size, viewBox: "0 0 100 100" };
  const clipId = `clip-${artwork}-${size}`;

  return (
    <Svg {...common}>
      <Defs>
        <LinearGradient id={`${clipId}-lime`} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#E3FF82" />
          <Stop offset="1" stopColor="#5E7E20" />
        </LinearGradient>
        <LinearGradient id={`${clipId}-blue`} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#92B1FF" />
          <Stop offset="1" stopColor="#373EAB" />
        </LinearGradient>
        <LinearGradient id={`${clipId}-sun`} x1="0" y1="1" x2="1" y2="0">
          <Stop offset="0" stopColor="#E65D35" />
          <Stop offset="1" stopColor="#FFC972" />
        </LinearGradient>
        <LinearGradient id={`${clipId}-pink`} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#EE91F3" />
          <Stop offset="1" stopColor="#5E256A" />
        </LinearGradient>
        <LinearGradient id={`${clipId}-gold`} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#FFEB8A" />
          <Stop offset="1" stopColor="#B35C1C" />
        </LinearGradient>
        <LinearGradient id={`${clipId}-aqua`} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#8CF2E8" />
          <Stop offset="1" stopColor="#276D72" />
        </LinearGradient>
      </Defs>
      <G clipPath={`url(#${clipId})`}>
        <Rect width="100" height="100" rx={radius} fill="#121418" />
        {artwork === "interval" ? (
          <>
            <Rect width="100" height="100" fill="#1A2515" />
            <Circle cx="69" cy="30" r="54" fill={`url(#${clipId}-lime)`} />
            <Path d="M-8 78 L34 45 L57 63 L110 17" stroke="#101B0D" strokeWidth="8" fill="none" />
            <Path d="M-8 86 L34 53 L57 71 L110 25" stroke="#D9FC71" strokeWidth="1.5" fill="none" />
            <Line x1="12" y1="12" x2="12" y2="88" stroke="#E7FF9C" strokeWidth="1" opacity="0.7" />
          </>
        ) : null}
        {artwork === "horizon" ? (
          <>
            <Rect width="100" height="100" fill={`url(#${clipId}-blue)`} />
            <Rect y="61" width="100" height="39" fill="#0A1736" />
            <Circle cx="64" cy="45" r="23" fill="#D8E3FF" opacity="0.96" />
            <Path d="M0 73 C20 52, 33 85, 54 64 S80 81, 100 50" stroke="#8DA8FF" strokeWidth="2" fill="none" />
            <Path d="M0 81 C20 60, 33 93, 54 72 S80 89, 100 58" stroke="#DAE3FF" strokeWidth="1" fill="none" opacity="0.8" />
          </>
        ) : null}
        {artwork === "kepler" ? (
          <>
            <Rect width="100" height="100" fill="#25120D" />
            <Circle cx="50" cy="50" r="41" fill={`url(#${clipId}-sun)`} />
            <Circle cx="50" cy="50" r="29" fill="#2A150F" />
            <Circle cx="50" cy="50" r="17" fill="#FCB56D" />
            <Path d="M8 50 H92" stroke="#FFF1CC" strokeWidth="1" opacity="0.55" />
            <Path d="M50 8 V92" stroke="#FFF1CC" strokeWidth="1" opacity="0.55" />
            <Circle cx="50" cy="50" r="6" fill="#2A150F" />
          </>
        ) : null}
        {artwork === "sleepwalk" ? (
          <>
            <Rect width="100" height="100" fill="#211324" />
            <Rect x="10" y="10" width="80" height="80" rx="40" fill={`url(#${clipId}-pink)`} />
            <Path d="M28 66 C35 31, 43 75, 51 36 S69 76, 76 35" stroke="#211324" strokeWidth="8" fill="none" />
            <Path d="M27 65 C35 30, 43 74, 51 35 S69 75, 76 34" stroke="#FFF0FF" strokeWidth="1.5" fill="none" />
            <Circle cx="50" cy="50" r="5" fill="#211324" />
          </>
        ) : null}
        {artwork === "verge" ? (
          <>
            <Rect width="100" height="100" fill="#39210C" />
            <Circle cx="54" cy="50" r="47" fill={`url(#${clipId}-gold)`} />
            <Path d="M0 68 L100 31" stroke="#42210A" strokeWidth="12" />
            <Path d="M-5 76 L105 35" stroke="#FFF4BB" strokeWidth="1.5" />
            <Circle cx="20" cy="22" r="2" fill="#FFF7C9" />
            <Circle cx="83" cy="73" r="2" fill="#FFF7C9" />
          </>
        ) : null}
        {artwork === "resonance" ? (
          <>
            <Rect width="100" height="100" fill="#0D2529" />
            <Circle cx="50" cy="50" r="43" fill={`url(#${clipId}-aqua)`} />
            {[18, 28, 38].map((radiusValue) => (
              <Circle
                key={radiusValue}
                cx="50"
                cy="50"
                r={radiusValue}
                fill="none"
                stroke="#10363B"
                strokeWidth="4"
              />
            ))}
            <Path d="M17 52 C33 24, 47 77, 84 44" stroke="#E1FFFA" strokeWidth="2" fill="none" />
          </>
        ) : null}
      </G>
      <Defs>
        <Path id={clipId} d={`M0 ${radius} Q0 0 ${radius} 0 H${100 - radius} Q100 0 100 ${radius} V${100 - radius} Q100 100 ${100 - radius} 100 H${radius} Q0 100 0 ${100 - radius}Z`} />
      </Defs>
    </Svg>
  );
}

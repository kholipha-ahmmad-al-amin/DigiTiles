import { memo, useId } from "react";
import type { SurfacePlan } from "@/lib/surface-planning";
import type { SwatchPattern } from "@/lib/types";

const SWATCH_TONES: Record<SwatchPattern, [string, string, string]> = {
  "carrara-marble": ["#e5e1db", "#faf8f2", "#7f858c"],
  "concrete-matt": ["#849095", "#adb4b5", "#485358"],
  "terracotta-rustic": ["#a34e33", "#c7734d", "#642b22"],
  "travertine-warm": ["#ceac8a", "#e7c8a1", "#927659"],
  "onyx-gloss": ["#d5b682", "#f5e6b5", "#8b633e"],
  "wood-oak-plank": ["#9a6943", "#b48251", "#60391e"],
  "mosaic-teal": ["#246a66", "#548f80", "#0d4547"],
  "granite-speckle": ["#66646a", "#88848a", "#3c3b40"],
  "sanitary-porcelain": ["#e8eaec", "#ffffff", "#a1a9b1"],
  "adhesive-mortar": ["#535b62", "#788188", "#333c43"],
};

const GROUT_TONES: Record<SurfacePlan["grout"], string> = {
  ivory: "#f1e8d5",
  cement: "#8d8b83",
  charcoal: "#373638",
  terracotta: "#a35742",
};

const LIGHT_TONES: Record<SurfacePlan["light"], string> = {
  warm: "#eeb056",
  daylight: "#fbf8ed",
  cool: "#a5c9ef",
};

const SCREEN_WIDTH = 960;
const SCREEN_HEIGHT = 520;
const FLOOR_BACK = 264;

type Point = [number, number];
type Projection = (x: number, y: number) => Point;

const planProjection: Projection = (x, y) => [x * SCREEN_WIDTH, y * SCREEN_HEIGHT];
const wallProjection: Projection = (x, y) => [x * SCREEN_WIDTH, 181 + 132 * y];
const floorProjection: Projection = (x, y) => {
  const depth = 1 / (1 - y * 0.48);
  return [
    SCREEN_WIDTH / 2 + (x - 0.5) * 620 * depth,
    FLOOR_BACK + (SCREEN_HEIGHT - FLOOR_BACK) * y * depth * 0.52,
  ];
};

function projectPoints(points: Point[], project: Projection) {
  return points.map(([x, y]) => project(x, y).map((coordinate) => coordinate.toFixed(2)).join(",")).join(" ");
}

function clipToSurface(points: Point[]) {
  const boundaries = [
    { axis: 0, edge: 0, sign: 1 },
    { axis: 0, edge: 1, sign: -1 },
    { axis: 1, edge: 0, sign: 1 },
    { axis: 1, edge: 1, sign: -1 },
  ] as const;

  for (const { axis, edge, sign } of boundaries) {
    const clipped: Point[] = [];
    for (let i = 0; i < points.length; i++) {
      const end = points[i];
      const start = points[(i + points.length - 1) % points.length];
      const insideStart = (start[axis] - edge) * sign >= 0;
      const insideEnd = (end[axis] - edge) * sign >= 0;
      if (insideStart !== insideEnd) {
        const fraction = (edge - start[axis]) / (end[axis] - start[axis]);
        clipped.push([start[0] + (end[0] - start[0]) * fraction, start[1] + (end[1] - start[1]) * fraction]);
      }
      if (insideEnd) clipped.push(end);
    }
    points = clipped;
  }
  return points;
}

function tilePolygons(
  pattern: SurfacePlan["pattern"],
  joint: number,
  dimensions: string,
  aspect: number,
  project: Projection
) {
  const match = dimensions.match(/(\d+)\s*[x×]\s*(\d+)/i);
  const ratio = match ? Math.min(2.5, Math.max(0.65, Number(match[1]) / Number(match[2]))) : 1;
  const herringbone = pattern === "herringbone";
  const tileWidth = herringbone ? 0.055 : 0.099 * ratio;
  const tileHeight = herringbone ? tileWidth : 0.099;
  const rotation = herringbone || pattern === "diagonal" ? Math.PI / 4 : 0;
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  const halfWidth = (cos + aspect * sin) / 2;
  const halfHeight = (sin + aspect * cos) / 2;
  const minColumn = Math.floor((0.5 - halfWidth) / tileWidth) - 2;
  const maxColumn = Math.ceil((0.5 + halfWidth) / tileWidth);
  const minRow = Math.floor((aspect / 2 - halfHeight) / tileHeight) - 2;
  const maxRow = Math.ceil((aspect / 2 + halfHeight) / tileHeight);
  const gap = joint * 0.0013;
  const tiles: { key: string; points: string; tone: number }[] = [];

  for (let row = minRow; row < maxRow; row++) {
    for (let column = minColumn; column < maxColumn; column++) {
      const phase = ((column - row) % 4 + 4) % 4;
      if (herringbone && phase !== 0 && phase !== 3) continue;
      const offset = pattern === "brick" && row % 2 !== 0 ? tileWidth / 2 : 0;
      const width = herringbone && phase === 0 ? tileWidth * 2 : tileWidth;
      const height = herringbone && phase === 3 ? tileHeight * 2 : tileHeight;
      const x = column * tileWidth + offset + gap / 2;
      const y = row * tileHeight + gap / 2;
      const right = x + width - gap;
      const bottom = y + height - gap;
      const corners = [[x, y], [right, y], [right, bottom], [x, bottom]];
      const points = clipToSurface(corners.map(([u, v]) => [
        0.5 + (u - 0.5) * cos - (v - aspect / 2) * sin,
        (aspect / 2 + (u - 0.5) * sin + (v - aspect / 2) * cos) / aspect,
      ]));
      if (points.length < 3) continue;
      tiles.push({
        key: `${row}:${column}`,
        points: projectPoints(points, project),
        tone: Math.abs(row * 17 + column * 31) % 7,
      });
    }
  }
  return tiles;
}

function RoomArchitecture({ room }: { room: SurfacePlan["room"] }) {
  if (room === "kitchen") {
    return (
      <>
        <path d="M0 0H960V181H0Z" fill="#b9a896" />
        <path d="M53 43H383V180H53Z M580 43H907V180H580Z" fill="#454b46" stroke="#343c37" strokeWidth="4" />
        <path d="M164 43V180M274 43V180M687 43V180M796 43V180" stroke="#69706a" strokeWidth="3" />
        <path d="M456 40H512V123L555 164H413L456 123Z" fill="#6f756e" />
        <path d="M0 331H960V520H0Z" fill="#364640" />
        <path d="M0 311H960V337H0Z" fill="#e4d9c5" />
        <path d="M100 342V520M260 342V520M430 342V520M600 342V520M775 342V520M899 342V520" stroke="#6b7469" strokeWidth="3" />
      </>
    );
  }

  const leftWall = room === "bathroom" ? "#9bafac" : "#c4b39d";
  const backWall = room === "showroom" ? "#c5ccd0" : "#e5dac7";
  return (
    <>
      <path d="M0 0H170V264L0 416Z" fill={leftWall} />
      <path d="M170 0H790V264H170Z" fill={backWall} />
      <path d="M790 0H960V416L790 264Z" fill="#a29e93" />
      {room === "living" && (
        <>
          <path d="M215 34H454V202H215Z" fill="#d7e1dd" stroke="#8e8b78" strokeWidth="8" />
          <path d="M335 38V198M219 119H451" stroke="#9a9d90" strokeWidth="6" />
          <path d="M592 50H690V142H592Z" fill="#b47656" stroke="#ede3d3" strokeWidth="8" />
          <path d="M550 195Q550 178 567 178H730Q746 178 746 195V249H550Z" fill="#746b58" />
          <path d="M523 220H765V263H523Z" fill="#91816a" stroke="#6b6555" strokeWidth="4" />
          <path d="M543 263V279M747 263V279" stroke="#49483b" strokeWidth="7" />
        </>
      )}
      {room === "bathroom" && (
        <>
          <path d="M220 23H473V261H220Z" fill="#cadbd7" stroke="#819896" strokeWidth="6" />
          <path d="M355 27V258M456 116V166" stroke="#819896" strokeWidth="4" />
          <rect x="603" y="36" width="124" height="100" rx="48" fill="#c2d4d2" stroke="#8c9790" strokeWidth="5" />
          <path d="M564 166H754L735 222H582Z" fill="#f2f0e4" stroke="#9a9f94" strokeWidth="5" />
          <path d="M583 220H735V259H583Z" fill="#818b7a" />
        </>
      )}
      {room === "showroom" && (
        <>
          <path d="M233 25H728V245H233Z" fill="#dfe8ea" stroke="#6e797b" strokeWidth="8" />
          <path d="M362 27V245M480 27V245M599 27V245M234 98H727" stroke="#6e797b" strokeWidth="5" />
          <path d="M54 119L158 144V246L54 287Z" fill="#7c8886" stroke="#cfd2c7" strokeWidth="6" />
          <path d="M809 144L913 117V285L809 245Z" fill="#7c8886" stroke="#cfd2c7" strokeWidth="6" />
        </>
      )}
    </>
  );
}

export const RoomScene = memo(function RoomScene({
  pattern,
  room,
  joint,
  grout,
  light,
  view,
  swatch,
  dimensions,
  label,
}: Pick<SurfacePlan, "pattern" | "room" | "joint" | "grout" | "light" | "view"> & {
  swatch: SwatchPattern;
  dimensions: string;
  label: string;
}) {
  const id = useId();
  const isKitchen = room === "kitchen";
  const isPlan = view === "plan";
  const project = isPlan ? planProjection : isKitchen ? wallProjection : floorProjection;
  const surface = projectPoints([[0, 0], [1, 0], [1, 1], [0, 1]], project);
  const tiles = tilePolygons(pattern, Number(joint), dimensions, !isPlan && isKitchen ? 132 / SCREEN_WIDTH : SCREEN_HEIGHT / SCREEN_WIDTH, project);
  const [base, highlight, detail] = SWATCH_TONES[swatch] ?? SWATCH_TONES["carrara-marble"];

  return (
    <svg role="img" aria-label={label} viewBox="0 0 960 520" className="block w-full h-auto">
      <defs>
        <clipPath id={`${id}-surface`}><polygon points={surface} /></clipPath>
        <linearGradient id={`${id}-ceramic`} x2="0.86" y2="1">
          <stop stopColor={highlight} />
          <stop offset="0.52" stopColor={base} />
          <stop offset="1" stopColor={highlight} />
        </linearGradient>
        <pattern id={`${id}-texture`} width="126" height="102" patternUnits="userSpaceOnUse">
          {swatch === "granite-speckle" || swatch === "concrete-matt" || swatch === "adhesive-mortar" ? (
            <path d="M10 20h2m30 11h2m43-12h2M20 58h3m36 16h2m24 12h2m25-28h3" stroke={detail} strokeWidth="2" fill="none" />
          ) : swatch === "wood-oak-plank" || swatch === "travertine-warm" ? (
            <path d="M0 12Q70 6 126 16M0 33Q54 23 126 35M0 67Q60 61 126 71M0 92Q82 86 126 93" stroke={detail} fill="none" />
          ) : (
            <path d="M-15 94Q24 72 46 52T137 4M-15 95Q12 86 47 66T137 30" stroke={detail} strokeWidth="1.3" fill="none" />
          )}
        </pattern>
        <linearGradient id={`${id}-light`} x2="0" y2="1">
          <stop stopColor={LIGHT_TONES[light]} stopOpacity={light === "daylight" ? 0.13 : 0.31} />
          <stop offset="1" stopColor={LIGHT_TONES[light]} stopOpacity={light === "daylight" ? 0.04 : 0.15} />
        </linearGradient>
      </defs>
      {!isPlan && <RoomArchitecture room={room} />}
      <g clipPath={`url(#${id}-surface)`}>
        <polygon points={surface} fill={GROUT_TONES[grout]} />
        {tiles.map((tile) => (
          <g key={tile.key}>
            <polygon points={tile.points} fill={`url(#${id}-ceramic)`} />
            <polygon points={tile.points} fill={detail} opacity={tile.tone * 0.023} />
            <polygon points={tile.points} fill={`url(#${id}-texture)`} opacity="0.26" />
          </g>
        ))}
      </g>
      {!isPlan && isKitchen && (
        <>
          <path d="M660 312V277Q660 255 682 255Q705 255 705 276V287" fill="none" stroke="#313937" strokeWidth="8" />
          <path d="M681 312H781" stroke="#484b43" strokeWidth="6" />
        </>
      )}
      <rect width="960" height="520" fill={`url(#${id}-light)`} pointerEvents="none" />
    </svg>
  );
});

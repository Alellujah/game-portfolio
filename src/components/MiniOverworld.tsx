import { useEffect, useMemo, useRef, useState } from "react";

// === Config ===
const TILE_SIZE = 48; // px
// Legend:
// W = wall/tree (blocked)
// R = rock (blocked)
// B = water (blocked)
// G = grass (walkable, trigger)
// . = ground (walkable)
// = = path/dirt (walkable)  <-- use '-' character in the map
// F = flower patch (walkable, message)
// S = sign (walkable, message)
// P = player start (only for placement)
const MAP_RAW = [
  "WWWWWWWWWW",
  "W--....-SW",
  "W..GGGG..W",
  "W.RGBBG..W",
  "W..F..-..W",
  "W....P...W",
  "W--------W",
  "WWWWWWWWWW",
];

type Tile = "W" | "R" | "B" | "G" | "." | "-" | "F" | "S" | "P";

function parseMap(raw: string[]) {
  const grid: Tile[][] = raw.map((row) => row.split("") as Tile[]);
  // Normalize: treat player start 'P' as ground for rendering/walkable grid
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x] === "P") grid[y][x] = ".";
    }
  }
  let start = { x: 1, y: 1 };
  raw.forEach((row, y) => {
    const px = row.indexOf("P");
    if (px !== -1) start = { x: px, y };
  });
  return { grid, start };
}

export default function MiniOverworld() {
  const { grid, start } = useMemo(() => parseMap(MAP_RAW), []);
  const [pos, setPos] = useState(start); // {x, y}
  const [facing, setFacing] = useState<"up" | "down" | "left" | "right">(
    "down"
  );
  const [message, setMessage] = useState("Usa as setas ou WASD para mexer.");
  const containerRef = useRef<HTMLDivElement | null>(null);
  // === Tilesheet calibration state ===
  const [sheetCols, setSheetCols] = useState(16); // how many columns in background_tiles.png
  const SHEET_IMG_PX = 1024; // image size (square)
  const sheetTilePx = Math.floor(SHEET_IMG_PX / sheetCols);
  const [calib, setCalib] = useState(false); // calibration overlay

  const rows = grid.length;
  const cols = grid[0].length;

  const isWalkable = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= cols || y >= rows) return false;
    const t = grid[y][x];
    return t !== "W" && t !== "R" && t !== "B"; // paredes, rochas e água bloqueiam
  };

  const handleStep = (x: number, y: number) => {
    const tile = grid[y][x];
    if (tile === "G") {
      setMessage("🌿 Entraste nas ervas!");
      // Aqui você pode disparar um callback para abrir a battle UI
    } else if (tile === "F") {
      setMessage("🌸 Um canteiro de flores perfumadas.");
    } else if (tile === "S") {
      setMessage("📜 Uma placa antiga: 'Pressiona WASD para explorar.'");
    } else if (tile === "-") {
      setMessage("Trilha de terra batida.");
    } else if (tile === ".") {
      setMessage("Caminho livre.");
    } else {
      setMessage("Bloqueado.");
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      let dx = 0,
        dy = 0,
        dir: typeof facing = facing;

      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          dy = -1;
          dir = "up";
          break;
        case "ArrowDown":
        case "s":
        case "S":
          dy = 1;
          dir = "down";
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          dx = -1;
          dir = "left";
          break;
        case "ArrowRight":
        case "d":
        case "D":
          dx = 1;
          dir = "right";
          break;
        case "+": // decrease sheet columns
          setSheetCols((c) => Math.max(1, c - 1));
          setMessage(
            () =>
              `🔧 sheetCols=${Math.max(1, sheetCols - 1)} (tilePx≈${Math.floor(
                SHEET_IMG_PX / Math.max(1, sheetCols - 1)
              )})`
          );
          return;
        case "]": // increase sheet columns
          setSheetCols((c) => Math.min(64, c + 1));
          setMessage(
            () =>
              `🔧 sheetCols=${Math.min(64, sheetCols + 1)} (tilePx≈${Math.floor(
                SHEET_IMG_PX / Math.min(64, sheetCols + 1)
              )})`
          );
          return;
        default:
          break;
      }

      if (e.key === "c" || e.key === "C") {
        // toggle calibration overlay
        setCalib((v) => !v);
        setMessage(
          () =>
            `🧪 Calibration: ${
              !calib ? "ON" : "OFF"
            } (cols=${sheetCols}, tilePx≈${sheetTilePx})`
        );
        return;
      }

      setFacing(dir);
      const nx = pos.x + dx;
      const ny = pos.y + dy;
      if (isWalkable(nx, ny)) {
        setPos({ x: nx, y: ny });
        handleStep(nx, ny);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [pos, facing, sheetCols, calib, sheetTilePx]);

  // para focar o container e capturar teclas em alguns navegadores
  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100 p-6">
      <div className="space-y-3">
        <div className="text-center">
          <h1 className="text-xl font-semibold">Mini Overworld</h1>
          <p className="text-slate-300 text-sm">
            Setas / WASD para mover • Não atravessas árvores
          </p>
        </div>

        {/* World */}
        <div
          ref={containerRef}
          tabIndex={0}
          className="relative outline-none rounded-2xl shadow-xl crt"
          style={{
            width: cols * TILE_SIZE,
            height: rows * TILE_SIZE,
            overflow: "hidden",
          }}
        >
          {/* Tiles */}
          <div
            className="grid"
            style={{
              gridTemplateColumns: `repeat(${cols}, ${TILE_SIZE}px)`,
              gridTemplateRows: `repeat(${rows}, ${TILE_SIZE}px)`,
            }}
          >
            {grid.map((row, y) =>
              row.map((cell, x) => (
                <TileView
                  key={`${x}-${y}`}
                  tile={cell}
                  calib={calib}
                  tilePx={sheetTilePx}
                  imgPx={SHEET_IMG_PX}
                />
              ))
            )}
          </div>

          {/* Player */}
          <div
            className="absolute transition-transform duration-75"
            style={{
              transform: `translate(${pos.x * TILE_SIZE}px, ${
                pos.y * TILE_SIZE
              }px)`,
              width: TILE_SIZE,
              height: TILE_SIZE,
              left: 0,
              top: 0,
            }}
          >
            <Player facing={facing} />
          </div>
        </div>

        {/* HUD mensagenzinha */}
        <div className="rounded-xl bg-slate-800 px-4 py-3 text-sm shadow-inner min-w-[320px]">
          <div>{message}</div>
          {calib && (
            <div className="mt-1 text-xs text-slate-400">
              🧪 calib ON • sheetCols={sheetCols} • tilePx≈{sheetTilePx}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// === Tilesheet (background_tiles.png) support ===
const TILE_SHEET_SRC = "/background_tiles.png";

function SpriteTile({
  sx,
  sy,
  size = TILE_SIZE,
  tilePx,
  imgPx,
}: {
  sx: number;
  sy: number;
  size?: number;
  tilePx: number;
  imgPx: number;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        backgroundImage: `url(${TILE_SHEET_SRC})`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: `-${sx * tilePx}px -${sy * tilePx}px`,
        backgroundSize: `${imgPx}px ${imgPx}px`,
        imageRendering: "pixelated",
        outline: "1px solid rgba(0,0,0,0.2)",
      }}
    />
  );
}

// Map logical tiles to sheet coordinates (column = sx, row = sy)
// Ajusta facilmente estes números para usar outros quadrados do teu sheet
const SHEET_MAP: Record<Tile, { sx: number; sy: number }> = {
  W: { sx: 0, sy: 0 }, // árvore/borda
  R: { sx: 3, sy: 2 }, // rocha
  B: { sx: 4, sy: 2 }, // água
  G: { sx: 1, sy: 0 }, // erva
  ".": { sx: 2, sy: 3 }, // chão
  "-": { sx: 0, sy: 3 }, // trilha
  F: { sx: 2, sy: 1 }, // flores
  S: { sx: 5, sy: 1 }, // placa
  P: { sx: 2, sy: 3 }, // não usado (vira "."), mas deixo aqui
};

function TileView({
  tile,
  calib,
  tilePx,
  imgPx,
}: {
  tile: Tile;
  calib: boolean;
  tilePx: number;
  imgPx: number;
}) {
  const mapping = SHEET_MAP[tile] ?? SHEET_MAP["."];
  if (TILE_SHEET_SRC) {
    return (
      <div
        style={{ position: "relative", width: TILE_SIZE, height: TILE_SIZE }}
      >
        <SpriteTile
          sx={mapping.sx}
          sy={mapping.sy}
          size={TILE_SIZE}
          tilePx={tilePx}
          imgPx={imgPx}
        />
        {calib && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "grid",
              placeItems: "start",
              fontSize: 10,
              padding: 2,
              color: "rgba(255,255,255,0.8)",
            }}
          >
            {mapping.sx},{mapping.sy}
          </div>
        )}
      </div>
    );
  }
  // Fallback to SVGs (if you remove the sheet)
  switch (tile) {
    case "W":
      return (
        <div
          style={{ width: TILE_SIZE, height: TILE_SIZE }}
          aria-label="Árvore/Parede"
        >
          <TreeTileSVG />
        </div>
      );
    case "R":
      return (
        <div style={{ width: TILE_SIZE, height: TILE_SIZE }} aria-label="Rocha">
          <RockTileSVG />
        </div>
      );
    case "B":
      return (
        <div style={{ width: TILE_SIZE, height: TILE_SIZE }} aria-label="Água">
          <WaterTileSVG />
        </div>
      );
    case "G":
      return (
        <div
          style={{ width: TILE_SIZE, height: TILE_SIZE }}
          aria-label="Erva alta"
        >
          <GrassTileSVG />
        </div>
      );
    case "-":
      return (
        <div
          style={{ width: TILE_SIZE, height: TILE_SIZE }}
          aria-label="Trilha de terra"
        >
          <PathTileSVG />
        </div>
      );
    case "F":
      return (
        <div
          style={{ width: TILE_SIZE, height: TILE_SIZE }}
          aria-label="Flores"
        >
          <FlowerTileSVG />
        </div>
      );
    case "S":
      return (
        <div style={{ width: TILE_SIZE, height: TILE_SIZE }} aria-label="Placa">
          <SignTileSVG />
        </div>
      );
    default:
      return (
        <div style={{ width: TILE_SIZE, height: TILE_SIZE }} aria-label="Chão">
          <GroundTileSVG />
        </div>
      );
  }
}

function GroundTileSVG() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="100%"
      height="100%"
      shapeRendering="crispEdges"
    >
      <defs>
        <linearGradient id="gnd" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a1e16" />
          <stop offset="100%" stopColor="#2a3224" />
        </linearGradient>
        <pattern id="dither" width="2" height="2" patternUnits="userSpaceOnUse">
          <rect
            width="1"
            height="1"
            x="0"
            y="0"
            fill="rgba(255,255,255,0.04)"
          />
        </pattern>
      </defs>
      <rect x="0" y="0" width="16" height="16" fill="url(#gnd)" />
      <rect x="0" y="0" width="16" height="16" fill="url(#dither)" />
    </svg>
  );
}

function GrassTileSVG() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="100%"
      height="100%"
      shapeRendering="crispEdges"
    >
      <defs>
        <linearGradient id="gr" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22442e" />
          <stop offset="100%" stopColor="#2e5a3a" />
        </linearGradient>
        <pattern id="grd" width="2" height="2" patternUnits="userSpaceOnUse">
          <rect width="1" height="1" x="1" y="0" fill="rgba(0,0,0,0.1)" />
        </pattern>
      </defs>
      <rect x="0" y="0" width="16" height="16" fill="url(#gr)" />
      <rect x="0" y="0" width="16" height="16" fill="url(#grd)" />
      {Array.from({ length: 6 }).map((_, i) => (
        <path
          key={i}
          d={`M ${2 + i * 2} 16 L ${2 + i * 2 - 0.9} 9 L ${
            2 + i * 2 + 0.9
          } 9 Z`}
          fill="#3a7b4b"
        />
      ))}
      {Array.from({ length: 5 }).map((_, i) => (
        <path
          key={"b" + i}
          d={`M ${1 + i * 3} 16 L ${1 + i * 3 - 0.6} 11 L ${
            1 + i * 3 + 0.6
          } 11 Z`}
          fill="#2e6b41"
        />
      ))}
    </svg>
  );
}

function PathTileSVG() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="100%"
      height="100%"
      shapeRendering="crispEdges"
    >
      <defs>
        <linearGradient id="pth" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a2f23" />
          <stop offset="100%" stopColor="#2b231a" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="16" height="16" fill="url(#pth)" />
      {Array.from({ length: 6 }).map((_, i) => (
        <rect
          key={i}
          x={(i * 3) % 16}
          y={(i * 2) % 16}
          width="1"
          height="1"
          fill="rgba(0,0,0,0.35)"
        />
      ))}
    </svg>
  );
}

function RockTileSVG() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="100%"
      height="100%"
      shapeRendering="crispEdges"
    >
      <rect x="0" y="0" width="16" height="16" fill="#2a3224" />
      <rect x="4" y="6" width="8" height="6" rx="1" ry="1" fill="#69705a" />
      <rect x="5" y="7" width="6" height="4" rx="1" ry="1" fill="#8a917a" />
      <rect x="4" y="12" width="8" height="1" fill="rgba(0,0,0,0.4)" />
    </svg>
  );
}

function WaterTileSVG() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="100%"
      height="100%"
      shapeRendering="crispEdges"
    >
      <defs>
        <linearGradient id="wtr" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0b3a4a" />
          <stop offset="100%" stopColor="#0e5168" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="16" height="16" fill="url(#wtr)" />
      {/* wavelets */}
      {Array.from({ length: 5 }).map((_, i) => (
        <rect
          key={i}
          x={1 + i * 3}
          y={4 + (i % 2)}
          width="4"
          height="1"
          fill="rgba(255,255,255,0.25)"
        />
      ))}
    </svg>
  );
}

function FlowerTileSVG() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="100%"
      height="100%"
      shapeRendering="crispEdges"
    >
      <rect x="0" y="0" width="16" height="16" fill="#2e5a3a" />
      {/* stems */}
      {Array.from({ length: 3 }).map((_, i) => (
        <rect key={i} x={3 + i * 4} y={7} width="1" height="6" fill="#2e6b41" />
      ))}
      {/* petals */}
      {[
        [4, 6],
        [8, 5],
        [12, 7],
      ].map(([cx, cy], i) => (
        <g key={i}>
          <rect x={cx - 1} y={cy - 1} width="2" height="2" fill="#b23a48" />
          <rect x={cx} y={cy} width="1" height="1" fill="#ffd166" />
        </g>
      ))}
    </svg>
  );
}

function SignTileSVG() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="100%"
      height="100%"
      shapeRendering="crispEdges"
    >
      <rect x="0" y="0" width="16" height="16" fill="#2a3224" />
      {/* post */}
      <rect x="7" y="5" width="2" height="7" fill="#6b4f2a" />
      {/* board */}
      <rect x="3" y="3" width="10" height="5" fill="#7c5a33" />
      <rect x="4" y="4" width="8" height="3" fill="#9a6f3f" />
      {/* text lines */}
      <rect x="5" y="5" width="6" height="1" fill="#2b231a" />
    </svg>
  );
}

function TreeTileSVG() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="100%"
      height="100%"
      shapeRendering="crispEdges"
    >
      <defs>
        <pattern id="bark" width="2" height="2" patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="1" height="2" fill="#4c3820" />
          <rect x="1" y="0" width="1" height="2" fill="#5a4124" />
        </pattern>
      </defs>
      {/* trunk */}
      <rect x="7" y="8" width="2" height="6" fill="url(#bark)" />
      {/* canopy */}
      <rect x="2" y="2" width="12" height="8" fill="#143b2a" />
      <rect x="3" y="3" width="10" height="6" fill="#1d5a40" />
      {/* border */}
      <rect
        x="0"
        y="0"
        width="16"
        height="16"
        fill="none"
        stroke="#0a1510"
        strokeWidth="1"
      />
    </svg>
  );
}

// === Player sprite (player.png) support ===
// Place file at: public/assets/player.png
const PLAYER_SHEET_SRC = "/player.png";
const PLAYER_COLS = 2; // 2x2 grid in your image
// If your player.png is square (e.g., 768x768), each frame size = image/cols
const PLAYER_IMG_PX = 768; // your image is 768x768 per attachment
const PLAYER_TILE_PX = Math.floor(PLAYER_IMG_PX / PLAYER_COLS);

function PlayerSprite({
  sx,
  sy,
  size = TILE_SIZE,
}: {
  sx: number;
  sy: number;
  size?: number;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        backgroundImage: `url(${PLAYER_SHEET_SRC})`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: `-${sx * PLAYER_TILE_PX}px -${
          sy * PLAYER_TILE_PX
        }px`,
        backgroundSize: `${PLAYER_IMG_PX}px ${PLAYER_IMG_PX}px`,
        imageRendering: "pixelated",
      }}
    />
  );
}

function Player({ facing }: { facing: "up" | "down" | "left" | "right" }) {
  // Map facing → (sx, sy) on the 2x2 sheet
  // Assumption based on your image (adjust if needed):
  //  (0,0): facing DOWN  | (1,0): facing RIGHT
  //  (0,1): facing LEFT  | (1,1): facing UP
  const coord =
    facing === "down"
      ? { sx: 0, sy: 0 }
      : facing === "right"
      ? { sx: 1, sy: 0 }
      : facing === "left"
      ? { sx: 0, sy: 1 }
      : { sx: 1, sy: 1 };

  return <PlayerSprite sx={coord.sx} sy={coord.sy} size={TILE_SIZE} />;
}

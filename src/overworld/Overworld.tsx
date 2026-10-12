import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import World from "./World";
import DialogBox from "./DialogBox";
import {
  DECOR_CELLS,
  INTERACTABLES,
  INTRO_PAGES,
  MAP_H,
  MAP_W,
  RIVAL,
  SPAWN,
  rivalPages,
  type Cell,
  type Dir,
  type Page,
} from "./content";
import { createController, frontCell } from "./controller";

const KEY_DIRS: Record<string, Dir> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  w: "up",
  s: "down",
  a: "left",
  d: "right",
};
const INTERACT_KEYS = new Set(["Enter", " ", "z", "Z"]);

const key = (c: Cell) => `${c[0]},${c[1]}`;

type Props = {
  playerId: string | undefined;
  playerFront: string;
  playerBack: string;
  rivalSprite: string;
  onBattle: () => void;
};

type Dialog = { id: string; pages: Page[] };

/**
 * Explorable HD-2D room: 3D environment, 2D billboard sprites.
 * Inspecting objects reveals info about Fábio; talking to the rival starts the battle.
 */
export default function Overworld({
  playerId,
  playerFront,
  playerBack,
  rivalSprite,
  onBattle,
}: Props) {
  const ctrl = useRef(createController(SPAWN));
  const [dialog, setDialog] = useState<Dialog | null>({
    id: "intro",
    pages: INTRO_PAGES,
  });
  const [visited, setVisited] = useState<Set<string>>(() => new Set());

  const { blocked, byCell } = useMemo(() => {
    const byCell = new Map<string, string>();
    for (const it of INTERACTABLES) for (const c of it.cells) byCell.set(key(c), it.id);
    byCell.set(key(RIVAL), "rival");
    const blocked = new Set<string>([...byCell.keys(), ...DECOR_CELLS.map(key)]);
    return { blocked, byCell };
  }, []);

  const walkable = useCallback(
    (c: Cell) =>
      c[0] >= 0 && c[0] < MAP_W && c[1] >= 0 && c[1] < MAP_H && !blocked.has(key(c)),
    [blocked]
  );

  // Freeze movement while a dialog is open
  useEffect(() => {
    ctrl.current.locked = dialog !== null;
    if (dialog) ctrl.current.held = [];
  }, [dialog]);

  const interact = useCallback(() => {
    const c = ctrl.current;
    if (c.t < 1) return;
    const id = byCell.get(key(frontCell(c)));
    if (!id) return;
    if (id === "rival") {
      setDialog({ id, pages: rivalPages(playerId, visited.size) });
      return;
    }
    const it = INTERACTABLES.find((i) => i.id === id);
    if (it) setDialog({ id, pages: it.pages });
  }, [byCell, playerId, visited.size]);

  const closeDialog = useCallback(() => {
    if (!dialog) return;
    if (dialog.id === "rival") {
      onBattle();
      return;
    }
    if (dialog.id !== "intro") setVisited((v) => new Set(v).add(dialog.id));
    setDialog(null);
  }, [dialog, onBattle]);

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (dialog) return; // DialogBox handles its own keys
      const dir = KEY_DIRS[e.key];
      if (dir) {
        e.preventDefault();
        const c = ctrl.current;
        // Always queue one step so quick taps register even on slow frames.
        // Synthetic events (on-screen d-pad) never send keyup, so only real keys are "held".
        if (!e.repeat) c.queued = dir;
        if (e.isTrusted && !e.repeat) c.held = [...c.held.filter((d) => d !== dir), dir];
        return;
      }
      if (INTERACT_KEYS.has(e.key)) {
        e.preventDefault();
        interact();
      }
    };
    const onUp = (e: KeyboardEvent) => {
      const dir = KEY_DIRS[e.key];
      if (dir) ctrl.current.held = ctrl.current.held.filter((d) => d !== dir);
    };
    const clearHeld = () => (ctrl.current.held = []);
    document.addEventListener("keydown", onDown);
    document.addEventListener("keyup", onUp);
    window.addEventListener("blur", clearHeld);
    return () => {
      document.removeEventListener("keydown", onDown);
      document.removeEventListener("keyup", onUp);
      window.removeEventListener("blur", clearHeld);
    };
  }, [dialog, interact]);

  return (
    <div className="absolute inset-0 scene-fade-in">
      <Canvas
        shadows
        dpr={[1, 1.5]}
        gl={{ antialias: false }}
        resize={{ offsetSize: true }}
        camera={{ fov: 32, position: [5, 8.4, 14.5], near: 0.1, far: 60 }}
      >
        <Suspense fallback={null}>
          <World
            ctrl={ctrl}
            walkable={walkable}
            playerFront={playerFront}
            playerBack={playerBack}
            rivalSprite={rivalSprite}
          />
        </Suspense>
      </Canvas>

      <div className="absolute top-2 left-2 z-10 bg-white border-4 border-black px-2 py-1 text-[11px]">
        FOUND {visited.size}/{INTERACTABLES.length}
      </div>

      {dialog && <DialogBox key={dialog.id} pages={dialog.pages} onClose={closeDialog} />}
    </div>
  );
}

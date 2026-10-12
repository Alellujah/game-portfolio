import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import World from "./World";
import DialogBox from "./DialogBox";
import {
  AMALIE_SPAWN,
  DECOR_CELLS,
  INTERACTABLES,
  INTRO_PAGES,
  MAP_H,
  MAP_W,
  RIVAL,
  SPAWN,
  amaliePages,
  rivalPages,
  type Cell,
  type Dir,
  type Page,
} from "./content";
import { createController, occupies } from "./controller";

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
const OPPOSITE: Record<Dir, Dir> = { up: "down", down: "up", left: "right", right: "left" };
const SHEETS = { developer: "/sprites/fabio.png", recruiter: "/sprites/recruiter.png" };

// Amalie runs: much quicker steps than the player
const AMALIE_STEP_SECONDS = 0.13;
// How long the "!" shows over the rival before they speak
const ALERT_MS = 750;
// Must match the .battle-transition animation in index.css
const BATTLE_TRANSITION_MS = 1300;

const key = (c: Cell) => `${c[0]},${c[1]}`;

type Props = {
  playerId: string | undefined;
  onBattle: () => void;
};

type Dialog = { id: string; pages: Page[] };

/**
 * Explorable HD-2D room: 3D environment, 2D billboard sprites.
 * Inspecting objects reveals info about Fábio; talking to the rival starts the battle.
 */
export default function Overworld({ playerId, onBattle }: Props) {
  const isRecruiter = playerId === "recruiter";
  const ctrl = useRef(createController(SPAWN));
  const amalie = useRef(createController(AMALIE_SPAWN, AMALIE_STEP_SECONDS, "left"));
  const amalieTalks = useRef(0);

  const [dialog, setDialog] = useState<Dialog | null>({ id: "intro", pages: INTRO_PAGES });
  const [visited, setVisited] = useState<Set<string>>(() => new Set());
  const [target, setTarget] = useState<string | null>(null);
  const [rivalFacing, setRivalFacing] = useState<Dir>("down");
  const [rivalAlert, setRivalAlert] = useState(false);
  const [transition, setTransition] = useState(false);

  const { blocked, byCell } = useMemo(() => {
    const byCell = new Map<string, string>();
    for (const it of INTERACTABLES) for (const c of it.cells) byCell.set(key(c), it.id);
    byCell.set(key(RIVAL), "rival");
    const blocked = new Set<string>([...byCell.keys(), ...DECOR_CELLS.map(key)]);
    return { blocked, byCell };
  }, []);

  const baseWalkable = useCallback(
    (c: Cell) =>
      c[0] >= 0 && c[0] < MAP_W && c[1] >= 0 && c[1] < MAP_H && !blocked.has(key(c)),
    [blocked]
  );
  const playerWalkable = useCallback(
    (c: Cell) => baseWalkable(c) && !occupies(amalie.current, c),
    [baseWalkable]
  );
  const amalieWalkable = useCallback(
    (c: Cell) => baseWalkable(c) && !occupies(ctrl.current, c),
    [baseWalkable]
  );
  const targetAt = useCallback(
    (c: Cell) => (occupies(amalie.current, c) ? "amalie" : byCell.get(key(c)) ?? null),
    [byCell]
  );

  // Freeze the player (and Amalie, when talking to her) while busy
  const busy = dialog !== null || rivalAlert || transition;
  useEffect(() => {
    ctrl.current.locked = busy;
    if (busy) ctrl.current.held = [];
    amalie.current.locked = dialog?.id === "amalie";
  }, [busy, dialog]);

  const interact = useCallback(() => {
    const c = ctrl.current;
    if (c.t < 1 || !target) return;
    if (target === "rival") {
      // Classic trainer encounter: "!" first, then they speak
      setRivalFacing(OPPOSITE[c.facing]);
      setRivalAlert(true);
      window.setTimeout(() => {
        setRivalAlert(false);
        setDialog({ id: "rival", pages: rivalPages(playerId, visited.size) });
      }, ALERT_MS);
      return;
    }
    if (target === "amalie") {
      amalie.current.facing = OPPOSITE[c.facing];
      setDialog({ id: "amalie", pages: amaliePages(amalieTalks.current++) });
      return;
    }
    const it = INTERACTABLES.find((i) => i.id === target);
    if (it) setDialog({ id: target, pages: it.pages });
  }, [target, playerId, visited.size]);

  const closeDialog = useCallback(() => {
    if (!dialog) return;
    if (dialog.id === "rival") {
      setDialog(null);
      setTransition(true);
      window.setTimeout(onBattle, BATTLE_TRANSITION_MS);
      return;
    }
    if (INTERACTABLES.some((i) => i.id === dialog.id))
      setVisited((v) => new Set(v).add(dialog.id));
    setDialog(null);
  }, [dialog, onBattle]);

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (busy) return; // DialogBox handles its own keys
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
  }, [busy, interact]);

  return (
    <div className="absolute inset-0">
      <Canvas
        shadows
        // Fixed dpr keeps the Game Boy pixel grid exact
        dpr={1}
        gl={{ antialias: false }}
        resize={{ offsetSize: true }}
        camera={{ fov: 32, position: [5, 9.5, 14], near: 0.1, far: 60 }}
      >
        <Suspense fallback={null}>
          <World
            ctrl={ctrl}
            amalie={amalie}
            playerWalkable={playerWalkable}
            amalieWalkable={amalieWalkable}
            targetAt={targetAt}
            onTarget={setTarget}
            playerSheet={isRecruiter ? SHEETS.recruiter : SHEETS.developer}
            rivalSheet={isRecruiter ? SHEETS.developer : SHEETS.recruiter}
            rivalFacing={rivalFacing}
            rivalAlert={rivalAlert}
            dialogOpen={dialog !== null}
            visited={visited}
          />
        </Suspense>
      </Canvas>

      <div className="absolute top-2 left-2 z-10 bg-white border-4 border-black px-2 py-1 text-[11px]">
        FOUND {visited.size}/{INTERACTABLES.length}
      </div>

      {target && !busy && (
        <div className="absolute bottom-2 right-2 z-10 bg-white border-4 border-black px-2 py-1 text-[11px] hint-pop">
          A / ENTER: {target === "rival" || target === "amalie" ? "TALK" : "INSPECT"}
        </div>
      )}

      {dialog && <DialogBox key={dialog.id} pages={dialog.pages} onClose={closeDialog} />}

      {/* Fade in from black when entering the room */}
      <div className="absolute inset-0 z-30 bg-black pointer-events-none fade-from-black" />
      {transition && <div className="absolute inset-0 z-40 battle-transition" />}
    </div>
  );
}

import { useEffect, useMemo, useRef, type RefObject } from "react";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import {
  Bloom,
  EffectComposer,
  TiltShift2,
  Vignette,
} from "@react-three/postprocessing";
import * as THREE from "three";
import { MAP_H, MAP_W, RIVAL, type Cell, type Dir } from "./content";
import { stepController, type Controller } from "./controller";
import * as tex from "./textures";

type Vec3 = [number, number, number];

const CAMERA_OFFSET = new THREE.Vector3(0, 9.5, 8.5);
// 16x24 px sprites: one tile wide, 1.5 tiles tall
const SPRITE_H = 1.5;
// Sprites lean back a bit towards the camera, HD-2D style
const SPRITE_TILT = -0.5;

function assetUrl(path: string) {
  return path.startsWith("/") ? import.meta.env.BASE_URL + path.slice(1) : path;
}

/* ---------------------------------- props --------------------------------- */

type BlockProps = {
  position: Vec3;
  size: Vec3;
  color: string;
  // Texture for one face, by BoxGeometry material index (0:+x 1:-x 2:+y 3:-y 4:+z 5:-z)
  face?: { index: number; map: THREE.Texture; emissive?: number };
};

function Block({ position, size, color, face }: BlockProps) {
  const materials = useMemo(() => {
    const base = new THREE.MeshStandardMaterial({ color, roughness: 0.9 });
    const list: THREE.Material[] = Array(6).fill(base);
    if (face) {
      list[face.index] = new THREE.MeshStandardMaterial({
        map: face.map,
        roughness: 0.8,
        emissiveMap: face.emissive ? face.map : null,
        emissive: face.emissive ? new THREE.Color("#ffffff") : new THREE.Color("#000000"),
        emissiveIntensity: face.emissive ?? 0,
      });
    }
    return list;
  }, [color, face]);

  return (
    <mesh position={position} material={materials} castShadow receiveShadow>
      <boxGeometry args={size} />
    </mesh>
  );
}

function Plant({ cell }: { cell: Cell }) {
  return (
    <group position={[cell[0], 0, cell[1]]}>
      <mesh position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.17, 0.5, 8]} />
        <meshStandardMaterial color="#b5653a" roughness={1} />
      </mesh>
      <mesh position={[0, 0.85, 0]} castShadow>
        <icosahedronGeometry args={[0.42, 0]} />
        <meshStandardMaterial color="#3f8f4a" roughness={1} flatShading />
      </mesh>
      <mesh position={[0.15, 1.15, 0.05]} castShadow>
        <icosahedronGeometry args={[0.25, 0]} />
        <meshStandardMaterial color="#56a85e" roughness={1} flatShading />
      </mesh>
    </group>
  );
}

function ServerLeds() {
  const leds = useRef<THREE.Mesh[]>([]);
  const colors = ["#3cff7a", "#3cff7a", "#ffb43c", "#3cff7a", "#3caaff", "#3cff7a"];
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    leds.current.forEach((m, i) => {
      const mat = m.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = Math.sin(t * (3 + i * 1.7) + i) > 0.2 ? 4 : 0.3;
    });
  });
  return (
    <>
      {colors.map((c, i) => (
        <mesh
          key={i}
          ref={(m) => {
            if (m) leds.current[i] = m;
          }}
          position={[-0.28, 0.25 + i * 0.3, 0.41]}
        >
          <boxGeometry args={[0.06, 0.06, 0.02]} />
          <meshStandardMaterial color={c} emissive={c} emissiveIntensity={2} />
        </mesh>
      ))}
    </>
  );
}

function Room() {
  const t = useMemo(
    () => ({
      floor: tex.woodFloor([MAP_W, MAP_H]),
      wall: tex.wallpaper([MAP_W + 1, 3]),
      sideWall: tex.wallpaper([MAP_H + 1, 3]),
      wainscot: tex.wainscot([MAP_W + 1, 1]),
      rug: tex.rug(),
      books: tex.books(),
      window: tex.pragueWindow(),
      code: tex.codeScreen(),
      game: tex.gameScreen(),
      server: tex.serverFront(),
      board: tex.whiteboard(),
    }),
    []
  );

  const cx = (MAP_W - 1) / 2;
  const cz = (MAP_H - 1) / 2;
  const wallH = 3.2;

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[cx, 0, cz]} receiveShadow>
        <planeGeometry args={[MAP_W, MAP_H]} />
        <meshStandardMaterial map={t.floor} roughness={0.85} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[5, 0.01, 4.5]} receiveShadow>
        <planeGeometry args={[4, 3]} />
        <meshStandardMaterial map={t.rug} roughness={1} />
      </mesh>

      {/* Walls */}
      <Block
        position={[cx, wallH / 2, -0.75]}
        size={[MAP_W + 1, wallH, 0.5]}
        color="#d9c9a6"
        face={{ index: 4, map: t.wall }}
      />
      <Block
        position={[cx, 0.5, -0.49]}
        size={[MAP_W + 1, 1, 0.02]}
        color="#5b6b4a"
        face={{ index: 4, map: t.wainscot }}
      />
      <Block
        position={[-0.75, wallH / 2, cz]}
        size={[0.5, wallH, MAP_H + 1]}
        color="#d9c9a6"
        face={{ index: 0, map: t.sideWall }}
      />
      <Block
        position={[MAP_W - 0.25, wallH / 2, cz]}
        size={[0.5, wallH, MAP_H + 1]}
        color="#d9c9a6"
        face={{ index: 1, map: t.sideWall }}
      />
      {/* Low front wall with a door gap at the rival's column */}
      <Block
        position={[(RIVAL[0] - 0.5 - 1) / 2, 0.25, MAP_H - 0.25]}
        size={[RIVAL[0] + 0.5, 0.5, 0.5]}
        color="#8a7a5c"
      />
      <Block
        position={[(RIVAL[0] + 0.5 + MAP_W) / 2, 0.25, MAP_H - 0.25]}
        size={[MAP_W - RIVAL[0] - 0.5, 0.5, 0.5]}
        color="#8a7a5c"
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[RIVAL[0], 0.005, MAP_H - 0.1]}>
        <planeGeometry args={[1, 0.8]} />
        <meshStandardMaterial color="#5a3b2a" />
      </mesh>

      {/* Window over Prague */}
      <group position={[6.5, 1.85, -0.48]}>
        <mesh>
          <boxGeometry args={[2.5, 1.75, 0.04]} />
          <meshStandardMaterial color="#f4efe4" />
        </mesh>
        <mesh position={[0, 0, 0.03]}>
          <planeGeometry args={[2.3, 1.55]} />
          <meshStandardMaterial
            map={t.window}
            emissiveMap={t.window}
            emissive="#ffffff"
            emissiveIntensity={1.3}
          />
        </mesh>
      </group>

      {/* Desk + PC (cells 0,0 and 1,0) */}
      <Block position={[0.5, 0.72, -0.05]} size={[1.9, 0.08, 0.85]} color="#7a4b2a" />
      <Block position={[-0.35, 0.36, -0.05]} size={[0.08, 0.72, 0.8]} color="#5e3820" />
      <Block position={[1.35, 0.36, -0.05]} size={[0.08, 0.72, 0.8]} color="#5e3820" />
      <Block
        position={[0.6, 1.12, -0.2]}
        size={[0.9, 0.6, 0.06]}
        color="#222"
        face={{ index: 4, map: t.code, emissive: 2.2 }}
      />
      <Block position={[0.6, 0.79, 0.15]} size={[0.6, 0.04, 0.2]} color="#ddd" />
      <mesh position={[-0.15, 1.05, -0.2]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshStandardMaterial color="#ffe1a0" emissive="#ffcf70" emissiveIntensity={6} />
      </mesh>
      <pointLight position={[-0.15, 1.2, 0]} color="#ffcf70" intensity={2.5} distance={4} />

      {/* Bookshelf (cells 3,0 and 4,0) */}
      <Block
        position={[3.5, 1.1, -0.15]}
        size={[1.9, 2.2, 0.6]}
        color="#4a2e1a"
        face={{ index: 4, map: t.books }}
      />

      {/* Server rack (cell 9,0) */}
      <group position={[9, 0, -0.05]}>
        <Block
          position={[0, 1, 0]}
          size={[0.85, 2, 0.8]}
          color="#1d1f24"
          face={{ index: 4, map: t.server }}
        />
        <ServerLeds />
      </group>

      {/* Whiteboard (cell 10,2), facing the room */}
      <Block
        position={[10.2, 1.35, 2]}
        size={[0.08, 1.1, 1.5]}
        color="#b0b0b0"
        face={{ index: 1, map: t.board, emissive: 0.15 }}
      />
      <Block position={[10.2, 0.4, 1.35]} size={[0.06, 0.8, 0.06]} color="#888" />
      <Block position={[10.2, 0.4, 2.65]} size={[0.06, 0.8, 0.06]} color="#888" />

      {/* TV + retro console (cells 0,4 and 0,5), facing the room */}
      <Block position={[-0.05, 0.3, 4.5]} size={[0.8, 0.6, 1.8]} color="#6b4a33" />
      <Block
        position={[-0.1, 0.98, 4.5]}
        size={[0.55, 0.75, 1.05]}
        color="#2a2a2e"
        face={{ index: 0, map: t.game, emissive: 1.8 }}
      />
      <Block position={[0.15, 0.64, 3.85]} size={[0.3, 0.08, 0.3]} color="#8b8b9a" />

      {/* Phone table (cell 10,5) */}
      <Block position={[10, 0.35, 5]} size={[0.7, 0.7, 0.7]} color="#7a4b2a" />
      <Block position={[10, 0.78, 5]} size={[0.3, 0.12, 0.2]} color="#c0392b" />
      <Block position={[9.85, 0.71, 5.2]} size={[0.15, 0.01, 0.15]} color="#ffe066" />

      {/* Plants */}
      <Plant cell={[10, 0]} />
      <Plant cell={[0, 8]} />
      <Plant cell={[10, 8]} />
    </group>
  );
}

/* -------------------------------- characters ------------------------------- */

// Sprite sheets: 4x4 frames (rows: down, up, left, right; cols: stand, walk A, stand, walk B)
const SHEET_COLS = 4;
const SHEET_ROWS = 4;
const FACING_ROW: Record<Dir, number> = { down: 0, up: 1, left: 2, right: 3 };

function Shadow() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
      <circleGeometry args={[0.32, 16]} />
      <meshBasicMaterial color="#000" transparent opacity={0.35} depthWrite={false} />
    </mesh>
  );
}

function useSheet(url: string) {
  const sheet = useLoader(THREE.TextureLoader, assetUrl(url));
  return useMemo(() => {
    // Each character gets its own texture so frame offsets don't clash
    const map = sheet.clone();
    map.colorSpace = THREE.SRGBColorSpace;
    map.magFilter = THREE.NearestFilter;
    map.minFilter = THREE.NearestFilter;
    map.generateMipmaps = false;
    map.repeat.set(1 / SHEET_COLS, 1 / SHEET_ROWS);
    map.needsUpdate = true;
    const material = new THREE.MeshStandardMaterial({
      map,
      alphaTest: 0.5,
      side: THREE.DoubleSide,
      roughness: 1,
      emissiveMap: map,
      emissive: new THREE.Color("#ffffff"),
      emissiveIntensity: 0.3,
    });
    const img = sheet.image as HTMLImageElement;
    const aspect = img.width / SHEET_COLS / (img.height / SHEET_ROWS);
    const setFrame = (facing: Dir, col: number) => {
      map.offset.set(col / SHEET_COLS, 1 - (FACING_ROW[facing] + 1) / SHEET_ROWS);
    };
    return { material, aspect, setFrame };
  }, [sheet]);
}

function CharacterSprite({
  material,
  aspect,
  spriteRef,
}: {
  material: THREE.Material;
  aspect: number;
  spriteRef: RefObject<THREE.Mesh | null>;
}) {
  return (
    <>
      <Shadow />
      <group rotation={[SPRITE_TILT, 0, 0]}>
        <mesh
          ref={spriteRef}
          material={material}
          position={[0, SPRITE_H / 2, 0]}
          scale={[SPRITE_H * aspect, SPRITE_H, 1]}
          castShadow
        >
          <planeGeometry args={[1, 1]} />
        </mesh>
      </group>
    </>
  );
}

function Player({ ctrl, sheetUrl }: { ctrl: RefObject<Controller>; sheetUrl: string }) {
  const { material, aspect, setFrame } = useSheet(sheetUrl);
  const group = useRef<THREE.Group>(null);
  const sprite = useRef<THREE.Mesh>(null);

  useFrame(() => {
    const c = ctrl.current;
    if (!group.current || !sprite.current) return;
    const x = THREE.MathUtils.lerp(c.from[0], c.tile[0], c.t);
    const z = THREE.MathUtils.lerp(c.from[1], c.tile[1], c.t);
    group.current.position.set(x, 0, z);

    // Gen 1 style: show a walk frame for the first part of each step, alternating feet
    const walking = c.t < 0.6;
    setFrame(c.facing, walking ? (c.steps % 2 ? 1 : 3) : 0);
    sprite.current.position.y = SPRITE_H / 2 + (walking ? 0.04 : 0);
  });

  return (
    <group ref={group}>
      <CharacterSprite material={material} aspect={aspect} spriteRef={sprite} />
    </group>
  );
}

function Rival({ sheetUrl, facing }: { sheetUrl: string; facing: Dir }) {
  const { material, aspect, setFrame } = useSheet(sheetUrl);
  const sprite = useRef<THREE.Mesh>(null);
  useFrame(() => setFrame(facing, 0));

  return (
    <group position={[RIVAL[0], 0, RIVAL[1]]}>
      <CharacterSprite material={material} aspect={aspect} spriteRef={sprite} />
    </group>
  );
}

/* ---------------------------------- scene ---------------------------------- */

function WindowLight() {
  const light = useRef<THREE.SpotLight>(null);
  useEffect(() => {
    const l = light.current;
    if (!l) return;
    l.target.position.set(6.5, 0, 4);
    l.target.updateMatrixWorld();
  }, []);
  return (
    <spotLight
      ref={light}
      position={[6.5, 2.4, 0.2]}
      angle={0.9}
      penumbra={0.8}
      intensity={14}
      distance={10}
      color="#ff9f7a"
    />
  );
}

function CameraRig({ ctrl }: { ctrl: RefObject<Controller> }) {
  const camera = useThree((s) => s.camera);
  const target = useRef(new THREE.Vector3());
  const look = useRef(new THREE.Vector3());

  useFrame((_, dt) => {
    const c = ctrl.current;
    const x = THREE.MathUtils.lerp(c.from[0], c.tile[0], c.t);
    const z = THREE.MathUtils.lerp(c.from[1], c.tile[1], c.t);
    // Keep the room framed: follow the player but clamp near the walls
    const fx = THREE.MathUtils.clamp(x, 3, MAP_W - 4);
    // Look slightly ahead (towards the camera) so the dialog box never hides the player
    const fz = THREE.MathUtils.clamp(z + 1, 2, MAP_H - 2);
    look.current.set(fx, 0.6, fz);
    target.current.copy(look.current).add(CAMERA_OFFSET);
    const k = 1 - Math.exp(-dt * 6);
    camera.position.lerp(target.current, k);
    camera.lookAt(camera.position.clone().sub(CAMERA_OFFSET).setY(0.6));
  });
  return null;
}

function Controls({
  ctrl,
  walkable,
}: {
  ctrl: RefObject<Controller>;
  walkable: (cell: Cell) => boolean;
}) {
  useFrame((_, dt) => stepController(ctrl.current, Math.min(dt, 0.1), walkable));
  return null;
}

type WorldProps = {
  ctrl: RefObject<Controller>;
  walkable: (cell: Cell) => boolean;
  playerSheet: string;
  rivalSheet: string;
  rivalFacing: Dir;
};

export default function World({
  ctrl,
  walkable,
  playerSheet,
  rivalSheet,
  rivalFacing,
}: WorldProps) {
  return (
    <>
      <color attach="background" args={["#120c12"]} />
      <hemisphereLight args={["#ffe9c4", "#4a3020", 0.9]} />
      <directionalLight
        position={[9, 9, 7]}
        intensity={1.6}
        color="#ffe2b8"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={9}
        shadow-camera-bottom={-9}
        shadow-bias={-0.0005}
      />
      {/* Warm dusk light spilling from the window */}
      <WindowLight />
      <pointLight position={[5, 2.8, 5]} intensity={6} distance={9} color="#ffd9a0" />

      <Controls ctrl={ctrl} walkable={walkable} />
      <CameraRig ctrl={ctrl} />
      <Room />
      <Player ctrl={ctrl} sheetUrl={playerSheet} />
      <Rival sheetUrl={rivalSheet} facing={rivalFacing} />

      <EffectComposer multisampling={0}>
        <Bloom mipmapBlur luminanceThreshold={0.85} intensity={0.9} />
        <TiltShift2 blur={0.2} taper={0.6} />
        <Vignette darkness={0.6} offset={0.3} />
      </EffectComposer>
    </>
  );
}

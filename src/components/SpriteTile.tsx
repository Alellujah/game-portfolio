type SpriteTileProps = {
  x: number; // coluna no tilesheet
  y: number; // linha no tilesheet
  size?: number; // tamanho do tile no ecrã
};

const TILE_SRC = "/background_tiles.png";
const TILE_SIZE = 16; // tamanho original no sheet (16x16 px)

export function SpriteTile({ x, y, size = 48 }: SpriteTileProps) {
  return (
    <div
      style={{
        width: size,
        height: size,
        backgroundImage: `url(${TILE_SRC})`,
        backgroundPosition: `-${x * TILE_SIZE}px -${y * TILE_SIZE}px`,
        backgroundSize: `auto`,
        imageRendering: "pixelated",
      }}
    />
  );
}

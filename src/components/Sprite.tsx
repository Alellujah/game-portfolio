interface SpriteProps {
  spriteUrl?: string;
  size?: number; // in pixels
}

/**
 * Displays a sprite.
 * - `spriteUrl`: URL of the sprite image.
 * - `size`: Size of the sprite in pixels (default: 96).
 */
function Sprite({ spriteUrl, size }: SpriteProps) {
  return (
    <div>
      {spriteUrl ? (
        <img
          style={{
            width: size ?? "80%",
            imageRendering: "pixelated",
          }}
          src={spriteUrl}
          alt="Sprite"
        />
      ) : (
        <div
          className="p-8 absolute bottom-0 left-0"
          style={{
            width: size ?? "256px",
            height: size,
            backgroundColor: "#ccc",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "#666",
          }}
        >
          No Sprite
        </div>
      )}
    </div>
  );
}

export default Sprite;

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
  // Resolve asset path for GitHub Pages (project subpath)
  const resolved = (() => {
    if (!spriteUrl) return undefined;
    // Ignore absolute http(s) or data URLs
    if (/^(?:https?:)?\/\//.test(spriteUrl) || spriteUrl.startsWith("data:")) {
      return spriteUrl;
    }
    // If it starts with a leading slash, prefix Vite base
    if (spriteUrl.startsWith("/")) {
      return import.meta.env.BASE_URL + spriteUrl.slice(1);
    }
    return spriteUrl;
  })();
  return (
    <div>
      {resolved ? (
        <img
          style={{
            width: size ?? "80%",
            imageRendering: "pixelated",
          }}
          src={resolved}
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

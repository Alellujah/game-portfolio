import React, { useState, useEffect, useCallback } from "react";

export interface Character {
  /** Unique identifier for the character. */
  id: string;
  /** Display name for the character. */
  name: string;
  /** Path or URL to the character sprite. */
  sprite: string;
  /** Short biography describing the character. */
  bio: string;
}

/**
 * Example character definitions.  Replace the `sprite` values with
 * your own image paths and adjust the bios to suit your game.
 */
const playerSpriteUrl = "/players/developer-front.png";
const enemySpriteUrl = "/players/recruiter-front.png";

const characters: Character[] = [
  {
    id: "developer",
    name: "Fabio the Developer",
    sprite: playerSpriteUrl,
    bio: "Me, the guy who had this stupid idea.",
  },
  {
    id: "recruiter",
    name: "IT Recruiter",
    sprite: enemySpriteUrl,
    bio: "A very focused individual often spotted near the coffee machine.",
  },
];

interface PlayerChoiceProps {
  /**
   * Callback fired when the user presses Enter.
   * Receives the selected character.
   */
  onSelect?: (character: Character) => void;
}

/**
 * Renders character cards and allows keyboard navigation.
 * Left/right arrows change selection; Enter confirms it.
 */
const PlayerChoice: React.FC<PlayerChoiceProps> = ({ onSelect }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Keep the key handler stable across renders.
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        // Move selection right (wrap to start).
        setSelectedIndex((prev) => (prev + 1) % characters.length);
      } else if (e.key === "ArrowLeft") {
        // Move selection left (wrap to end).
        setSelectedIndex(
          (prev) => (prev - 1 + characters.length) % characters.length
        );
      } else if (e.key === "Enter" && onSelect) {
        // Confirm the selection.
        onSelect(characters[selectedIndex]);
      }
    },
    [selectedIndex, onSelect]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <>
      <h3 className="mb-2 p-4">Who do you want to play as?</h3>
      <div className="flex justify-center items-start space-x-12 p-4 mt-2">
        {characters.map((char, index) => {
          const isSelected = index === selectedIndex;
          return (
            <div
              key={char.id}
              className={`flex flex-col items-center p-4 transition-transform duration-200 cursor-pointer ${
                isSelected
                  ? "scale-110 border-black-500 border-4"
                  : "scale-100 border-transparent border-2"
              }`}
              // Also allow mouse selection.
              onClick={() => setSelectedIndex(index)}
            >
              <img
                src={char.sprite}
                alt={char.name}
                className="w-24 h-24 object-contain mb-2"
              />
              <h3 className="text-sm font-bold mb-1 text-center">
                {char.name}
              </h3>
              <p className="text-xs text-gray-600 text-center max-w-xs">
                {char.bio}
              </p>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default PlayerChoice;

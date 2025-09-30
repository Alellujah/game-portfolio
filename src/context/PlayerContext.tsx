import React, { createContext, useContext, useState } from "react";
import type { Character } from "../features/PlayerChoice";

interface PlayerContextValue {
  selectedPlayer: Character | null;
  setSelectedPlayer: React.Dispatch<React.SetStateAction<Character | null>>;
}

const PlayerContext = createContext<PlayerContextValue | undefined>(undefined);

const PlayerProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [selectedPlayer, setSelectedPlayer] = useState<Character | null>(null);

  const value: PlayerContextValue = { selectedPlayer, setSelectedPlayer };

  return (
    <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
  );
};

const usePlayer = (): PlayerContextValue => {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
};

export { PlayerProvider, usePlayer };

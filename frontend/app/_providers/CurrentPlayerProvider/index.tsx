"use client";

import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useContext,
  useState,
} from "react";

type CurrentPlayerContextType = {
  currentPlayer: any;
  setCurrentPlayer: Dispatch<SetStateAction<any>>;
};

const CurrentPlayerContext = createContext<
  CurrentPlayerContextType | undefined
>(undefined);

type CurrentPlayerProviderProps = {
  player: any;
  children: ReactNode;
};

export function CurrentPlayerProvider({
  player,
  children,
}: CurrentPlayerProviderProps) {
  const [currentPlayer, setCurrentPlayer] = useState(player);

  return (
    <CurrentPlayerContext.Provider value={{ currentPlayer, setCurrentPlayer }}>
      {children}
    </CurrentPlayerContext.Provider>
  );
}

export const useCurrentPlayer = () => {
  const context = useContext(CurrentPlayerContext);
  if (context === undefined) {
    throw new Error(
      "useCurrentPlayer must be used within a CurrentPlayerProvider",
    );
  }
  return context;
};

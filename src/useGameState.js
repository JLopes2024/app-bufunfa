import { useState, useEffect } from "react";
import { initialState } from "./bufunfa";

// Mudamos para v7 para implementar o Lobby de Setup
const STORAGE_KEY = "@bufunfa:state:v7";

export function useGameState() {
  const [state, setState] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : initialState();
    } catch {
      return initialState();
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const resetGame = () => {
    if (window.confirm("Atenção: Isso apagará todo o progresso atual. Confirmar?")) {
      localStorage.removeItem(STORAGE_KEY);
      window.location.reload();
    }
  };

  return { state, setState, resetGame };
}
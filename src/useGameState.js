import { useEffect, useState } from 'react';
import { initialState, normalizeGameState } from './bufunfa';

const STORAGE_KEY = '@bufunfa:state:v8';
const LEGACY_STORAGE_KEYS = ['@bufunfa:state:v7'];

function loadGameState() {
  if (typeof window === 'undefined') {
    return { state: initialState(), error: null };
  }

  try {
    const current = localStorage.getItem(STORAGE_KEY);

    if (current) {
      return { state: normalizeGameState(JSON.parse(current)), error: null };
    }

    for (const legacyKey of LEGACY_STORAGE_KEYS) {
      const legacy = localStorage.getItem(legacyKey);
      if (legacy) {
        return { state: normalizeGameState(JSON.parse(legacy)), error: null };
      }
    }

    return { state: initialState(), error: null };
  } catch (error) {
    console.error('Falha ao carregar o estado do Bufunfa:', error);
    return {
      state: initialState(),
      error: 'Não foi possível carregar a partida salva neste navegador.',
    };
  }
}

export function useGameState() {
  const [loadResult] = useState(loadGameState);
  const [state, setState] = useState(loadResult.state);
  const [persistenceError, setPersistenceError] = useState(loadResult.error);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

      LEGACY_STORAGE_KEYS.forEach((legacyKey) => {
        localStorage.removeItem(legacyKey);
      });

      setPersistenceError(null);
    } catch (error) {
      console.error('Falha ao salvar o estado do Bufunfa:', error);
      setPersistenceError(
        'O progresso não está sendo salvo neste navegador. Verifique as permissões de armazenamento.',
      );
    }
  }, [state]);

  const resetGame = () => {
    if (
      !window.confirm(
        'Atenção: isso apagará todo o progresso atual. Confirmar?',
      )
    ) {
      return false;
    }

    try {
      localStorage.removeItem(STORAGE_KEY);
      LEGACY_STORAGE_KEYS.forEach((legacyKey) =>
        localStorage.removeItem(legacyKey),
      );
      setPersistenceError(null);
    } catch (error) {
      console.error('Falha ao limpar o estado salvo do Bufunfa:', error);
    }

    setState(initialState());
    return true;
  };

  return { state, setState, resetGame, persistenceError };
}

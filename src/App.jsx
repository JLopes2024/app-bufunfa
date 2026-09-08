import { useEffect, useMemo, useRef, useState } from 'react';
import {
  applyOperation,
  formatMoney,
  getInitialFamilies,
  getRanking,
  getWealth,
  processNextRound,
} from './bufunfa';
import { useGameState } from './useGameState';
import SetupScreen from './components/SetupScreen';
import FamilyWorkspace from './components/FamilyWorkspace';
import Ranking from './components/Ranking';
import FinalReport from './components/FinalReport';
import './App.css';

function Toast({ message }) {
  if (!message) return null;

  return (
    <div className="toast" role="status" aria-live="polite">
      ✓ {message}
    </div>
  );
}

function PersistenceWarning({ message }) {
  if (!message) return null;

  return (
    <div className="storage-warning" role="alert">
      {message}
    </div>
  );
}

export default function App() {
  const { state, setState, resetGame, persistenceError } = useGameState();

  const [selectedId, setSelectedId] = useState(null);
  const [view, setView] = useState('dashboard');
  const [toast, setToast] = useState(null);
  const [setupSelected, setSetupSelected] = useState([]);

  const toastTimerRef = useRef(null);
  const predefinedFamilies = useMemo(() => getInitialFamilies(), []);

  const selectedFamily = state.families.find(
    (family) => family.id === selectedId,
  );
  const ranking = getRanking(state.families);
  const readyCount = state.families.filter((family) => family.isReady).length;
  const allReady =
    state.families.length > 0 && readyCount === state.families.length;

  useEffect(
    () => () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    if (
      selectedId &&
      !state.families.some((family) => family.id === selectedId)
    ) {
      setSelectedId(null);
    }
  }, [selectedId, state.families]);

  const showToast = (message) => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }

    setToast(message);
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, 3000);
  };

  const handleToggleSetup = (id) => {
    setSetupSelected((current) =>
      current.includes(id)
        ? current.filter((familyId) => familyId !== id)
        : [...current, id],
    );
  };

  const handleStartGame = () => {
    if (setupSelected.length < 2) return;

    const selectedFamilies = predefinedFamilies.filter((family) =>
      setupSelected.includes(family.id),
    );

    setState({
      round: 1,
      isFinished: false,
      hasStarted: true,
      families: selectedFamilies,
    });
    setSelectedId(selectedFamilies[0]?.id ?? null);
    setView('dashboard');
    showToast('SIMULAÇÃO INICIADA!');
  };

  const dispatchToFamily = (payload) => {
    if (!selectedId || state.isFinished) return;

    setState((current) => ({
      ...current,
      families: current.families.map((family) =>
        family.id === selectedId
          ? applyOperation(family, {
              ...payload,
              round: payload.round ?? current.round,
            })
          : family,
      ),
    }));
  };

  const handleToggleReady = () => {
    if (!selectedFamily || state.isFinished) return;

    const willBeReady = !selectedFamily.isReady;
    dispatchToFamily({ type: 'toggle_ready' });

    showToast(
      willBeReady
        ? `${selectedFamily.name}: TURNO CONCLUÍDO`
        : `${selectedFamily.name}: TERMINAL REABERTO`,
    );
  };

  const handleNextRound = () => {
    if (!allReady) {
      window.alert(
        'Não é possível avançar: todas as famílias precisam concluir o turno.',
      );
      return;
    }

    setState((current) => processNextRound(current));
    showToast('MÊS AVANÇADO!');
  };

  const handleFinishGame = () => {
    if (
      !window.confirm(
        'Encerrar a simulação e gerar o relatório final? Essa ação bloqueia novas operações.',
      )
    ) {
      return;
    }

    setState((current) => ({ ...current, isFinished: true }));
    setView('relatorio');
  };

  const handleResetGame = () => {
    const resetConfirmed = resetGame();

    if (!resetConfirmed) return;

    setSelectedId(null);
    setSetupSelected([]);
    setView('dashboard');
    setToast(null);
  };

  if (!state.hasStarted) {
    return (
      <>
        <Toast message={toast} />
        <PersistenceWarning message={persistenceError} />
        <SetupScreen
          families={predefinedFamilies}
          selectedIds={setupSelected}
          onToggle={handleToggleSetup}
          onStart={handleStartGame}
        />
      </>
    );
  }

  if (view === 'relatorio') {
    return (
      <>
        <Toast message={toast} />
        <PersistenceWarning message={persistenceError} />
        <FinalReport
          ranking={ranking}
          onBack={() => setView('dashboard')}
          onReset={handleResetGame}
        />
      </>
    );
  }

  return (
    <>
      <Toast message={toast} />
      <PersistenceWarning message={persistenceError} />

      <div className="app-container">
        <header className="header">
          <div>
            <h1>
              BANCO <span>BUFUNFA</span>
            </h1>
            <p className="text-muted header-subtitle">
              CONTA MESTRE • STATUS: {readyCount}/{state.families.length}{' '}
              SINCRONIZADAS
            </p>
          </div>

          <div className="header-actions">
            {state.isFinished && (
              <span className="badge badge-danger-solid">ENCERRADO</span>
            )}

            <span className="round-indicator">MÊS {state.round}</span>

            <button
              className="btn btn-primary"
              onClick={handleNextRound}
              disabled={state.isFinished || !allReady}
            >
              AVANÇAR MÊS
              {!allReady && ` (${readyCount}/${state.families.length})`}
            </button>

            {state.isFinished ? (
              <button
                className="btn btn-outline"
                onClick={() => setView('relatorio')}
              >
                RELATÓRIO
              </button>
            ) : (
              <button className="btn btn-outline" onClick={handleFinishGame}>
                ENCERRAR
              </button>
            )}

            <button className="btn btn-danger" onClick={handleResetGame}>
              RESET
            </button>
          </div>
        </header>

        <main className="main-grid">
          <section>
            <div className="panel">
              <div className="section-heading-row">
                <div>
                  <h2 className="section-title">TERMINAIS ATIVOS</h2>
                  <p className="text-muted">
                    Selecione uma família para administrar o turno.
                  </p>
                </div>
              </div>

              <div className="families-grid">
                {state.families.map((family) => {
                  const familyWealth = getWealth(
                    family.balance,
                    family.investments,
                    family.loans,
                  );

                  return (
                    <button
                      type="button"
                      key={family.id}
                      onClick={() => setSelectedId(family.id)}
                      className={`family-card ${
                        selectedId === family.id ? 'active' : ''
                      }`}
                      aria-pressed={selectedId === family.id}
                    >
                      <span className="title">{family.name}</span>
                      <span
                        className={`amount ${
                          familyWealth < 0
                            ? 'text-danger'
                            : 'text-success'
                        }`}
                      >
                        {formatMoney(familyWealth)}
                      </span>

                      <span className="family-card-badges">
                        <span
                          className={`badge ${
                            family.isReady
                              ? 'badge-success'
                              : 'badge-warning'
                          }`}
                        >
                          {family.isReady ? '✓ OK' : 'PENDENTE'}
                        </span>

                        {family.activeEffects?.length > 0 && (
                          <span className="badge badge-danger">EFEITO</span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedFamily ? (
              <FamilyWorkspace
                family={selectedFamily}
                round={state.round}
                isFinished={state.isFinished}
                onDispatch={dispatchToFamily}
                onToast={showToast}
                onToggleReady={handleToggleReady}
              />
            ) : (
              <div className="panel empty-selection">
                <p className="text-muted">SELECIONE UM TERMINAL NO PAINEL</p>
              </div>
            )}
          </section>

          <Ranking families={ranking} />
        </main>
      </div>
    </>
  );
}

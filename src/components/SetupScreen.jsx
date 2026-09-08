import { formatMoney } from '../bufunfa';

export default function SetupScreen({
  families,
  selectedIds,
  onToggle,
  onStart,
}) {
  return (
    <div className="app-container">
      <header className="header">
        <div>
          <h1>
            SETUP <span>BUFUNFA®</span>
          </h1>
          <p className="text-muted header-subtitle">
            Selecione as famílias participantes (mín. 2)
          </p>
        </div>

        <div className="header-actions">
          <span className="setup-count">[{selectedIds.length}] ATIVAS</span>
          <button
            className="btn btn-primary"
            onClick={onStart}
            disabled={selectedIds.length < 2}
          >
            INICIAR SIMULAÇÃO
          </button>
        </div>
      </header>

      <main className="panel">
        <div className="families-grid families-grid-setup">
          {families.map((family) => {
            const isSelected = selectedIds.includes(family.id);

            return (
              <button
                type="button"
                key={family.id}
                onClick={() => onToggle(family.id)}
                className={`family-card setup-family-card ${
                  isSelected ? 'active' : ''
                }`}
                aria-pressed={isSelected}
              >
                <span>
                  <span className="title">{family.name}</span>
                  <span className="text-muted family-project">
                    {family.project}
                  </span>
                </span>

                <span className="family-card-footer">
                  <span className="amount">{formatMoney(family.balance)}</span>
                  <span
                    className={`badge ${
                      isSelected ? 'badge-success' : 'badge-neutral'
                    }`}
                  >
                    {isSelected ? 'ATIVA' : 'INATIVA'}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}

import {
  formatMoney,
  getOutstandingDebt,
  getWealth,
} from '../bufunfa';

export default function Ranking({ families }) {
  return (
    <aside className="panel ranking-panel">
      <h2 className="section-title">LEADERBOARD</h2>

      <div>
        {families.map((family, index) => {
          const wealth = getWealth(
            family.balance,
            family.investments,
            family.loans,
          );
          const debt = getOutstandingDebt(family.loans);

          return (
            <div key={family.id} className="ranking-item">
              <div className="ranking-main">
                <span
                  className={`rank-position ${index === 0 ? 'first' : ''}`}
                >
                  {index + 1}
                </span>

                <div>
                  <div className="family-name">{family.name}</div>
                  <div
                    className={`family-status ${
                      family.isReady ? 'is-ready' : 'is-pending'
                    }`}
                  >
                    {family.isReady ? '✓ Sincronizado' : '⏳ Pendente'}
                  </div>
                  {debt > 0 && (
                    <div className="ranking-debt">
                      Dívida: {formatMoney(debt)}
                    </div>
                  )}
                </div>
              </div>

              <div
                className={`family-score ${
                  wealth < 0 ? 'text-danger' : 'text-success'
                }`}
              >
                {formatMoney(wealth)}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}

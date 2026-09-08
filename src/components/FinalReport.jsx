import {
  formatMoney,
  getInvestmentsTotal,
  getOutstandingDebt,
  getWealth,
} from '../bufunfa';

const formatOperation = (type = '') =>
  type.replaceAll('_', ' ').toLocaleUpperCase('pt-BR');

export default function FinalReport({ ranking, onBack, onReset }) {
  return (
    <div className="app-container">
      <header className="header">
        <div>
          <h1>
            AUDITORIA <span>BUFUNFA</span>
          </h1>
          <p className="text-muted header-subtitle">
            Relatório final de simulação
          </p>
        </div>

        <div className="header-actions">
          <span className="badge badge-danger-solid">SIMULAÇÃO ENCERRADA</span>
          <button className="btn btn-outline" onClick={onBack}>
            VOLTAR AO PAINEL
          </button>
          <button className="btn btn-danger" onClick={onReset}>
            NOVA SIMULAÇÃO
          </button>
        </div>
      </header>

      <main>
        {ranking.map((family, index) => {
          const investmentsTotal = getInvestmentsTotal(family.investments);
          const debt = getOutstandingDebt(family.loans);
          const wealth = getWealth(
            family.balance,
            family.investments,
            family.loans,
          );

          return (
            <section key={family.id} className="panel report-family">
              <div className="report-heading">
                <div>
                  <h2 className={index === 0 ? 'winner-title' : ''}>
                    {index + 1}º LUGAR: {family.name}
                  </h2>
                  <p className="text-muted report-subtitle">
                    Felicidade: {family.happiness} • Energia: {family.energy}
                  </p>
                </div>

                <div className="report-wealth">
                  <p className="text-muted report-label">PATRIMÔNIO LÍQUIDO</p>
                  <div
                    className={`display-amount ${
                      wealth < 0 ? 'text-danger' : 'text-success'
                    }`}
                  >
                    {formatMoney(wealth)}
                  </div>
                </div>
              </div>

              <div className="report-summary">
                <div className="attr-box">
                  <h4>Caixa</h4>
                  <div className="val">{formatMoney(family.balance)}</div>
                </div>
                <div className="attr-box">
                  <h4>Investimentos</h4>
                  <div className="val">{formatMoney(investmentsTotal)}</div>
                </div>
                <div className="attr-box">
                  <h4>Dívida restante</h4>
                  <div className={`val ${debt > 0 ? 'text-danger' : ''}`}>
                    {formatMoney(debt)}
                  </div>
                </div>
              </div>

              {!family.history?.length ? (
                <p className="text-muted">Sem movimentações registradas.</p>
              ) : (
                <div className="table-scroll">
                  <table className="history-table">
                    <thead>
                      <tr>
                        <th>Mês</th>
                        <th>Operação</th>
                        <th>Descrição</th>
                        <th>Valor</th>
                        <th className="align-right">Patrimônio após evento</th>
                      </tr>
                    </thead>
                    <tbody>
                      {family.history.map((history) => (
                        <tr key={history.id}>
                          <td className="history-round">{history.round}</td>
                          <td className="history-type">
                            {formatOperation(history.type)}
                          </td>
                          <td className="history-description">
                            {history.description || '-'}
                          </td>
                          <td
                            className={
                              history.amount > 0
                                ? 'text-success'
                                : history.amount < 0
                                  ? 'text-danger'
                                  : ''
                            }
                          >
                            {history.amount > 0 ? '+' : ''}
                            {history.amount !== 0
                              ? formatMoney(history.amount)
                              : '-'}
                          </td>
                          <td className="history-balance align-right">
                            {formatMoney(history.balanceAfter)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          );
        })}
      </main>
    </div>
  );
}

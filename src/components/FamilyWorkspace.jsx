import { useEffect, useState } from 'react';
import {
  GAME_CARDS,
  formatMoney,
  getCreditLimit,
  getOutstandingDebt,
  getWealth,
  hasSalaryBlock,
  roundMoney,
} from '../bufunfa';

const parseMoneyInput = (value) => {
  const parsed = Number(String(value).replace(',', '.'));
  return Number.isFinite(parsed) ? roundMoney(parsed) : 0;
};

export default function FamilyWorkspace({
  family,
  round,
  isFinished,
  onDispatch,
  onToast,
  onToggleReady,
}) {
  const [activeTab, setActiveTab] = useState('caixa');

  const [opType, setOpType] = useState('receita');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const [invAction, setInvAction] = useState('investir');
  const [invKey, setInvKey] = useState('poupanca');
  const [invAmount, setInvAmount] = useState('');

  const [loanAmount, setLoanAmount] = useState('');
  const [loanInstallments, setLoanInstallments] = useState(2);
  const [masterAuthorized, setMasterAuthorized] = useState(false);

  const [selectedCardId, setSelectedCardId] = useState('');
  const [effectName, setEffectName] = useState('');
  const [effectType, setEffectType] = useState('deducao_fixa');
  const [effectAmount, setEffectAmount] = useState('');
  const [effectDuration, setEffectDuration] = useState('infinito');

  const wealth = getWealth(family.balance, family.investments, family.loans);
  const debt = getOutstandingDebt(family.loans);
  const credit = getCreditLimit(wealth, family.loans);
  const salaryBlocked = hasSalaryBlock(family);
  const terminalLocked = isFinished || family.isReady;
  const selectedCardData = GAME_CARDS.find(
    (card) => card.id === selectedCardId,
  );

  useEffect(() => {
    setAmount('');
    setDescription('');
    setInvAmount('');
    setLoanAmount('');
    setMasterAuthorized(false);
    setSelectedCardId('');
    setEffectName('');
    setEffectAmount('');
  }, [family.id]);

  useEffect(() => {
    setLoanInstallments((current) =>
      Math.max(1, Math.min(current, credit.maxInstallments)),
    );
  }, [credit.maxInstallments]);

  const dispatch = (payload) => {
    onDispatch({ ...payload, round });
  };

  const handleCaixa = (event) => {
    event.preventDefault();

    const value = parseMoneyInput(amount);
    if (value <= 0) return;

    if (opType === 'salario' && salaryBlocked) {
      window.alert(
        'SALÁRIO BLOQUEADO: existe um efeito de demissão/bloqueio ativo.',
      );
      return;
    }

    const fallbackDescription =
      opType === 'salario'
        ? 'Salário'
        : opType === 'pagamento'
          ? 'Despesa'
          : 'Receita';

    dispatch({
      type: opType,
      amount: value,
      description: description.trim() || fallbackDescription,
    });

    onToast('TRANSAÇÃO CONCLUÍDA!');
    setAmount('');
    setDescription('');
  };

  const handleInvestir = (event) => {
    event.preventDefault();

    const value = parseMoneyInput(invAmount);
    if (value <= 0) return;

    if (invAction === 'investir') {
      if (family.balance < value) {
        window.alert('SALDO INSUFICIENTE.');
        return;
      }

      dispatch({ type: 'investir', amount: value, invKey });
      onToast('APLICAÇÃO EFETUADA!');
    } else {
      if ((family.investments?.[invKey] || 0) < value) {
        window.alert('MONTANTE INDISPONÍVEL.');
        return;
      }

      dispatch({ type: 'resgatar', amount: value, invKey });
      onToast('RESGATE CONCLUÍDO!');
    }

    setInvAmount('');
  };

  const handleEmprestimo = (event) => {
    event.preventDefault();

    const value = parseMoneyInput(loanAmount);
    if (value <= 0) return;

    if (family.balance < 0 && !masterAuthorized) {
      window.alert(
        'CONTA EM NEGATIVO: confirme a autorização do mestre para liberar o crédito.',
      );
      return;
    }

    if (credit.maxLoan <= 0 || value > credit.maxLoan) {
      window.alert(
        `LIMITE EXCEDIDO (disponível: ${formatMoney(credit.maxLoan)}).`,
      );
      return;
    }

    if (loanInstallments > credit.maxInstallments) {
      window.alert(
        `PARCELAS EXCEDIDAS (máx.: ${credit.maxInstallments}x).`,
      );
      return;
    }

    dispatch({
      type: 'novo_emprestimo',
      loanData: {
        id: crypto.randomUUID(),
        totalPrincipal: value,
        totalInstallments: Number(loanInstallments),
      },
    });

    onToast('CRÉDITO LIBERADO!');
    setLoanAmount('');
    setMasterAuthorized(false);
  };

  const handleJogarCarta = (event) => {
    event.preventDefault();

    if (!selectedCardId) return;

    if (selectedCardId === 'custom') {
      const parsedAmount = parseMoneyInput(effectAmount);
      const cleanName = effectName.trim();

      if (!cleanName) {
        window.alert('Informe o título do efeito.');
        return;
      }

      if (
        effectType !== 'sem_salario' &&
        (!Number.isFinite(parsedAmount) || parsedAmount <= 0)
      ) {
        window.alert('Informe um valor válido para o efeito.');
        return;
      }

      dispatch({
        type: 'novo_efeito',
        effectData: {
          id: crypto.randomUUID(),
          name: cleanName,
          type: effectType,
          amount: effectType === 'sem_salario' ? 0 : parsedAmount,
          duration:
            effectDuration === 'infinito'
              ? 'infinito'
              : Number(effectDuration),
        },
      });

      onToast('EFEITO MANUAL APLICADO!');
      setEffectName('');
      setEffectAmount('');
    } else {
      if (!selectedCardData) {
        window.alert('Carta inválida ou não encontrada.');
        return;
      }

      dispatch({ type: 'jogar_carta', card: selectedCardData });
      onToast('CARTA PROCESSADA!');
    }

    setSelectedCardId('');
  };

  const handleRemoveEffect = (effectId) => {
    dispatch({ type: 'remover_efeito', effectId });
    onToast('EFEITO REMOVIDO!');
  };

  return (
    <div className="panel family-workspace">
      <div className="family-workspace-heading">
        <div>
          <h2>{family.name}</h2>
          <p className="text-muted family-workspace-project">
            {family.project}
          </p>
        </div>

        <div className="family-financial-summary">
          <div>
            <p className="text-muted summary-label">CAIXA LIVRE</p>
            <div
              className={`display-amount ${
                family.balance < 0 ? 'text-danger' : 'text-success'
              }`}
            >
              {formatMoney(family.balance)}
            </div>
          </div>
          <div className="net-worth-line">
            Patrimônio líquido:{' '}
            <strong className={wealth < 0 ? 'text-danger' : 'text-success'}>
              {formatMoney(wealth)}
            </strong>
            {debt > 0 && (
              <span className="text-muted">
                {' '}
                • Dívida restante: {formatMoney(debt)}
              </span>
            )}
          </div>
        </div>
      </div>

      {!isFinished && (
        <div
          className={`turn-status ${family.isReady ? 'is-ready' : ''}`}
          role="status"
        >
          <div>
            <strong>
              {family.isReady
                ? '✓ TURNO CONCLUÍDO'
                : '⏳ TERMINAL LIBERADO PARA OPERAÇÕES'}
            </strong>
            <p className="text-muted">
              {family.isReady
                ? 'As operações estão bloqueadas até o terminal ser reaberto ou o mês avançar.'
                : 'Finalize as operações financeiras e confirme o turno.'}
            </p>
          </div>

          <button
            className={`btn ${
              family.isReady ? 'btn-outline btn-ready-outline' : 'btn-success'
            }`}
            onClick={onToggleReady}
          >
            {family.isReady ? 'REABRIR TERMINAL' : 'CONCLUIR TURNO'}
          </button>
        </div>
      )}

      {isFinished ? (
        <div className="simulation-locked">
          ACESSO BLOQUEADO (SIMULAÇÃO ENCERRADA).
        </div>
      ) : (
        <>
          {family.isReady && (
            <div className="terminal-lock-message">
              Terminal concluído. Reabra o terminal para realizar novas
              operações.
            </div>
          )}

          <div className="tabs" role="tablist" aria-label="Operações da família">
            {[
              ['caixa', 'HUB FINANCEIRO'],
              ['investimentos', 'PORTFÓLIO'],
              ['emprestimos', 'LINHAS DE CRÉDITO'],
              ['rpg', 'MESA RPG'],
            ].map(([tabId, label]) => (
              <button
                type="button"
                key={tabId}
                role="tab"
                aria-selected={activeTab === tabId}
                aria-controls={`panel-${tabId}`}
                id={`tab-${tabId}`}
                className={`tab-btn ${activeTab === tabId ? 'active' : ''}`}
                onClick={() => setActiveTab(tabId)}
              >
                {label}
              </button>
            ))}
          </div>

          {activeTab === 'caixa' && (
            <section
              id="panel-caixa"
              role="tabpanel"
              aria-labelledby="tab-caixa"
            >
              {salaryBlocked && (
                <div className="inline-warning">
                  Salário bloqueado por efeito ativo. Outras receitas continuam
                  permitidas.
                </div>
              )}

              <form onSubmit={handleCaixa}>
                <fieldset className="action-fieldset" disabled={terminalLocked}>
                  <div className="form-group">
                    <label className="form-field form-field-small">
                      <span className="form-label">Tipo</span>
                      <select
                        className="form-input"
                        value={opType}
                        onChange={(event) => setOpType(event.target.value)}
                      >
                        <option value="receita">RECEITA (+)</option>
                        <option value="salario">SALÁRIO (+)</option>
                        <option value="pagamento">DESPESA (-)</option>
                      </select>
                    </label>

                    <label className="form-field">
                      <span className="form-label">Valor</span>
                      <input
                        className="form-input"
                        type="number"
                        min="0.01"
                        step="0.01"
                        inputMode="decimal"
                        placeholder="R$ 0,00"
                        value={amount}
                        onChange={(event) => setAmount(event.target.value)}
                        required
                      />
                    </label>

                    <label className="form-field form-field-wide">
                      <span className="form-label">Descrição</span>
                      <input
                        className="form-input"
                        type="text"
                        maxLength={120}
                        placeholder="Descrição do lançamento"
                        value={description}
                        onChange={(event) =>
                          setDescription(event.target.value)
                        }
                      />
                    </label>

                    <button type="submit" className="btn btn-primary form-action">
                      PROCESSAR
                    </button>
                  </div>
                </fieldset>
              </form>
            </section>
          )}

          {activeTab === 'investimentos' && (
            <section
              id="panel-investimentos"
              role="tabpanel"
              aria-labelledby="tab-investimentos"
            >
              <div className="attr-grid">
                <div className="attr-box">
                  <h4 className="investment-savings">POUPANÇA</h4>
                  <div className="val">
                    {formatMoney(family.investments.poupanca)}
                  </div>
                </div>
                <div className="attr-box">
                  <h4 className="investment-cdb">CDB</h4>
                  <div className="val">
                    {formatMoney(family.investments.cdb)}
                  </div>
                </div>
                <div className="attr-box">
                  <h4 className="investment-treasury">TESOURO</h4>
                  <div className="val">
                    {formatMoney(family.investments.tesouro)}
                  </div>
                </div>
              </div>

              <form onSubmit={handleInvestir} className="section-form">
                <fieldset className="action-fieldset" disabled={terminalLocked}>
                  <div className="form-group">
                    <label className="form-field form-field-small">
                      <span className="form-label">Operação</span>
                      <select
                        className="form-input"
                        value={invAction}
                        onChange={(event) => setInvAction(event.target.value)}
                      >
                        <option value="investir">APORTE (+)</option>
                        <option value="resgatar">RESGATE (-)</option>
                      </select>
                    </label>

                    <label className="form-field">
                      <span className="form-label">Produto</span>
                      <select
                        className="form-input"
                        value={invKey}
                        onChange={(event) => setInvKey(event.target.value)}
                      >
                        <option value="poupanca">POUPANÇA</option>
                        <option value="cdb">CDB BANCÁRIO</option>
                        <option value="tesouro">TESOURO DIRETO</option>
                      </select>
                    </label>

                    <label className="form-field">
                      <span className="form-label">Valor</span>
                      <input
                        className="form-input"
                        type="number"
                        min="0.01"
                        step="0.01"
                        inputMode="decimal"
                        placeholder="R$ 0,00"
                        value={invAmount}
                        onChange={(event) => setInvAmount(event.target.value)}
                        required
                      />
                    </label>

                    <button
                      type="submit"
                      className={`btn form-action ${
                        invAction === 'investir'
                          ? 'btn-primary'
                          : 'btn-danger'
                      }`}
                    >
                      EXECUTAR ORDEM
                    </button>
                  </div>
                </fieldset>
              </form>
            </section>
          )}

          {activeTab === 'emprestimos' && (
            <section
              id="panel-emprestimos"
              role="tabpanel"
              aria-labelledby="tab-emprestimos"
            >
              <div className="credit-analysis">
                <h4>ANÁLISE DE CRÉDITO</h4>
                <div className="credit-stats">
                  <span>
                    Limite aprovado:{' '}
                    <strong>{formatMoney(credit.approvedLimit)}</strong>
                  </span>
                  <span>
                    Disponível:{' '}
                    <strong className="text-success">
                      {formatMoney(credit.maxLoan)}
                    </strong>
                  </span>
                  <span>
                    Dívida ativa:{' '}
                    <strong className={debt > 0 ? 'text-danger' : ''}>
                      {formatMoney(credit.outstandingDebt)}
                    </strong>
                  </span>
                  <span>
                    Taxa:{' '}
                    <strong className="text-warning">
                      {(credit.interestRate * 100).toFixed(0)}% a.m.
                    </strong>
                  </span>
                  <span>
                    Prazo máx.: <strong>{credit.maxInstallments}x</strong>
                  </span>
                </div>
              </div>

              <form onSubmit={handleEmprestimo}>
                <fieldset className="action-fieldset" disabled={terminalLocked}>
                  <div className="form-group">
                    <label className="form-field">
                      <span className="form-label">Valor solicitado</span>
                      <input
                        className="form-input"
                        type="number"
                        min="0.01"
                        max={credit.maxLoan || undefined}
                        step="0.01"
                        inputMode="decimal"
                        placeholder="R$ 0,00"
                        value={loanAmount}
                        onChange={(event) => setLoanAmount(event.target.value)}
                        required
                      />
                    </label>

                    <label className="form-field form-field-small">
                      <span className="form-label">Parcelas</span>
                      <select
                        className="form-input"
                        value={loanInstallments}
                        onChange={(event) =>
                          setLoanInstallments(Number(event.target.value))
                        }
                      >
                        {Array.from(
                          { length: credit.maxInstallments },
                          (_, index) => index + 1,
                        ).map((installment) => (
                          <option key={installment} value={installment}>
                            {installment}x
                          </option>
                        ))}
                      </select>
                    </label>

                    {family.balance < 0 && (
                      <label className="master-authorization">
                        <input
                          type="checkbox"
                          checked={masterAuthorized}
                          onChange={(event) =>
                            setMasterAuthorized(event.target.checked)
                          }
                        />
                        <span>
                          Mestre autoriza crédito com caixa negativo
                        </span>
                      </label>
                    )}

                    <button
                      type="submit"
                      className="btn btn-primary form-action"
                      disabled={terminalLocked || credit.maxLoan <= 0}
                    >
                      EMITIR CONTRATO
                    </button>
                  </div>
                </fieldset>
              </form>

              {family.loans?.length > 0 && (
                <div className="contracts">
                  <h4>CONTRATOS ATIVOS</h4>

                  {family.loans.map((loan) => (
                    <div key={loan.id} className="loan-card">
                      <div>
                        <strong>{loan.name}</strong>
                        <span className="text-muted">
                          Principal: {formatMoney(loan.totalPrincipal)}
                        </span>
                        <span className="text-muted">
                          Saldo devedor:{' '}
                          {formatMoney(getOutstandingDebt([loan]))}
                        </span>
                      </div>

                      <div className="loan-installment text-danger">
                        PARCELA {loan.currentInstallment}/
                        {loan.totalInstallments}
                        <strong>{formatMoney(loan.installmentValue)}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === 'rpg' && (
            <section id="panel-rpg" role="tabpanel" aria-labelledby="tab-rpg">
              <div className="attr-grid rpg-attributes">
                <div className="attr-box attr-happiness">
                  <h4>Felicidade</h4>
                  <div className="val">{family.happiness}</div>
                </div>
                <div className="attr-box attr-energy">
                  <h4>Energia</h4>
                  <div className="val">{family.energy}</div>
                </div>
              </div>

              <form onSubmit={handleJogarCarta} className="card-form">
                <fieldset className="action-fieldset" disabled={terminalLocked}>
                  <div className="form-group">
                    <h4 className="form-section-title">
                      DECK OFICIAL DO JOGO
                    </h4>

                    <label className="form-field form-field-full">
                      <span className="form-label">Carta</span>
                      <select
                        className="form-input"
                        value={selectedCardId}
                        onChange={(event) =>
                          setSelectedCardId(event.target.value)
                        }
                        required
                      >
                        <option value="" disabled>
                          --- SELECIONE A CARTA JOGADA ---
                        </option>
                        <optgroup label="[+] OPORTUNIDADES">
                          {GAME_CARDS.filter(
                            (card) => card.category === 'Oportunidade',
                          ).map((card) => (
                            <option key={card.id} value={card.id}>
                              {card.name}
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="[-] IMPREVISTOS">
                          {GAME_CARDS.filter(
                            (card) => card.category === 'Imprevisto',
                          ).map((card) => (
                            <option key={card.id} value={card.id}>
                              {card.name}
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="[!] CONTROLE DO MESTRE">
                          <option value="custom">
                            ⚙️ ADICIONAR EFEITO PERSONALIZADO
                          </option>
                        </optgroup>
                      </select>
                    </label>

                    {selectedCardData && (
                      <div
                        className={`card-preview ${
                          selectedCardData.category === 'Oportunidade'
                            ? 'is-opportunity'
                            : 'is-unforeseen'
                        }`}
                      >
                        <strong>ALVO: {selectedCardData.name}</strong>
                        <span className="text-muted">
                          TIPO:{' '}
                          {selectedCardData.type === 'instant'
                            ? 'Aplicação imediata'
                            : `Duração: ${
                                selectedCardData.duration === 'infinito'
                                  ? 'Permanente'
                                  : `${selectedCardData.duration} mês(es)`
                              }`}
                        </span>
                        <div className="card-preview-values">
                          <span
                            className={
                              selectedCardData.amount >= 0
                                ? 'text-success'
                                : 'text-danger'
                            }
                          >
                            {selectedCardData.amount === 0
                              ? 'SEM MOVIMENTAÇÃO FINANCEIRA'
                              : formatMoney(selectedCardData.amount)}
                          </span>

                          {selectedCardData.happiness !== 0 && (
                            <span className="text-warning">
                              FELICIDADE{' '}
                              {selectedCardData.happiness > 0 ? '+' : ''}
                              {selectedCardData.happiness}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {selectedCardId === 'custom' && (
                      <div className="custom-effect">
                        <label className="form-field">
                          <span className="form-label">Título do efeito</span>
                          <input
                            className="form-input"
                            type="text"
                            maxLength={80}
                            value={effectName}
                            onChange={(event) =>
                              setEffectName(event.target.value)
                            }
                            required
                          />
                        </label>

                        <label className="form-field">
                          <span className="form-label">Tipo</span>
                          <select
                            className="form-input"
                            value={effectType}
                            onChange={(event) =>
                              setEffectType(event.target.value)
                            }
                          >
                            <option value="deducao_fixa">
                              DEDUÇÃO RECORRENTE
                            </option>
                            <option value="receita_fixa">
                              RECEITA RECORRENTE
                            </option>
                            <option value="sem_salario">
                              BLOQUEIO DE SALÁRIO
                            </option>
                          </select>
                        </label>

                        {effectType !== 'sem_salario' && (
                          <label className="form-field">
                            <span className="form-label">Valor</span>
                            <input
                              className="form-input"
                              type="number"
                              min="0.01"
                              step="0.01"
                              inputMode="decimal"
                              value={effectAmount}
                              onChange={(event) =>
                                setEffectAmount(event.target.value)
                              }
                              required
                            />
                          </label>
                        )}

                        <label className="form-field">
                          <span className="form-label">Duração</span>
                          <select
                            className="form-input"
                            value={effectDuration}
                            onChange={(event) =>
                              setEffectDuration(event.target.value)
                            }
                          >
                            <option value="infinito">PERMANENTE</option>
                            <option value="1">1 MÊS</option>
                            <option value="2">2 MESES</option>
                            <option value="3">3 MESES</option>
                          </select>
                        </label>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="btn btn-primary card-submit"
                    >
                      {selectedCardId === 'custom'
                        ? 'APLICAR EFEITO'
                        : 'EXECUTAR CARTA'}
                    </button>
                  </div>
                </fieldset>
              </form>

              {family.activeEffects?.length > 0 && (
                <div className="active-effects">
                  <h4>EFEITOS ATIVOS</h4>

                  <div className="effects-list">
                    {family.activeEffects.map((effect) => (
                      <div
                        key={effect.id}
                        className={`effect-badge ${
                          effect.type === 'receita_fixa'
                            ? 'is-positive'
                            : 'is-negative'
                        }`}
                      >
                        <span>
                          {effect.name}
                          {['deducao_fixa', 'receita_fixa'].includes(
                            effect.type,
                          ) &&
                            ` (${
                              effect.type === 'deducao_fixa' ? '-' : '+'
                            }${formatMoney(effect.amount)})`}
                          {' • '}
                          {effect.duration === 'infinito'
                            ? 'permanente'
                            : `${effect.duration} mês(es)`}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleRemoveEffect(effect.id)}
                          disabled={terminalLocked}
                          aria-label={`Remover efeito ${effect.name}`}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}

// --- CONFIGURAÇÃO E MOTOR DO JOGO ---

export const GAME_CARDS = [
  // Oportunidades
  { id: 'op_bonus', name: 'Bônus de Desempenho', category: 'Oportunidade', type: 'instant', amount: 400, happiness: 1 },
  { id: 'op_cashback', name: 'Cashback', category: 'Oportunidade', type: 'instant', amount: 150, happiness: 0 },
  { id: 'op_horaextra', name: 'Hora Extra', category: 'Oportunidade', type: 'instant', amount: 300, happiness: -1 },
  { id: 'op_venda', name: 'Venda Online', category: 'Oportunidade', type: 'instant', amount: 250, happiness: 0 },
  { id: 'op_cursogratis', name: 'Curso Gratuito', category: 'Oportunidade', type: 'instant', amount: 0, happiness: 2 },
  { id: 'op_pix', name: 'Pix Esquecido', category: 'Oportunidade', type: 'instant', amount: 180, happiness: 0 },
  { id: 'op_aniversario', name: 'Aniversário', category: 'Oportunidade', type: 'instant', amount: 250, happiness: 0 },
  { id: 'op_promocao', name: 'Promoção (Renda Contínua)', category: 'Oportunidade', type: 'continuous', effectType: 'receita_fixa', amount: 250, duration: 'infinito', happiness: 0 },
  { id: 'op_cursopago', name: 'Curso Pago por Outro', category: 'Oportunidade', type: 'instant', amount: 0, happiness: 2 },
  { id: 'op_wifi', name: 'Wi-Fi Grátis', category: 'Oportunidade', type: 'instant', amount: 120, happiness: 0 },

  // Imprevistos
  { id: 'imp_celular', name: 'Celular Quebrou', category: 'Imprevisto', type: 'instant', amount: -600, happiness: 0 },
  { id: 'imp_medico', name: 'Consulta Médica', category: 'Imprevisto', type: 'instant', amount: -250, happiness: 0 },
  { id: 'imp_pneu', name: 'Furou o Pneu', category: 'Imprevisto', type: 'instant', amount: -180, happiness: 0 },
  { id: 'imp_carteira', name: 'Perdeu a Carteira', category: 'Imprevisto', type: 'instant', amount: -150, happiness: 0 },
  { id: 'imp_aluguel', name: 'Aumento do Aluguel', category: 'Imprevisto', type: 'continuous', effectType: 'deducao_fixa', amount: 200, duration: 'infinito', happiness: 0 },
  { id: 'imp_golpe', name: 'Golpe Online', category: 'Imprevisto', type: 'instant', amount: -350, happiness: 0 },
  { id: 'imp_demissao', name: 'Demissão', category: 'Imprevisto', type: 'continuous', effectType: 'sem_salario', amount: 0, duration: 1, happiness: 0 },
  { id: 'imp_saude', name: 'Despesa com Saúde', category: 'Imprevisto', type: 'instant', amount: -200, happiness: 0 },
  { id: 'imp_conserto', name: 'Conserto em Casa', category: 'Imprevisto', type: 'instant', amount: -300, happiness: 0 },
];

export const INVESTMENT_KEYS = ['poupanca', 'cdb', 'tesouro', 'fii', 'acoes'];

const MONEY_DECIMALS = 2;

export const roundMoney = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Number(number.toFixed(MONEY_DECIMALS));
};

const asPositiveMoney = (value) => {
  const number = roundMoney(value);
  return number > 0 ? number : 0;
};

export const createFamily = (id, name, project, balance) => ({
  id,
  name,
  project,
  balance: roundMoney(balance),
  happiness: 0,
  energy: 5,
  reputation: 0,
  attributes: {
    inteligencia: 0,
    empatia: 0,
    resiliencia: 0,
    edFinanceira: 0,
    negociacao: 0,
  },
  investments: { poupanca: 0, cdb: 0, tesouro: 0, fii: 0, acoes: 0 },
  activeEffects: [],
  loans: [],
  history: [],
  isReady: false,
});

export const getInitialFamilies = () => [
  createFamily('1', 'Silva Ramos', 'Casa própria e sede do negócio', 100),
  createFamily('2', 'Oliveira Costa', 'Quitar dívidas e viajar', -300),
  createFamily('3', 'Souza Lima', 'Independência financeira', 2000),
  createFamily('4', 'Mendes Rocha', 'Formação dos jovens', 150),
  createFamily('5', 'Barbosa Santos', 'Adquirir maquinário', 700),
  createFamily('6', 'Camargo Faria', 'Reestruturar finanças', 200),
  createFamily('7', 'Xavier Duarte', 'Limpar o nome e reformar', -200),
  createFamily('8', 'Martins Alencar', 'Reserva de emergência', 500),
  createFamily('9', 'Castro Viana', 'Patrimônio internacional', 2000),
  createFamily('10', 'Pires Nogueira', 'Acessibilidade e quitar empréstimos', 250),
];

export const initialState = () => ({
  round: 1,
  isFinished: false,
  hasStarted: false,
  families: [],
});

export const getInvestmentsTotal = (investments = {}) =>
  roundMoney(Object.values(investments).reduce((sum, value) => sum + roundMoney(value), 0));

export const getOutstandingDebt = (loans = []) =>
  roundMoney(
    loans.reduce((total, loan) => {
      const totalInstallments = Math.max(0, Number(loan.totalInstallments) || 0);
      const currentInstallment = Math.max(1, Number(loan.currentInstallment) || 1);
      const remainingInstallments = Math.max(0, totalInstallments - currentInstallment + 1);
      return total + roundMoney(loan.installmentValue) * remainingInstallments;
    }, 0),
  );

export const getWealth = (balance, investments = {}, loans = []) =>
  roundMoney(roundMoney(balance) + getInvestmentsTotal(investments) - getOutstandingDebt(loans));

export const getCreditLimit = (wealth, loans = []) => {
  let approvedLimit;
  let maxInstallments;
  let interestRate;

  if (wealth < 500) {
    approvedLimit = 500;
    maxInstallments = 2;
    interestRate = 0.15;
  } else if (wealth < 2000) {
    approvedLimit = 1500;
    maxInstallments = 4;
    interestRate = 0.10;
  } else {
    approvedLimit = 4000;
    maxInstallments = 6;
    interestRate = 0.06;
  }

  const outstandingDebt = getOutstandingDebt(loans);
  const maxLoan = roundMoney(Math.max(0, approvedLimit - outstandingDebt));

  return {
    approvedLimit,
    maxLoan,
    maxInstallments,
    interestRate,
    outstandingDebt,
  };
};

export const hasSalaryBlock = (family) =>
  (family?.activeEffects || []).some((effect) => effect.type === 'sem_salario');

const createHistoryEntry = ({
  round,
  type,
  description = '',
  amount = 0,
  family,
}) => ({
  id: crypto.randomUUID(),
  round,
  type,
  description,
  amount: roundMoney(amount),
  balanceAfter: getWealth(family.balance, family.investments, family.loans),
});

const normalizeLoan = (loan = {}) => ({
  ...loan,
  id: loan.id || crypto.randomUUID(),
  name: loan.name || 'Empréstimo',
  totalPrincipal: asPositiveMoney(loan.totalPrincipal),
  totalInstallments: Math.max(1, Number(loan.totalInstallments) || 1),
  currentInstallment: Math.max(1, Number(loan.currentInstallment) || 1),
  installmentValue: asPositiveMoney(loan.installmentValue),
});

const normalizeEffect = (effect = {}) => ({
  ...effect,
  id: effect.id || crypto.randomUUID(),
  name: effect.name || 'Efeito',
  type: effect.type || 'deducao_fixa',
  amount: asPositiveMoney(effect.amount),
  duration:
    effect.duration === 'infinito'
      ? 'infinito'
      : Math.max(1, Number(effect.duration) || 1),
});

export const normalizeFamilyState = (family = {}) => {
  const { _skipSalary, ...rest } = family;

  return {
    ...rest,
    id: String(family.id ?? crypto.randomUUID()),
    name: family.name || 'Família',
    project: family.project || '',
    balance: roundMoney(family.balance),
    happiness: Number(family.happiness) || 0,
    energy: Number.isFinite(Number(family.energy)) ? Number(family.energy) : 5,
    reputation: Number(family.reputation) || 0,
    attributes: {
      inteligencia: 0,
      empatia: 0,
      resiliencia: 0,
      edFinanceira: 0,
      negociacao: 0,
      ...(family.attributes || {}),
    },
    investments: INVESTMENT_KEYS.reduce(
      (acc, key) => ({ ...acc, [key]: roundMoney(family.investments?.[key]) }),
      {},
    ),
    activeEffects: (family.activeEffects || []).map(normalizeEffect),
    loans: (family.loans || []).map(normalizeLoan).filter((loan) => loan.installmentValue > 0),
    history: Array.isArray(family.history) ? family.history : [],
    isReady: Boolean(family.isReady),
  };
};

export const normalizeGameState = (state) => {
  if (!state || typeof state !== 'object') return initialState();

  return {
    round: Math.max(1, Number(state.round) || 1),
    isFinished: Boolean(state.isFinished),
    hasStarted: Boolean(state.hasStarted),
    families: Array.isArray(state.families)
      ? state.families.map(normalizeFamilyState)
      : [],
  };
};

export const processNextRound = (state) => {
  const normalizedState = normalizeGameState(state);

  if (
    normalizedState.isFinished ||
    normalizedState.families.length === 0 ||
    normalizedState.families.some((family) => !family.isReady)
  ) {
    return normalizedState;
  }

  const updatedFamilies = normalizedState.families.map((family) => {
    let currentBalance = family.balance;
    const turnHistory = [...family.history];
    const remainingEffects = [];
    const newInvestments = { ...family.investments };

    family.activeEffects.forEach((effect) => {
      if (effect.type === 'deducao_fixa') {
        currentBalance = roundMoney(currentBalance - effect.amount);
        turnHistory.push(
          createHistoryEntry({
            round: normalizedState.round,
            type: 'efeito_ativo',
            description: effect.name,
            amount: -effect.amount,
            family: { ...family, balance: currentBalance, investments: newInvestments },
          }),
        );
      } else if (effect.type === 'receita_fixa') {
        currentBalance = roundMoney(currentBalance + effect.amount);
        turnHistory.push(
          createHistoryEntry({
            round: normalizedState.round,
            type: 'efeito_ativo',
            description: effect.name,
            amount: effect.amount,
            family: { ...family, balance: currentBalance, investments: newInvestments },
          }),
        );
      } else if (effect.type === 'sem_salario') {
        turnHistory.push(
          createHistoryEntry({
            round: normalizedState.round,
            type: 'efeito_ativo',
            description: `Bloqueio de salário: ${effect.name}`,
            amount: 0,
            family: { ...family, balance: currentBalance, investments: newInvestments },
          }),
        );
      }

      if (effect.duration === 'infinito') {
        remainingEffects.push(effect);
      } else if (effect.duration > 1) {
        remainingEffects.push({ ...effect, duration: effect.duration - 1 });
      }
    });

    const originalLoans = family.loans;
    const activeLoans = [];

    originalLoans.forEach((loan, index) => {
      currentBalance = roundMoney(currentBalance - loan.installmentValue);

      const nextLoan =
        loan.currentInstallment < loan.totalInstallments
          ? { ...loan, currentInstallment: loan.currentInstallment + 1 }
          : null;

      const loansAfterPayment = [
        ...activeLoans,
        ...(nextLoan ? [nextLoan] : []),
        ...originalLoans.slice(index + 1),
      ];

      turnHistory.push(
        createHistoryEntry({
          round: normalizedState.round,
          type: 'parcela_emprestimo',
          description: `Parcela ${loan.currentInstallment}/${loan.totalInstallments} - ${loan.name}`,
          amount: -loan.installmentValue,
          family: {
            ...family,
            balance: currentBalance,
            investments: newInvestments,
            loans: loansAfterPayment,
          },
        }),
      );

      if (nextLoan) activeLoans.push(nextLoan);
    });

    const yields = [
      { key: 'poupanca', rate: 0.05, name: 'Rendimento Poupança (5%)' },
      { key: 'cdb', rate: 0.10, name: 'Rendimento CDB (10%)' },
      { key: 'tesouro', rate: 0.15, name: 'Rendimento Tesouro (15%)' },
    ];

    yields.forEach((yieldRule) => {
      if (newInvestments[yieldRule.key] > 0) {
        const profit = roundMoney(newInvestments[yieldRule.key] * yieldRule.rate);
        newInvestments[yieldRule.key] = roundMoney(
          newInvestments[yieldRule.key] + profit,
        );

        turnHistory.push(
          createHistoryEntry({
            round: normalizedState.round,
            type: 'rendimento',
            description: yieldRule.name,
            amount: profit,
            family: {
              ...family,
              balance: currentBalance,
              investments: newInvestments,
              loans: activeLoans,
            },
          }),
        );
      }
    });

    return {
      ...family,
      balance: currentBalance,
      history: turnHistory,
      activeEffects: remainingEffects,
      investments: newInvestments,
      loans: activeLoans,
      isReady: false,
    };
  });

  return {
    ...normalizedState,
    round: normalizedState.round + 1,
    families: updatedFamilies,
  };
};

export const applyOperation = (familyInput, payload = {}) => {
  const family = normalizeFamilyState(familyInput);
  const {
    type,
    amount,
    description = '',
    round,
    effectData,
    effectId,
    loanData,
    card,
    invKey,
  } = payload;

  if (!type) return family;

  if (family.isReady && type !== 'toggle_ready') {
    return family;
  }

  const updated = {
    ...family,
    history: [...family.history],
    investments: { ...family.investments },
    attributes: { ...family.attributes },
    activeEffects: [...family.activeEffects],
    loans: [...family.loans],
  };

  const historyRound = Math.max(1, Number(round) || 1);

  const addHistory = (historyData) => {
    updated.history.push(
      createHistoryEntry({
        round: historyRound,
        family: updated,
        ...historyData,
      }),
    );
  };

  if (type === 'toggle_ready') {
    updated.isReady = !updated.isReady;
    addHistory({
      type: updated.isReady ? 'turno_concluido' : 'turno_reaberto',
      description: updated.isReady ? 'Turno concluído pela família' : 'Turno reaberto pelo mestre',
      amount: 0,
    });
    return updated;
  }

  if (['deposito', 'receita', 'salario', 'pagamento', 'imprevisto'].includes(type)) {
    const validAmount = asPositiveMoney(amount);
    if (!validAmount) return family;

    if (type === 'salario' && hasSalaryBlock(family)) {
      addHistory({
        type: 'salario_bloqueado',
        description: description || 'Recebimento de salário bloqueado por efeito ativo',
        amount: 0,
      });
      return updated;
    }

    const isIncome = ['deposito', 'receita', 'salario'].includes(type);
    updated.balance = roundMoney(
      isIncome ? updated.balance + validAmount : updated.balance - validAmount,
    );

    addHistory({
      type,
      amount: isIncome ? validAmount : -validAmount,
      description,
    });
    return updated;
  }

  if (type === 'jogar_carta') {
    if (!card || !card.id) return family;

    if (Number(card.happiness)) {
      updated.happiness += Number(card.happiness);
    }

    if (card.type === 'instant') {
      updated.balance = roundMoney(updated.balance + roundMoney(card.amount));

      addHistory({
        type: 'carta_rpg',
        amount: roundMoney(card.amount),
        description: `Carta ativada: ${card.name}${
          card.happiness
            ? ` • Felicidade ${card.happiness > 0 ? '+' : ''}${card.happiness}`
            : ''
        }`,
      });
    } else if (card.type === 'continuous') {
      updated.activeEffects.push(
        normalizeEffect({
          id: crypto.randomUUID(),
          name: card.name,
          type: card.effectType,
          amount: card.amount,
          duration: card.duration,
        }),
      );

      addHistory({
        type: 'efeito_adicionado',
        amount: 0,
        description: `Carta contínua ativada: ${card.name}`,
      });
    }

    return updated;
  }

  if (type === 'novo_efeito') {
    if (!effectData?.name || !effectData?.type) return family;

    const normalizedEffectData = normalizeEffect(effectData);

    if (
      normalizedEffectData.type !== 'sem_salario' &&
      normalizedEffectData.amount <= 0
    ) {
      return family;
    }

    updated.activeEffects.push(normalizedEffectData);
    addHistory({
      type: 'efeito_adicionado',
      amount: 0,
      description: `Efeito manual aplicado: ${normalizedEffectData.name}`,
    });
    return updated;
  }

  if (type === 'remover_efeito') {
    const effect = updated.activeEffects.find((item) => item.id === effectId);
    if (!effect) return family;

    updated.activeEffects = updated.activeEffects.filter(
      (item) => item.id !== effectId,
    );

    addHistory({
      type: 'efeito_removido',
      amount: 0,
      description: `Efeito removido: ${effect.name}`,
    });
    return updated;
  }

  if (type === 'investir') {
    const validAmount = asPositiveMoney(amount);
    if (
      !validAmount ||
      !INVESTMENT_KEYS.includes(invKey) ||
      updated.balance < validAmount
    ) {
      return family;
    }

    updated.balance = roundMoney(updated.balance - validAmount);
    updated.investments[invKey] = roundMoney(
      updated.investments[invKey] + validAmount,
    );

    addHistory({
      type: 'investimento',
      amount: -validAmount,
      description: `Aplicação em ${invKey}`,
    });
    return updated;
  }

  if (type === 'resgatar') {
    const validAmount = asPositiveMoney(amount);
    if (
      !validAmount ||
      !INVESTMENT_KEYS.includes(invKey) ||
      updated.investments[invKey] < validAmount
    ) {
      return family;
    }

    updated.investments[invKey] = roundMoney(
      updated.investments[invKey] - validAmount,
    );
    updated.balance = roundMoney(updated.balance + validAmount);

    addHistory({
      type: 'resgate',
      amount: validAmount,
      description: `Resgate de ${invKey}`,
    });
    return updated;
  }

  if (type === 'novo_emprestimo') {
    const principal = asPositiveMoney(loanData?.totalPrincipal);
    const installments = Math.max(
      1,
      Number(loanData?.totalInstallments) || 1,
    );
    const currentCredit = getCreditLimit(
      getWealth(updated.balance, updated.investments, updated.loans),
      updated.loans,
    );

    if (
      !principal ||
      principal > currentCredit.maxLoan ||
      installments > currentCredit.maxInstallments
    ) {
      return family;
    }

    const totalWithInterest = roundMoney(
      principal * (1 + currentCredit.interestRate * installments),
    );
    const installmentValue = roundMoney(totalWithInterest / installments);

    const normalizedLoan = normalizeLoan({
      id: loanData?.id || crypto.randomUUID(),
      name: `Crédito Direto (${(currentCredit.interestRate * 100).toFixed(0)}% a.m.)`,
      totalPrincipal: principal,
      totalInstallments: installments,
      currentInstallment: 1,
      installmentValue,
    });

    updated.balance = roundMoney(
      updated.balance + normalizedLoan.totalPrincipal,
    );
    updated.loans.push(normalizedLoan);

    addHistory({
      type: 'emprestimo',
      amount: normalizedLoan.totalPrincipal,
      description: `Contratação de empréstimo (${normalizedLoan.totalInstallments}x) • juros ${(currentCredit.interestRate * 100).toFixed(0)}% a.m.`,
    });
    return updated;
  }

  return family;
};

export const getRanking = (families = []) =>
  [...families].sort(
    (a, b) =>
      getWealth(b.balance, b.investments, b.loans) -
      getWealth(a.balance, a.investments, a.loans),
  );

export const formatMoney = (value) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(roundMoney(value));

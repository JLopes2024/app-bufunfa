// --- BANCO DE DADOS DE CARTAS DO JOGO ---
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
  { id: 'imp_chuva', name: 'Chuva Forte', category: 'Imprevisto', type: 'continuous', effectType: 'salario_metade', amount: 0, duration: 1, happiness: 0 },

  // Acontecimentos Especiais
  { id: 'esp_reforma', name: 'Reforma em Casa', category: 'Especial', type: 'instant', amount: -800, happiness: 1 },
  { id: 'esp_sorte', name: 'Sorte Grande', category: 'Especial', type: 'instant', amount: 1500, happiness: 2 },
  { id: 'esp_bolsa', name: 'Bolsa de Estudos', category: 'Especial', type: 'instant', amount: 500, happiness: 3 },
  { id: 'esp_viagem', name: 'Viagem dos Sonhos', category: 'Especial', type: 'instant', amount: -1500, happiness: 4 },
  { id: 'esp_heranca', name: 'Herança', category: 'Especial', type: 'instant', amount: 2000, happiness: 0 },
  { id: 'esp_proposta', name: 'Proposta Irresistível', category: 'Especial', type: 'instant', amount: 1000, happiness: -2 },
  { id: 'esp_risco_12', name: '[Alto Risco: Dado 1-2] Perdeu Tudo', category: 'Especial', type: 'instant', amount: -1500, happiness: 0 },
  { id: 'esp_risco_34', name: '[Alto Risco: Dado 3-4] Empatou', category: 'Especial', type: 'instant', amount: 0, happiness: 0 },
  { id: 'esp_risco_56', name: '[Alto Risco: Dado 5-6] Lucro Extremo', category: 'Especial', type: 'instant', amount: 2000, happiness: 0 },
  { id: 'esp_negocio_12', name: '[Peq. Negócio: Dado 1-2] Falência!', category: 'Especial', type: 'special_negocio_ruim', amount: 0, happiness: 0 },
  { id: 'esp_negocio_34', name: '[Peq. Negócio: Dado 3-4] Sobreviveu', category: 'Especial', type: 'instant', amount: 700, happiness: 0 },
  { id: 'esp_negocio_56', name: '[Peq. Negócio: Dado 5-6] Sucesso', category: 'Especial', type: 'instant', amount: 1500, happiness: 0 },
  { id: 'esp_carro', name: 'Carro Quebrou (Empréstimo)', category: 'Especial', type: 'special_carro', amount: 0, happiness: 0 }
];

export const createFamily = (id, name, project, balance) => ({
  id, name, project, balance,
  happiness: 0, energy: 5, reputation: 0,
  attributes: { inteligencia: 0, empatia: 0, resiliencia: 0, edFinanceira: 0, negociacao: 0 },
  investments: { poupanca: 0, cdb: 0, tesouro: 0, fii: 0, acoes: 0 },
  activeEffects: [], loans: [], history: [], isReady: false
});

export const getInitialFamilies = () => [
  createFamily("1", "Silva Ramos", "Casa própria e sede do negócio", 100),
  createFamily("2", "Oliveira Costa", "Quitar dívidas e viajar", -300),
  createFamily("3", "Souza Lima", "Independência financeira", 2000),
  createFamily("4", "Mendes Rocha", "Formação dos jovens", 150),
  createFamily("5", "Barbosa Santos", "Adquirir maquinário", 700),
  createFamily("6", "Camargo Faria", "Reestruturar finanças", 200),
  createFamily("7", "Xavier Duarte", "Limpar o nome e reformar", -200),
  createFamily("8", "Martins Alencar", "Reserva de emergência", 500),
  createFamily("9", "Castro Viana", "Patrimônio internacional", 2000),
  createFamily("10", "Pires Nogueira", "Acessibilidade e quitar empréstimos", 250),
];

export const initialState = () => ({ round: 1, isFinished: false, hasStarted: false, families: [] });

export const getWealth = (balance, investments) => {
  const invTotal = Object.values(investments || {}).reduce((sum, val) => sum + val, 0);
  return balance + invTotal;
};

export const getCreditLimit = (wealth) => {
  if (wealth < 500) return { maxLoan: 500, maxInstallments: 2, interestRate: 0.15 };
  if (wealth < 2000) return { maxLoan: 1500, maxInstallments: 4, interestRate: 0.10 };
  return { maxLoan: 4000, maxInstallments: 6, interestRate: 0.06 };
};

export const processNextRound = (state) => {
  const updatedFamilies = state.families.map(family => {
    let currentBalance = family.balance;
    let turnHistory = [...(family.history || [])];
    let remainingEffects = [];
    let newInvestments = { ...(family.investments || {}) };
    let activeLoans = [];

    (family.activeEffects || []).forEach(effect => {
      if (effect.type === 'deducao_fixa') {
        currentBalance -= effect.amount;
        turnHistory.push({ id: crypto.randomUUID(), round: state.round, type: 'efeito_ativo', description: effect.name, amount: -effect.amount, balanceAfter: getWealth(currentBalance, newInvestments) });
      } else if (effect.type === 'receita_fixa') {
        currentBalance += effect.amount;
        turnHistory.push({ id: crypto.randomUUID(), round: state.round, type: 'efeito_ativo', description: effect.name, amount: effect.amount, balanceAfter: getWealth(currentBalance, newInvestments) });
      }
      
      if (effect.duration === 'infinito') { remainingEffects.push(effect); } 
      else if (effect.duration > 1) { remainingEffects.push({ ...effect, duration: effect.duration - 1 }); }
    });

    (family.loans || []).forEach(loan => {
      const installmentValue = loan.installmentValue;
      currentBalance -= installmentValue;
      turnHistory.push({
        id: crypto.randomUUID(), round: state.round, type: 'parcela_emprestimo',
        description: `Parcela ${loan.currentInstallment}/${loan.totalInstallments} - ${loan.name}`,
        amount: -installmentValue, balanceAfter: getWealth(currentBalance, newInvestments)
      });
      if (loan.currentInstallment < loan.totalInstallments) { activeLoans.push({ ...loan, currentInstallment: loan.currentInstallment + 1 }); }
    });

    const yields = [
      { key: 'poupanca', rate: 0.05, name: 'Rendimento Poupança (5%)' },
      { key: 'cdb', rate: 0.10, name: 'Rendimento CDB (10%)' },
      { key: 'tesouro', rate: 0.15, name: 'Rendimento Tesouro (15%)' }
    ];

    yields.forEach(y => {
      if (newInvestments[y.key] > 0) {
        const profit = newInvestments[y.key] * y.rate;
        newInvestments[y.key] += profit;
        turnHistory.push({ id: crypto.randomUUID(), round: state.round, type: 'rendimento', description: y.name, amount: profit, balanceAfter: getWealth(currentBalance, newInvestments) });
      }
    });

    return { ...family, balance: currentBalance, history: turnHistory, activeEffects: remainingEffects, investments: newInvestments, loans: activeLoans, isReady: false };
  });

  return { ...state, round: state.round + 1, families: updatedFamilies };
};

export const applyOperation = (family, payload) => {
  let updated = { 
    ...family, history: [...(family.history || [])], investments: { ...(family.investments || {}) },
    attributes: { ...(family.attributes || {}) }, activeEffects: [...(family.activeEffects || [])], loans: [...(family.loans || [])]
  };
  
  const { type, amount, description, round, effectData, effectId, loanData, card, customData, invKey, diceRoll } = payload;

  if (type === 'toggle_ready') { updated.isReady = !updated.isReady; }
  else if (type === 'deposito' || type === 'pagamento') {
    updated.balance = type === 'deposito' ? updated.balance + amount : updated.balance - amount;
    updated.history.push({ id: crypto.randomUUID(), round, type, amount: type === 'deposito' ? amount : -amount, description, balanceAfter: getWealth(updated.balance, updated.investments) });
  } 
  else if (type === 'salario') {
    const isFired = updated.activeEffects.some(e => e.type === 'sem_salario');
    const hasRain = updated.activeEffects.some(e => e.type === 'salario_metade');
    
    if (isFired) {
      updated.history.push({ id: crypto.randomUUID(), round, type: 'salario_bloqueado', amount: 0, description: `[BLOQUEADO: DEMISSÃO] ${description || 'Salário'}`, balanceAfter: getWealth(updated.balance, updated.investments) });
    } else {
      const finalAmount = hasRain ? amount / 2 : amount;
      const descPrefix = hasRain ? '[CORTADO 50%: CHUVA FORTE] ' : '';
      updated.balance += finalAmount;
      updated.history.push({ id: crypto.randomUUID(), round, type: 'salario', amount: finalAmount, description: `${descPrefix}${description || 'Pagamento de Salário'}`, balanceAfter: getWealth(updated.balance, updated.investments) });
    }
  }
  else if (type === 'jogar_carta') {
    if (card.happiness !== 0) updated.happiness += card.happiness;
    
    if (card.type === 'instant') {
      if (card.amount !== 0) {
        updated.balance += card.amount;
        updated.history.push({ id: crypto.randomUUID(), round, type: 'carta_rpg', amount: card.amount, description: `Efeito Especial: ${card.name}`, balanceAfter: getWealth(updated.balance, updated.investments) });
      }
    } 
    else if (card.type === 'continuous') {
      updated.activeEffects.push({ id: crypto.randomUUID(), name: card.name, type: card.effectType, amount: card.amount, duration: card.duration });
    } 
    // Nova Mecânica: Ruína de Pequeno Negócio
    else if (card.type === 'special_negocio_ruim') {
      let balanceLoss = 0;
      if (updated.balance < 0) {
        balanceLoss = updated.balance; // Vai gerar um "prejuízo" igual ao que já deve
        updated.balance *= 2; // Dobra a negativação
      } else {
        balanceLoss = -updated.balance;
        updated.balance = 0; // Zera o caixa positivo
      }
      // Varrer e cortar 50% de todos os investimentos
      Object.keys(updated.investments).forEach(k => { updated.investments[k] /= 2; });
      updated.history.push({ id: crypto.randomUUID(), round, type: 'carta_rpg', amount: balanceLoss, description: `🚨 FALÊNCIA TOTAL (Dado 1-2): Dívida dobrada / Caixa e Investimentos reduzidos em 50%!`, balanceAfter: getWealth(updated.balance, updated.investments) });
    }
    // Nova Mecânica: Empréstimo Compulsório
    else if (card.type === 'special_carro') {
      const installments = customData?.installments || 1;
      const principal = 1200;
      const totalWithInterest = principal * (1 + 0.15 * installments);
      
      updated.loans.push({
        id: crypto.randomUUID(),
        name: `Mecânico: Carro Quebrou (15% a.m.)`,
        totalPrincipal: principal,
        totalInstallments: installments,
        currentInstallment: 1,
        installmentValue: totalWithInterest / installments
      });
      // Registra que pegou empréstimo para pagar conserto. (Net balance não muda no momento, só cria a dívida).
      updated.history.push({ id: crypto.randomUUID(), round, type: 'carta_rpg', amount: 0, description: `🔧 Carro Quebrou: Financiou R$ 1.200 em ${installments}x`, balanceAfter: getWealth(updated.balance, updated.investments) });
    }
  }
  else if (type === 'novo_efeito') { updated.activeEffects.push(effectData); }
  else if (type === 'remover_efeito') { updated.activeEffects = updated.activeEffects.filter(ef => ef.id !== effectId); }
  else if (type === 'investir') {
    updated.balance -= amount;
    updated.investments[invKey] += amount;
    updated.history.push({ id: crypto.randomUUID(), round, type: 'investimento', amount: -amount, description: `Aplicação em ${invKey}`, balanceAfter: getWealth(updated.balance, updated.investments) });
  }
  else if (type === 'resgatar') {
    updated.investments[invKey] -= amount;
    updated.balance += amount;
    updated.history.push({ id: crypto.randomUUID(), round, type: 'resgate', amount, description: `Resgate de ${invKey}`, balanceAfter: getWealth(updated.balance, updated.investments) });
  }
  else if (type === 'novo_emprestimo') {
    updated.balance += loanData.totalPrincipal;
    updated.loans.push(loanData);
    updated.history.push({ id: crypto.randomUUID(), round, type: 'emprestimo', amount: loanData.totalPrincipal, description: `Contratação de Empréstimo (${loanData.totalInstallments}x)`, balanceAfter: getWealth(updated.balance, updated.investments) });
  }
  else if (type === 'market_oscillation') {
    const currentAmount = updated.investments[invKey];
    if (currentAmount > 0) {
      let multiplier = 1; let oscDescription = '';
      if (invKey === 'acoes') {
        if (diceRoll <= 2) { multiplier = 0.5; oscDescription = `Crash (Dado ${diceRoll}): Perdeu 50%`; }
        else if (diceRoll <= 4) { multiplier = 1; oscDescription = `Mercado Estável (Dado ${diceRoll}): Sem alteração`; }
        else { multiplier = 2; oscDescription = `Mercado em Alta (Dado ${diceRoll}): Dobrou (+100%)!`; }
      } else if (invKey === 'fii') {
        if (diceRoll <= 2) { multiplier = 0.9; oscDescription = `Vacância (Dado ${diceRoll}): Perdeu 10%`; }
        else { multiplier = 1.2; oscDescription = `Dividendos (Dado ${diceRoll}): Ganhou 20%`; }
      }
      if (multiplier !== 1) {
        const newAmount = currentAmount * multiplier;
        const diff = newAmount - currentAmount;
        updated.investments[invKey] = newAmount;
        updated.history.push({ id: crypto.randomUUID(), round, type: 'rendimento', amount: diff, description: `Mercado (${invKey.toUpperCase()}): ${oscDescription}`, balanceAfter: getWealth(updated.balance, updated.investments) });
      }
    }
  }

  return updated;
};

export const getRanking = (families) => [...families].sort((a, b) => getWealth(b.balance, b.investments) - getWealth(a.balance, a.investments));
export const formatMoney = (value) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
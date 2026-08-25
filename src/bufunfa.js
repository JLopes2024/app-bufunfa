
// --- BANCO DE DADOS DE CARTAS DO JOGO ---

export const GAME_CARDS = [

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

    let skipSalary = false;

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

      if (effect.type === 'sem_salario') skipSalary = true;

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



    return { ...family, balance: currentBalance, history: turnHistory, activeEffects: remainingEffects, investments: newInvestments, loans: activeLoans, _skipSalary: skipSalary, isReady: false };

  });



  return { ...state, round: state.round + 1, families: updatedFamilies };

};



export const applyOperation = (family, payload) => {

  let updated = { 

    ...family, history: [...(family.history || [])], investments: { ...(family.investments || {}) },

    attributes: { ...(family.attributes || {}) }, activeEffects: [...(family.activeEffects || [])], loans: [...(family.loans || [])]

  };

  

  const { type, amount, description, round, effectData, effectId, loanData, card, invKey, diceRoll } = payload;



  if (type === 'toggle_ready') { updated.isReady = !updated.isReady; }

  else if (type === 'deposito' || type === 'pagamento' || type === 'imprevisto') {

    if (type === 'deposito' && family._skipSalary && description.toLowerCase().includes('salário')) return updated;

    updated.balance = type === 'deposito' ? updated.balance + amount : updated.balance - amount;

    updated.history.push({ id: crypto.randomUUID(), round, type, amount: type === 'deposito' ? amount : -amount, description, balanceAfter: getWealth(updated.balance, updated.investments) });

  } 

  else if (type === 'jogar_carta') {

    if (card.happiness !== 0) updated.happiness += card.happiness;

    if (card.type === 'instant' && card.amount !== 0) {

      updated.balance += card.amount;

      updated.history.push({ id: crypto.randomUUID(), round, type: 'carta_rpg', amount: card.amount, description: `Carta Ativada: ${card.name}`, balanceAfter: getWealth(updated.balance, updated.investments) });

    } else if (card.type === 'continuous') {

      updated.activeEffects.push({ id: crypto.randomUUID(), name: card.name, type: card.effectType, amount: card.amount, duration: card.duration });

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

  // NOVO: OSCILAÇÃO DE MERCADO (RENDA VARIÁVEL)

  else if (type === 'market_oscillation') {

    const currentAmount = updated.investments[invKey];

    if (currentAmount > 0) {

      let multiplier = 1;

      let oscDescription = '';



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

        

        updated.history.push({ 

          id: crypto.randomUUID(), round, type: 'rendimento', amount: diff, 

          description: `Mercado (${invKey.toUpperCase()}): ${oscDescription}`, 

          balanceAfter: getWealth(updated.balance, updated.investments) 

        });

      }

    }

  }



  return updated;

};



export const getRanking = (families) => [...families].sort((a, b) => getWealth(b.balance, b.investments) - getWealth(a.balance, a.investments));

export const formatMoney = (value) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

Para implementar o efeito da carta "Chuva Forte" cortando o salário pela metade, você precisará fazer três pequenas alterações no seu código.

A lógica do jogo já identifica o salário pela palavra "salário" na descrição do depósito e possui um sistema para bloqueá-lo totalmente (_skipSalary). Vamos criar um sistema semelhante chamado _halfSalary.

Aqui estão as partes que você precisa atualizar:

1. Adicionar a Carta ao GAME_CARDS
Insira a nova carta no seu array de cartas. Adicionei o effectType: 'metade_salario' para podermos rastreá-lo.

JavaScript
// Adicione esta linha dentro do export const GAME_CARDS = [ ... ]
{ id: 'imp_chuva_forte', name: 'Chuva Forte', category: 'Imprevisto', type: 'continuous', effectType: 'metade_salario', amount: 0, duration: 1, happiness: -1 },
2. Atualizar o processNextRound
Precisamos ler esse novo efeito e repassar uma "flag" (_halfSalary) para a família, igual você já faz com o _skipSalary.

JavaScript
export const processNextRound = (state) => {
  const updatedFamilies = state.families.map(family => {
    let currentBalance = family.balance;
    let turnHistory = [...(family.history || [])];
    let remainingEffects = [];
    let skipSalary = false;
    let halfSalary = false; // <--- NOVO CONTROLE
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
      
      // Checagem de status do salário
      if (effect.type === 'sem_salario') skipSalary = true;
      if (effect.type === 'metade_salario') halfSalary = true; // <--- NOVA CHECAGEM

      if (effect.duration === 'infinito') { remainingEffects.push(effect); } 
      else if (effect.duration > 1) { remainingEffects.push({ ...effect, duration: effect.duration - 1 }); }
    });

    // ... (o resto da função de empréstimos e rendimentos continua exatamente igual) ...

    return { 
      ...family, 
      balance: currentBalance, 
      history: turnHistory, 
      activeEffects: remainingEffects, 
      investments: newInvestments, 
      loans: activeLoans, 
      _skipSalary: skipSalary, 
      _halfSalary: halfSalary, // <--- ADICIONADO AQUI
      isReady: false 
    };
  });

  return { ...state, round: state.round + 1, families: updatedFamilies };
};
3. Atualizar a função applyOperation
Agora vamos modificar o trecho que processa os depósitos. Se a transação for um salário e a flag _halfSalary estiver ativa, dividimos o valor por 2 antes de somar ao saldo.

Substitua o bloco atual de deposito/pagamento/imprevisto por este:

JavaScript
  else if (type === 'deposito' || type === 'pagamento' || type === 'imprevisto') {
    let finalAmount = amount;
    let finalDesc = description;

    // Intercepta depósitos que contenham a palavra "salário"
    if (type === 'deposito' && description.toLowerCase().includes('salário')) {
      if (family._skipSalary) return updated; // Se demitido, ignora tudo
      if (family._halfSalary) {
        finalAmount = amount / 2; // Corta pela metade
        finalDesc = `${description} (Afetado por Chuva Forte)`; // Deixa claro no histórico
      }
    }

    updated.balance = type === 'deposito' ? updated.balance + finalAmount : updated.balance - finalAmount;
    
    updated.history.push({ 
      id: crypto.randomUUID(), 
      round, 
      type, 
      amount: type === 'deposito' ? finalAmount : -finalAmount, 
      description: finalDesc, 
      balanceAfter: getWealth(updated.balance, updated.investments) 
    });
  } 
me da o arquivo completo com as alterações

Your JavaScript file is ready

Ícone do app JS
game_logic
 JS 
Aberto
Aqui está o arquivo completo com as alterações implementadas. A nova carta de Chuva Forte foi adicionada ao banco de dados e a lógica para reduzir o salário pela metade está perfeitamente integrada no processamento de turnos e aplicação de operações.




O Gemini é uma IA e pode cometer erros.

Integrating New Features
// --- BANCO DE DADOS DE CARTAS DO JOGO ---
export const GAME_CARDS = [
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
  { id: 'imp_celular', name: 'Celular Quebrou', category: 'Imprevisto', type: 'instant', amount: -600, happiness: 0 },
  { id: 'imp_medico', name: 'Consulta Médica', category: 'Imprevisto', type: 'instant', amount: -250, happiness: 0 },
  { id: 'imp_pneu', name: 'Furou o Pneu', category: 'Imprevisto', type: 'instant', amount: -180, happiness: 0 },
  { id: 'imp_carteira', name: 'Perdeu a Carteira', category: 'Imprevisto', type: 'instant', amount: -150, happiness: 0 },
  { id: 'imp_aluguel', name: 'Aumento do Aluguel', category: 'Imprevisto', type: 'continuous', effectType: 'deducao_fixa', amount: 200, duration: 'infinito', happiness: 0 },
  { id: 'imp_golpe', name: 'Golpe Online', category: 'Imprevisto', type: 'instant', amount: -350, happiness: 0 },
  { id: 'imp_demissao', name: 'Demissão', category: 'Imprevisto', type: 'continuous', effectType: 'sem_salario', amount: 0, duration: 1, happiness: 0 },
  { id: 'imp_saude', name: 'Despesa com Saúde', category: 'Imprevisto', type: 'instant', amount: -200, happiness: 0 },
  { id: 'imp_conserto', name: 'Conserto em Casa', category: 'Imprevisto', type: 'instant', amount: -300, happiness: 0 },
  { id: 'imp_chuva_forte', name: 'Chuva Forte', category: 'Imprevisto', type: 'continuous', effectType: 'metade_salario', amount: 0, duration: 1, happiness: -1 }
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
    let skipSalary = false;
    let halfSalary = false; // <-- NOVO CONTROLE
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
      
      // CHECAGEM DE STATUS DE SALÁRIO
      if (effect.type === 'sem_salario') skipSalary = true;
      if (effect.type === 'metade_salario') halfSalary = true; // <-- NOVA CHECAGEM

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

    return { ...family, balance: currentBalance, history: turnHistory, activeEffects: remainingEffects, investments: newInvestments, loans: activeLoans, _skipSalary: skipSalary, _halfSalary: halfSalary, isReady: false };
  });

  return { ...state, round: state.round + 1, families: updatedFamilies };
};

export const applyOperation = (family, payload) => {
  let updated = { 
    ...family, history: [...(family.history || [])], investments: { ...(family.investments || {}) },
    attributes: { ...(family.attributes || {}) }, activeEffects: [...(family.activeEffects || [])], loans: [...(family.loans || [])]
  };
  
  const { type, amount, description, round, effectData, effectId, loanData, card, invKey, diceRoll } = payload;

  if (type === 'toggle_ready') { updated.isReady = !updated.isReady; }
  else if (type === 'deposito' || type === 'pagamento' || type === 'imprevisto') {
    let finalAmount = amount;
    let finalDesc = description;

    // Intercepta depósitos que contenham a palavra "salário"
    if (type === 'deposito' && description.toLowerCase().includes('salário')) {
      if (family._skipSalary) return updated; // Se demitido, ignora tudo
      if (family._halfSalary) {
        finalAmount = amount / 2; // Corta pela metade
        finalDesc = `${description} (Afetado por Chuva Forte)`; // Deixa claro no histórico
      }
    }

    updated.balance = type === 'deposito' ? updated.balance + finalAmount : updated.balance - finalAmount;
    
    updated.history.push({ 
      id: crypto.randomUUID(), 
      round, 
      type, 
      amount: type === 'deposito' ? finalAmount : -finalAmount, 
      description: finalDesc, 
      balanceAfter: getWealth(updated.balance, updated.investments) 
    });
  } 
  else if (type === 'jogar_carta') {
    if (card.happiness !== 0) updated.happiness += card.happiness;
    if (card.type === 'instant' && card.amount !== 0) {
      updated.balance += card.amount;
      updated.history.push({ id: crypto.randomUUID(), round, type: 'carta_rpg', amount: card.amount, description: `Carta Ativada: ${card.name}`, balanceAfter: getWealth(updated.balance, updated.investments) });
    } else if (card.type === 'continuous') {
      updated.activeEffects.push({ id: crypto.randomUUID(), name: card.name, type: card.effectType, amount: card.amount, duration: card.duration });
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
  // OSCILAÇÃO DE MERCADO (RENDA VARIÁVEL)
  else if (type === 'market_oscillation') {
    const currentAmount = updated.investments[invKey];
    if (currentAmount > 0) {
      let multiplier = 1;
      let oscDescription = '';

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
        
        updated.history.push({ 
          id: crypto.randomUUID(), round, type: 'rendimento', amount: diff, 
          description: `Mercado (${invKey.toUpperCase()}): ${oscDescription}`, 
          balanceAfter: getWealth(updated.balance, updated.investments) 
        });
      }
    }
  }

  return updated;
};

export const getRanking = (families) => [...families].sort((a, b) => getWealth(b.balance, b.investments) - getWealth(a.balance, a.investments));
export const formatMoney = (value) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

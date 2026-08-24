import React, { useState } from 'react';
import { useGameState } from './useGameState';
import { applyOperation, getRanking, formatMoney, processNextRound, getWealth, getCreditLimit, getInitialFamilies, GAME_CARDS } from './bufunfa';
import './App.css';

export default function App() {
  const { state, setState, resetGame } = useGameState();
  const [selectedId, setSelectedId] = useState(null);
  const [view, setView] = useState('dashboard'); 
  const [activeTab, setActiveTab] = useState('caixa');
  const [toast, setToast] = useState(null);
  
  const [setupSelected, setSetupSelected] = useState([]);
  const predefinedFamilies = getInitialFamilies();

  const [opType, setOpType] = useState('deposito');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const [invAction, setInvAction] = useState('investir');
  const [invKey, setInvKey] = useState('poupanca');
  const [invAmount, setInvAmount] = useState('');

  const [loanAmount, setLoanAmount] = useState('');
  const [loanInstallments, setLoanInstallments] = useState(2);
  const [masterPassword, setMasterPassword] = useState('');

  const [selectedCardId, setSelectedCardId] = useState('');
  const [effectName, setEffectName] = useState('');
  const [effectType, setEffectType] = useState('deducao_fixa');
  const [effectAmount, setEffectAmount] = useState('');
  const [effectDuration, setEffectDuration] = useState('infinito');

  const selectedFamily = state.families.find(f => f.id === selectedId);
  const ranking = getRanking(state.families);
  const readyCount = state.families.filter(f => f.isReady).length;
  const allReady = state.families.length > 0 && readyCount === state.families.length;

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  if (!state.hasStarted) {
    const handleToggleSetup = (id) => {
      setSetupSelected(prev => prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]);
    };

    const handleStartGame = () => {
      if (setupSelected.length < 2) return;
      const selectedFamilies = predefinedFamilies.filter(f => setupSelected.includes(f.id));
      setState({ round: 1, isFinished: false, hasStarted: true, families: selectedFamilies });
      showToast("SISTEMA INICIADO COM SUCESSO!");
    };

    return (
      <div className="app-container">
        {toast && <div className="toast">✓ {toast}</div>}
        <header className="header">
          <div>
            <h1>SETUP <span>BUFUNFA®</span></h1>
            <p className="text-muted" style={{marginTop: '8px'}}>Selecione as famílias participantes (Mín. 2)</p>
          </div>
          <div className="header-actions">
            <span style={{ fontWeight: '800', marginRight: '16px', color: 'var(--nu-purple)' }}>[{setupSelected.length}] ATIVAS</span>
            <button className="btn btn-primary" onClick={handleStartGame} disabled={setupSelected.length < 2}>BOOT SYSTEM</button>
          </div>
        </header>
        <main className="panel">
          <div className="families-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
            {predefinedFamilies.map(f => {
              const isSelected = setupSelected.includes(f.id);
              return (
                <div key={f.id} onClick={() => handleToggleSetup(f.id)} className={`family-card ${isSelected ? 'active' : ''}`} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                  <div>
                    <div className="title">{f.name}</div>
                    <div className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '16px' }}>{f.project}</div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                    <span className="amount">{formatMoney(f.balance)}</span>
                    {isSelected ? <span className="badge" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>ONLINE</span> : <span className="badge" style={{ background: 'rgba(0,0,0,0.5)', color: 'var(--text-muted)' }}>OFFLINE</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    );
  }

  const handleNextRound = () => {
    if (!allReady) { alert("ACESSO NEGADO: Aguardando check-in de todas as famílias."); return; }
    setState(prev => processNextRound(prev));
    showToast("MÊS AVANÇADO!");
  };

  const finalizarJogo = () => {
    if(window.confirm("ATENÇÃO: Encerrar simulação e emitir relatório final?")) {
      setState(prev => ({ ...prev, isFinished: true }));
      setView('relatorio');
    }
  };

  const dispatchToFamily = (payload) => {
    if (!selectedId || state.isFinished) return;
    setState(prev => ({
      ...prev,
      families: prev.families.map(f => f.id === selectedId ? applyOperation(f, { ...payload, round: prev.round }) : f)
    }));
  };

  const toggleFamilyReady = () => {
    if (!selectedId) return;
    dispatchToFamily({ type: 'toggle_ready' });
    showToast(!selectedFamily.isReady ? `${selectedFamily.name} ONLINE!` : `CHECK-IN REABERTO.`);
  };

  const handleCaixa = (e) => {
    e.preventDefault();
    const val = Number(amount.replace(',', '.'));
    if (val > 0) {
      dispatchToFamily({ type: opType, amount: val, description });
      showToast(`TRANSAÇÃO CONCLUÍDA!`);
      setAmount(''); setDescription('');
    }
  };

  const handleJogarCarta = (e) => {
    e.preventDefault();
    if (!selectedCardId) return;

    if (selectedCardId === 'custom') {
      const parsedAmount = Number(effectAmount.replace(',', '.'));
      if (effectType !== 'sem_salario' && (isNaN(parsedAmount) || parsedAmount <= 0)) {
        alert("Valor inválido."); return;
      }
      const effectData = { 
        id: crypto.randomUUID(), name: effectName, type: effectType, 
        amount: parsedAmount || 0, duration: effectDuration === 'infinito' ? 'infinito' : Number(effectDuration) 
      };
      dispatchToFamily({ type: 'novo_efeito', effectData });
      showToast(`EFEITO MANUAL APLICADO!`);
      setEffectName(''); setEffectAmount('');
    } else {
      const card = GAME_CARDS.find(c => c.id === selectedCardId);
      dispatchToFamily({ type: 'jogar_carta', card });
      showToast(`CARTA PROCESSADA!`);
    }
    setSelectedCardId('');
  };

  const handleInvestir = (e) => {
    e.preventDefault();
    const val = Number(invAmount.replace(',', '.'));
    if (isNaN(val) || val <= 0) return;

    if (invAction === 'investir') {
      if (selectedFamily.balance >= val) { dispatchToFamily({ type: 'investir', amount: val, invKey }); showToast("APLICAÇÃO EFETUADA!"); } 
      else alert("SALDO INSUFICIENTE.");
    } else {
      if (selectedFamily.investments[invKey] >= val) { dispatchToFamily({ type: 'resgatar', amount: val, invKey }); showToast("RESGATE CONCLUÍDO!"); } 
      else alert("MONTANTE INDISPONÍVEL.");
    }
    setInvAmount('');
  };

  const handleEmprestimo = (e) => {
    e.preventDefault();
    const val = Number(loanAmount.replace(',', '.'));
    if (isNaN(val) || val <= 0) return;

    const wealth = getWealth(selectedFamily.balance, selectedFamily.investments);
    const credit = getCreditLimit(wealth);

    if (selectedFamily.balance < 0 && masterPassword !== '1234') {
      alert("CONTA BLOQUEADA: Requer senha Master (1234)."); return;
    }
    if (val > credit.maxLoan) { alert(`LIMITE EXCEDIDO (Máx: ${formatMoney(credit.maxLoan)})`); return; }
    if (loanInstallments > credit.maxInstallments) { alert(`PARCELAS EXCEDIDAS (Máx: ${credit.maxInstallments}x)`); return; }

    const totalWithInterest = val * (1 + credit.interestRate * loanInstallments);
    dispatchToFamily({ 
      type: 'novo_emprestimo', 
      loanData: { id: crypto.randomUUID(), name: `Crédito Direto (${(credit.interestRate * 100).toFixed(0)}% a.m.)`, totalPrincipal: val, totalInstallments: Number(loanInstallments), currentInstallment: 1, installmentValue: totalWithInterest / loanInstallments } 
    });
    showToast("CRÉDITO LIBERADO!");
    setLoanAmount(''); setMasterPassword('');
  };

  if (view === 'relatorio') {
    return (
      <div className="app-container">
        <header className="header">
          <div><h1>AUDITORIA <span>BUFUNFA</span></h1><p className="text-muted" style={{marginTop:'8px'}}>Relatório Final de Simulação</p></div>
          <div className="header-actions">
            <span className="badge" style={{background:'var(--danger)', color:'#fff'}}>SISTEMA ENCERRADO</span>
            <button className="btn btn-outline" onClick={() => setView('dashboard')}>VOLTAR AO PAINEL</button>
            <button className="btn btn-danger" onClick={resetGame}>NOVA SIMULAÇÃO</button>
          </div>
        </header>
        <main>
          {ranking.map((family, index) => (
            <section key={family.id} className="panel" style={{ padding: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', borderBottom:'1px solid var(--border-light)', paddingBottom:'24px' }}>
                <div>
                  <h2 style={{ color: index===0?'var(--warning)':'var(--text-main)', fontWeight: '900', fontSize:'1.8rem' }}>{index + 1}º LUGAR: {family.name}</h2>
                  <p className="text-muted" style={{marginTop:'8px'}}>Felicidade: {family.happiness} • Energia: {family.energy}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p className="text-muted" style={{fontWeight:'700'}}>PATRIMÔNIO FINAL</p>
                  <div className={`display-amount ${getWealth(family.balance, family.investments) < 0 ? 'text-danger' : 'text-success'}`} style={{marginTop:'0'}}>{formatMoney(getWealth(family.balance, family.investments))}</div>
                </div>
              </div>
              {family.history?.length === 0 ? <p className="text-muted">Sem registros na blockchain.</p> : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
                    <thead>
                      <tr>
                        <th style={{ padding: '16px 0', borderBottom: '2px solid var(--border-light)', color:'var(--text-muted)' }}>Mês</th>
                        <th style={{ padding: '16px 0', borderBottom: '2px solid var(--border-light)', color:'var(--text-muted)' }}>Operação</th>
                        <th style={{ padding: '16px 0', borderBottom: '2px solid var(--border-light)', color:'var(--text-muted)' }}>Descrição</th>
                        <th style={{ padding: '16px 0', borderBottom: '2px solid var(--border-light)', color:'var(--text-muted)' }}>Valor</th>
                        <th style={{ padding: '16px 0', borderBottom: '2px solid var(--border-light)', textAlign: 'right', color:'var(--text-muted)' }}>Saldo/Patrimônio</th>
                      </tr>
                    </thead>
                    <tbody>
                      {family.history?.map(h => (
                        <tr key={h.id}>
                          <td style={{ padding: '20px 0', borderBottom: '1px solid var(--border-light)', fontWeight: '800' }}>{h.round}</td>
                          <td style={{ padding: '20px 0', borderBottom: '1px solid var(--border-light)', textTransform: 'uppercase', fontSize:'0.8rem', letterSpacing:'1px' }}>{h.type.replace('_', ' ')}</td>
                          <td style={{ padding: '20px 0', borderBottom: '1px solid var(--border-light)', color:'var(--text-muted)' }}>{h.description || '-'}</td>
                          <td className={h.amount > 0 ? 'text-success' : h.amount < 0 ? 'text-danger' : ''} style={{ padding: '20px 0', borderBottom: '1px solid var(--border-light)' }}>
                            {h.amount > 0 ? '+' : ''}{h.amount !== 0 ? formatMoney(h.amount) : '-'}
                          </td>
                          <td style={{ padding: '20px 0', borderBottom: '1px solid var(--border-light)', fontWeight: '900', textAlign: 'right' }}>{formatMoney(h.balanceAfter)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          ))}
        </main>
      </div>
    );
  }

  const familyWealth = selectedFamily ? getWealth(selectedFamily.balance, selectedFamily.investments) : 0;
  const familyCredit = getCreditLimit(familyWealth);
  const selectedCardData = GAME_CARDS.find(c => c.id === selectedCardId);

  return (
    <div className="app-container">
      {toast && <div className="toast">✓ {toast}</div>}
      <header className="header">
        <div><h1>BANCO <span>BUFUNFA</span></h1><p className="text-muted" style={{marginTop:'8px'}}>CONTA MESTRE • STATUS: {readyCount}/{state.families.length} SINCRONIZADAS</p></div>
        <div className="header-actions">
          {state.isFinished && <span className="badge" style={{background:'var(--danger)', color:'#fff'}}>OFFLINE</span>}
          <span className="btn btn-outline" style={{ border: '1px solid var(--nu-purple)', color:'var(--nu-purple)' }}>MÊS {state.round}</span>
          <button className="btn btn-primary" onClick={handleNextRound} disabled={state.isFinished || !allReady}>AVANÇAR MÊS {!allReady && `(${readyCount}/${state.families.length})`}</button>
          {state.isFinished ? <button className="btn btn-outline" onClick={() => setView('relatorio')}>RELATÓRIO</button> : <button className="btn btn-outline" onClick={finalizarJogo}>ENCERRAR</button>}
          <button className="btn btn-danger" onClick={resetGame}>RESET</button>
        </div>
      </header>

      <main className="main-grid">
        <section>
          <div className="panel">
            <h2 style={{ fontSize: '1.4rem', fontWeight: '900', marginBottom: '16px', textTransform:'uppercase' }}>Terminais Ativos</h2>
            <div className="families-grid">
              {state.families.map(f => (
                <div key={f.id} onClick={() => setSelectedId(f.id)} className={`family-card ${selectedId === f.id ? 'active' : ''}`}>
                  <div className="title">{f.name}</div>
                  <div className={`amount ${getWealth(f.balance, f.investments) < 0 ? 'text-danger' : 'text-success'}`}>{formatMoney(getWealth(f.balance, f.investments))}</div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
                    {f.isReady ? <span className="badge" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>✓ OK</span> : <span className="badge" style={{ background: 'rgba(255,189,0,0.1)', color: 'var(--warning)' }}>PENDENTE</span>}
                    {f?.activeEffects?.length > 0 && <span className="badge" style={{background:'var(--danger-bg)', color:'var(--danger)'}}>DEBUFF</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedFamily ? (
            <div className="panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                <div><h2 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-1px', color:'var(--text-main)', textTransform:'uppercase' }}>{selectedFamily.name}</h2><p className="text-muted" style={{fontSize:'1.1rem'}}>{selectedFamily.project}</p></div>
                <div style={{ textAlign: 'right' }}><p className="text-muted" style={{ marginBottom: '4px', fontWeight:'700', letterSpacing:'1px' }}>CAIXA LIVRE</p><div className={`display-amount ${selectedFamily.balance < 0 ? 'text-danger' : 'text-success'}`}>{formatMoney(selectedFamily.balance)}</div></div>
              </div>

              {!state.isFinished && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: selectedFamily.isReady ? 'var(--success-bg)' : 'rgba(255,255,255,0.02)', padding: '20px 24px', borderRadius: 'var(--radius-md)', marginBottom: '32px', border: `1px solid ${selectedFamily.isReady ? 'var(--success)' : 'var(--border-light)'}`}}>
                  <div>
                    <span style={{ fontWeight: '800', fontSize: '1.1rem', color: selectedFamily.isReady ? 'var(--success)' : 'var(--text-main)' }}>{selectedFamily.isReady ? '✓ SINCRONIZAÇÃO CONCLUÍDA' : '⏳ AGUARDANDO COMANDOS'}</span>
                    <p className="text-muted" style={{ fontSize: '0.9rem', marginTop:'4px' }}>{selectedFamily.isReady ? 'Família liberada para o próximo mês.' : 'Finalize as operações financeiras e confirme ao lado.'}</p>
                  </div>
                  <button className={`btn ${selectedFamily.isReady ? 'btn-outline' : 'btn-primary'}`} onClick={toggleFamilyReady} style={{ border: selectedFamily.isReady ? '1px solid var(--success)' : 'none', color: selectedFamily.isReady ? 'var(--success)' : '#000', background: selectedFamily.isReady ? 'transparent' : 'var(--success)' }}>{selectedFamily.isReady ? 'REABRIR TERMINAL' : 'CONCLUIR TURNO'}</button>
                </div>
              )}

              {!state.isFinished ? (
                <>
                  <div className="tabs">
                    <button className={`tab-btn ${activeTab === 'caixa' ? 'active' : ''}`} onClick={() => setActiveTab('caixa')}>HUB FINANCEIRO</button>
                    <button className={`tab-btn ${activeTab === 'investimentos' ? 'active' : ''}`} onClick={() => setActiveTab('investimentos')}>PORTFÓLIO</button>
                    <button className={`tab-btn ${activeTab === 'emprestimos' ? 'active' : ''}`} onClick={() => setActiveTab('emprestimos')}>LINHAS DE CRÉDITO</button>
                    <button className={`tab-btn ${activeTab === 'rpg' ? 'active' : ''}`} onClick={() => setActiveTab('rpg')}>MESA RPG</button>
                  </div>

                  {activeTab === 'caixa' && (
                    <form onSubmit={handleCaixa} className="form-group">
                      <select className="form-input" value={opType} onChange={(e) => setOpType(e.target.value)} style={{ flex: '0 1 220px' }}>
                        <option value="deposito">RECEITA INBOUND (+)</option>
                        <option value="pagamento">DESPESA OUTBOUND (-)</option>
                      </select>
                      <input className="form-input" type="number" step="0.01" placeholder="VALOR (R$)" value={amount} onChange={(e) => setAmount(e.target.value)} required />
                      <input className="form-input" type="text" placeholder="DESCRIÇÃO DO LANÇAMENTO" value={description} onChange={(e) => setDescription(e.target.value)} />
                      <button type="submit" className="btn btn-primary">PROCESSAR</button>
                    </form>
                  )}

                  {activeTab === 'investimentos' && (
                    <div>
                       <div className="attr-grid">
                          <div className="attr-box"><h4 style={{color:'var(--success)'}}>POUPANÇA</h4><div className="val">{formatMoney(selectedFamily.investments.poupanca)}</div></div>
                          <div className="attr-box"><h4 style={{color:'var(--nu-purple)'}}>CDB</h4><div className="val">{formatMoney(selectedFamily.investments.cdb)}</div></div>
                          <div className="attr-box"><h4 style={{color:'var(--warning)'}}>TESOURO</h4><div className="val">{formatMoney(selectedFamily.investments.tesouro)}</div></div>
                       </div>
                       <form onSubmit={handleInvestir} className="form-group" style={{marginTop: '32px'}}>
                         <select className="form-input" value={invAction} onChange={e=>setInvAction(e.target.value)} style={{ flex: '0 1 200px' }}>
                            <option value="investir">APORTE (+)</option>
                            <option value="resgatar">LIQUIDAÇÃO (-)</option>
                         </select>
                         <select className="form-input" value={invKey} onChange={e=>setInvKey(e.target.value)}>
                            <option value="poupanca">CAIXINHA POUPANÇA</option>
                            <option value="cdb">CDB BANCÁRIO</option>
                            <option value="tesouro">TESOURO DIRETO</option>
                         </select>
                         <input className="form-input" type="number" step="0.01" placeholder="VALOR (R$)" value={invAmount} onChange={e=>setInvAmount(e.target.value)} required />
                         <button type="submit" className={invAction === 'investir' ? 'btn btn-primary' : 'btn btn-danger'}>EXECUTAR ORDEM</button>
                      </form>
                    </div>
                  )}

                  {activeTab === 'emprestimos' && (
                    <div>
                      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: 'var(--radius-md)', marginBottom: '32px', border:'1px solid var(--border-light)' }}>
                        <h4 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '12px', letterSpacing:'1px' }}>ANÁLISE DE SCORE DE CRÉDITO</h4>
                        <p style={{ fontSize: '1.1rem', fontWeight: '600', display:'flex', gap:'24px', flexWrap:'wrap' }}>
                          <span>Teto Aprovado: <strong className="text-success">{formatMoney(familyCredit.maxLoan)}</strong></span>
                          <span>Taxa: <strong style={{ color: 'var(--warning)' }}>{(familyCredit.interestRate * 100).toFixed(0)}% a.m.</strong></span>
                          <span>Prazo Máx: <strong>{familyCredit.maxInstallments}x</strong></span>
                        </p>
                      </div>
                      <form onSubmit={handleEmprestimo} className="form-group">
                        <input className="form-input" type="number" step="0.01" placeholder="MONTANTE SOLICITADO (R$)" value={loanAmount} onChange={e=>setLoanAmount(e.target.value)} required />
                        <select className="form-input" value={loanInstallments} onChange={e=>setLoanInstallments(Number(e.target.value))} style={{ flex: '0 1 200px' }}>
                          {[...Array(familyCredit.maxInstallments)].map((_, i) => (<option key={i+1} value={i+1}>{i+1}x PARCELAS</option>))}
                        </select>
                        {selectedFamily.balance < 0 && (<input className="form-input" type="password" placeholder="OVERRIDE PIN (1234)" value={masterPassword} onChange={e=>setMasterPassword(e.target.value)} style={{ flex: '0 1 200px', borderColor: 'var(--danger)', color:'var(--danger)' }} required />)}
                        <button type="submit" className="btn btn-primary">EMITIR CONTRATO</button>
                      </form>
                      {selectedFamily?.loans?.length > 0 && (
                        <div style={{ marginTop: '32px' }}>
                          <h4 style={{ fontSize: '1.2rem', marginBottom: '16px', fontWeight:'800', textTransform:'uppercase' }}>Contratos Ativos</h4>
                          {selectedFamily.loans.map(loan => (
                            <div key={loan.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 20px', background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-sm)', marginBottom: '8px', borderLeft:'4px solid var(--warning)' }}>
                              <div><strong style={{fontSize:'1.1rem'}}>{loan.name}</strong><br/><span className="text-muted">Principal: {formatMoney(loan.totalPrincipal)}</span></div>
                              <div className="text-danger" style={{textAlign:'right', fontSize:'0.9rem'}}>PARCELA {loan.currentInstallment}/{loan.totalInstallments}<br/><strong style={{fontSize:'1.2rem'}}>{formatMoney(loan.installmentValue)}</strong></div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'rpg' && (
                    <div>
                      <div className="attr-grid" style={{ marginBottom: '32px' }}>
                        <div className="attr-box" style={{borderLeft:'4px solid var(--warning)'}}>
                          <h4 style={{ color: 'var(--warning)' }}>Felicidade</h4>
                          <div className="val">{selectedFamily.happiness}</div>
                        </div>
                        <div className="attr-box" style={{borderLeft:'4px solid #38bdf8'}}>
                          <h4 style={{ color: '#38bdf8' }}>Energia</h4>
                          <div className="val">{selectedFamily.energy}</div>
                        </div>
                      </div>
                      
                      <form onSubmit={handleJogarCarta} className="form-group" style={{ borderTop: '1px solid var(--border-light)', paddingTop: '32px' }}>
                         <h4 style={{width: '100%', fontSize: '1.1rem', fontWeight:'900', textTransform:'uppercase', color:'var(--text-main)'}}>Deck Oficial do Jogo</h4>
                         
                         <select className="form-input" value={selectedCardId} onChange={e=>setSelectedCardId(e.target.value)} style={{ width: '100%' }} required>
                            <option value="" disabled>--- ESCANEAR CARTA JOGADA ---</option>
                            <optgroup label="[+] OPORTUNIDADES (DECK VERDE)">
                              {GAME_CARDS.filter(c => c.category === 'Oportunidade').map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
                            </optgroup>
                            <optgroup label="[-] IMPREVISTOS (DECK VERMELHO)">
                              {GAME_CARDS.filter(c => c.category === 'Imprevisto').map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
                            </optgroup>
                            <optgroup label="[!] CONTROLE DE MESTRE">
                              <option value="custom">⚙️ INJETAR STATUS CUSTOMIZADO</option>
                            </optgroup>
                         </select>

                         {selectedCardData && (
                           <div style={{ width: '100%', padding: '20px', background: selectedCardData.category === 'Oportunidade' ? 'var(--success-bg)' : 'var(--danger-bg)', borderRadius: 'var(--radius-sm)', border:`1px solid ${selectedCardData.category === 'Oportunidade' ? 'var(--success)' : 'var(--danger)'}` }}>
                             <strong style={{display:'block', marginBottom:'8px', fontSize:'1.1rem'}}>ALVO: {selectedCardData.name}</strong>
                             <span className="text-muted" style={{display:'block', marginBottom:'8px'}}>TIPO: {selectedCardData.type === 'instant' ? `Aplicação Imediata` : `Duração: ${selectedCardData.duration === 'infinito' ? 'Permanente' : selectedCardData.duration + ' Mês'}`}</span>
                             <div style={{display:'flex', gap:'24px', fontSize:'1.2rem'}}>
                               <span style={{ color: selectedCardData.amount >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: '900' }}>
                                 {selectedCardData.amount === 0 ? 'NENHUM CUSTO' : formatMoney(selectedCardData.amount)}
                               </span>
                               {selectedCardData.happiness !== 0 && (
                                 <span style={{ fontWeight: '900', color:'var(--warning)' }}>
                                   FELICIDADE {selectedCardData.happiness > 0 ? `+${selectedCardData.happiness}` : selectedCardData.happiness}
                                 </span>
                               )}
                             </div>
                           </div>
                         )}

                         {selectedCardId === 'custom' && (
                           <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', width: '100%', padding: '24px', background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-sm)', border:'1px dashed var(--border-light)' }}>
                             <input className="form-input" type="text" placeholder="TÍTULO DO EFEITO" value={effectName} onChange={e=>setEffectName(e.target.value)} required />
                             <select className="form-input" value={effectType} onChange={e=>setEffectType(e.target.value)}>
                                <option value="deducao_fixa">DEDUÇÃO RECORRENTE</option>
                                <option value="receita_fixa">RECEITA RECORRENTE</option>
                                <option value="sem_salario">BLOQUEIO DE SALÁRIO</option>
                             </select>
                             {effectType !== 'sem_salario' && <input className="form-input" type="number" step="0.01" placeholder="VALOR (R$)" value={effectAmount} onChange={e=>setEffectAmount(e.target.value)} style={{ width: '150px' }} />}
                             <select className="form-input" value={effectDuration} onChange={e=>setEffectDuration(e.target.value)}>
                                <option value="infinito">PERMANENTE</option>
                                <option value="1">1 MÊS</option>
                                <option value="2">2 MESES</option>
                             </select>
                           </div>
                         )}
                         <button type="submit" className="btn btn-primary" style={{ width: '100%', padding:'16px', fontSize:'1.1rem' }}>
                           {selectedCardId === 'custom' ? 'INJETAR CÓDIGO' : 'EXECUTAR CARTA'}
                         </button>
                      </form>
                      
                      {selectedFamily?.activeEffects?.length > 0 && (
                        <div style={{display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '32px'}}>
                          <h4 style={{ width: '100%', fontSize: '1rem', color: 'var(--text-muted)', textTransform:'uppercase', letterSpacing:'1px' }}>Processos Contínuos (Debuffs):</h4>
                          {selectedFamily.activeEffects.map(ef => (
                            <div key={ef.id} className="badge" style={{ padding:'10px 16px', fontSize:'0.85rem', background: ef.type === 'receita_fixa' ? 'var(--success-bg)' : 'var(--danger-bg)', color: ef.type === 'receita_fixa' ? 'var(--success)' : 'var(--danger)', border:`1px solid ${ef.type === 'receita_fixa' ? 'var(--success)' : 'var(--danger)'}` }}>
                              {ef.name} {(ef.type === 'deducao_fixa' || ef.type === 'receita_fixa') ? `(${ef.type === 'deducao_fixa' ? '-' : '+'}${formatMoney(ef.amount)})` : ''} 
                              <button onClick={() => {
                                dispatchToFamily({ type: 'remover_efeito', effectId: ef.id });
                                showToast("PROCESSO INTERROMPIDO!");
                              }} style={{ marginLeft: '12px', background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', fontSize:'1.1rem' }}>✖</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div style={{ padding: '32px', background: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', fontWeight: '800', textAlign: 'center', border:'1px solid var(--danger)' }}>
                  ACESSO BLOQUEADO (SIMULAÇÃO ENCERRADA).
                </div>
              )}
            </div>
          ) : ( <div className="panel" style={{textAlign:'center', padding:'100px 20px', border:'1px dashed var(--border-light)'}}><p className="text-muted" style={{fontSize:'1.2rem', letterSpacing:'1px', textTransform:'uppercase'}}>SELECIONE UM TERMINAL NO PAINEL</p></div> )}
        </section>

        <aside className="panel" style={{ alignSelf: 'start', padding:'24px' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '900', marginBottom: '32px', textTransform:'uppercase', color:'var(--text-main)' }}>LEADERBOARD</h2>
          <div>
            {ranking.map((family, index) => (
              <div key={family.id} className="ranking-item">
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                  <span className={`rank-position ${index === 0 ? 'first' : ''}`}>{index + 1}</span>
                  <div>
                    <div className="family-name">{family.name}</div>
                    <div style={{ fontSize: '0.8rem', marginTop:'4px', color: family.isReady ? 'var(--success)' : 'var(--warning)', fontWeight:'700', textTransform:'uppercase' }}>{family.isReady ? '✓ Sincronizado' : '⏳ Pendente'}</div>
                  </div>
                </div>
                <div className={`family-score ${getWealth(family.balance, family.investments) < 0 ? 'text-danger' : 'text-success'}`} style={{ fontWeight: '900' }}>
                  {formatMoney(getWealth(family.balance, family.investments))}
                </div>
              </div>
            ))}
          </div>
        </aside>
      </main>
    </div>
  );
}
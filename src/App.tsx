import React, { useState, useEffect } from 'react';
import { TransactionTable } from './components/TransactionTable';
import { DashboardCharts } from './components/DashboardCharts';
import { Transaction } from './types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Moon, Sun, Eye, EyeOff } from 'lucide-react';
import { ParticleButton } from './components/ui/particle-button';

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: '1',
      idLogista: 1,
      nomeLogista: 'Loja Principal',
      nomeGrupo1: 'Receita',
      nomeGrupo2: 'Vendas de Produtos',
      nomeGrupo3: 'Venda Marketplace',
      dataDoInput: '07-03-2025',
      valorDoInput: 5000
    },
    {
      id: '2',
      idLogista: 1,
      nomeLogista: 'Loja Principal',
      nomeGrupo1: 'Despesa',
      nomeGrupo2: 'Custos Diretos',
      nomeGrupo3: 'Compra de Estoque',
      dataDoInput: '07-03-2025',
      valorDoInput: 500
    },
    {
      id: '3',
      idLogista: 1,
      nomeLogista: 'Loja Principal',
      nomeGrupo1: 'Despesa',
      nomeGrupo2: 'Despesas Operacionais',
      nomeGrupo3: 'Conta de Energia',
      dataDoInput: '07-03-2025',
      valorDoInput: 200
    }
  ]);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showNumbers, setShowNumbers] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getLastUpdateDate = () => {
    if (transactions.length === 0) return null;
    return new Date(Math.max(...transactions.map(t => new Date(t.dataDoInput).getTime())));
  };

  const handleAddTransaction = (newTransaction: Omit<Transaction, 'id'>) => {
    setTransactions(prev => [{
      ...newTransaction,
      id: Math.random().toString(36).substr(2, 9)
    }, ...prev]);
  };

  const handleUpdateTransaction = (updatedTransaction: Transaction) => {
    setTransactions(prev => 
      prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t)
    );
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const toggleNumberVisibility = () => {
    setShowNumbers(!showNumbers);
  };

  const lastUpdate = getLastUpdateDate();
  const currentYear = new Date().getFullYear();

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-100'} transition-colors duration-200`}>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-start mb-8">
            <div className="flex items-center gap-4">
              <img 
                src="https://raw.githubusercontent.com/85ED/oLogista/main/img/Final-03.png"
                alt="Savenum Logo" 
                className="h-16"
              />
              <div>
                <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Controle Financeiro do Lojista
                </h1>
                {lastUpdate && (
                  <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Última atualização: {format(lastUpdate, 'dd/MM/yyyy HH:mm')}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleNumberVisibility}
                className={`p-2 rounded-full ${
                  isDarkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                title={showNumbers ? 'Ocultar números' : 'Mostrar números'}
              >
                {showNumbers ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              <div className="flex flex-col items-end">
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {format(currentTime, 'MMMM, EEEE', { locale: ptBR })}
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {format(currentTime, 'dd/MM/yyyy HH:mm:ss')}
                </p>
              </div>
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-full ${
                  isDarkMode 
                    ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </div>
          <DashboardCharts transactions={transactions} isDarkMode={isDarkMode} showNumbers={showNumbers} />
          <div className="mt-8">
            <TransactionTable 
              transactions={transactions}
              onAddTransaction={handleAddTransaction}
              onUpdateTransaction={handleUpdateTransaction}
              onDeleteTransaction={handleDeleteTransaction}
              isDarkMode={isDarkMode}
              showNumbers={showNumbers}
            />
          </div>
          <footer className={`mt-12 text-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <p>Controle financeiro eficiente para lojistas digitais.</p>
            <p>CNPJ: 55.457.764/0001-00 | Code 85. Todos os direitos reservados © {currentYear}.</p>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default App;
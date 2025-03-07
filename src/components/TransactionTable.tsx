import React, { useState } from 'react';
import { Download, Upload, Plus, Pencil, Trash2, X, Check, Info } from 'lucide-react';
import { Transaction, SUB_GROUPS } from '../types';
import { format, parse, isValid } from 'date-fns';
import * as XLSX from 'xlsx';
import { Dialog } from './ui/dialog';
import { Button } from './ui/button';

interface TransactionTableProps {
  transactions: Transaction[];
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  onUpdateTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  isDarkMode: boolean;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  onAddTransaction,
  onUpdateTransaction,
  onDeleteTransaction,
  isDarkMode
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Transaction | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const handleExportToExcel = () => {
    const exportData = transactions.map(t => ({
      ...t,
      dataDoInput: format(new Date(t.dataDoInput), 'dd-MM-yyyy')
    }));
    
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    XLSX.writeFile(wb, "transactions.xlsx");
  };

  const downloadChartOfAccounts = () => {
    const chartData = [
      ['Tipo', 'Categoria', 'Descrição'],
      ['Receita', 'Vendas de Produtos', 'Valor recebido das plataformas'],
      ['Receita', 'Frete Pago pelo Cliente', 'Quando o cliente arca com a entrega'],
      ['Receita', 'Receitas Financeiras', 'Cashback, juros sobre saldo em conta'],
      ['Receita', 'Outras Receitas', 'Reembolsos e bônus promocionais'],
      ['Despesa', 'Custos Diretos', 'Custos relacionados à venda'],
      ['Despesa', 'Compra de Mercadorias', 'Custos com fornecedores e fabricação'],
      ['Despesa', 'Embalagens e Insumos', 'Caixas, etiquetas, fitas, proteção'],
      ['Despesa', 'Frete e Logística', 'Custos com envio, coletas e transportadoras'],
      ['Despesa', 'Comissões dos Marketplaces', 'Taxas cobradas pelos marketplaces'],
      ['Despesa', 'Taxas de Pagamento', 'Tarifas de antecipação, taxas do cartão e PIX'],
      ['Despesa', 'Despesas Operacionais', 'Custos fixos e variáveis do negócio'],
      ['Despesa', 'Plataformas e Ferramentas', 'ERP, softwares, anúncios pagos'],
      ['Despesa', 'Marketing e Publicidade', 'Anúncios patrocinados, influencers'],
      ['Despesa', 'Impostos e Taxas', 'MEI, Simples Nacional, notas fiscais'],
      ['Despesa', 'Equipamentos e Manutenção', 'Computador, impressora, aluguel']
    ];

    const ws = XLSX.utils.aoa_to_sheet(chartData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Plano de Contas");
    XLSX.writeFile(wb, "plano-de-contas.xlsx");
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        jsonData.forEach((row: any) => {
          try {
            let parsedDate;
            if (typeof row.dataDoInput === 'number') {
              // Handle Excel date number format
              parsedDate = new Date((row.dataDoInput - 25569) * 86400 * 1000);
            } else if (typeof row.dataDoInput === 'string') {
              // Try different date formats
              const formats = ['dd-MM-yyyy', 'dd/MM/yyyy'];
              for (const dateFormat of formats) {
                parsedDate = parse(row.dataDoInput, dateFormat, new Date());
                if (isValid(parsedDate)) break;
              }
            }
            
            if (!isValid(parsedDate)) {
              console.error('Invalid date format:', row.dataDoInput);
              return;
            }
            
            const formattedDate = format(parsedDate, 'dd-MM-yyyy');
            onAddTransaction({
              idLogista: Number(row.idLogista) || 1,
              nomeLogista: row.nomeLogista || 'Loja Principal',
              nomeGrupo1: row.nomeGrupo1 as Transaction['nomeGrupo1'],
              nomeGrupo2: row.nomeGrupo2 as Transaction['nomeGrupo2'],
              nomeGrupo3: row.nomeGrupo3,
              dataDoInput: formattedDate,
              valorDoInput: Number(row.valorDoInput) || 0
            });
          } catch (error) {
            console.error('Error processing row:', row, error);
          }
        });
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const startEditing = (transaction: Transaction) => {
    setEditingId(transaction.id);
    setEditForm(transaction);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const saveEditing = () => {
    if (editForm) {
      onUpdateTransaction(editForm);
      setEditingId(null);
      setEditForm(null);
    }
  };

  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(parse(b.dataDoInput, 'dd-MM-yyyy', new Date())).getTime() - 
    new Date(parse(a.dataDoInput, 'dd-MM-yyyy', new Date())).getTime()
  );

  const handleAddNewTransaction = () => {
    const now = new Date();
    const formattedDate = format(now, 'dd-MM-yyyy');
    
    const newTransaction = {
      idLogista: 1,
      nomeLogista: 'Loja Principal',
      nomeGrupo1: 'Receita' as const,
      nomeGrupo2: 'Vendas de Produtos' as const,
      nomeGrupo3: '',
      dataDoInput: formattedDate,
      valorDoInput: 0
    };
    onAddTransaction(newTransaction);
  };

  return (
    <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Extrato de Movimentações
          </h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsHelpOpen(true)}
              className={`${isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}
            >
              <Info className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadChartOfAccounts}
              className={`${isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}
            >
              <Download className="w-4 h-4 mr-2" />
              Plano de Contas
            </Button>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportToExcel}
            className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700"
          >
            <Download size={16} />
            Exportar
          </button>
          <label className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700 cursor-pointer">
            <Upload size={16} />
            Importar
            <input
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
          <button
            onClick={handleAddNewTransaction}
            className="flex items-center gap-1 bg-purple-600 text-white px-3 py-1.5 rounded text-sm hover:bg-purple-700"
          >
            <Plus size={16} />
            Novo
          </button>
        </div>
      </div>

      <Dialog isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)}>
        <h2 className="text-2xl font-bold mb-4">Organize suas Finanças com Facilidade!</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Aqui está seu plano de contas estruturado de forma simples e intuitiva. Sempre que for adicionar uma nova entrada ou saída, siga essa estrutura para manter tudo bem organizado!
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">🏦 1º Grupo: Tipo de Input</h3>
        <p className="mb-4">Escolha se sua movimentação é uma Receita (dinheiro entrando) ou uma Despesa (dinheiro saindo).</p>
        <ul className="list-disc pl-6 mb-4">
          <li>🔹 1. Receitas – Todo dinheiro que entra na sua conta.</li>
          <li>🔹 2. Despesas – Todos os custos e gastos do seu negócio.</li>
        </ul>

        <h3 className="text-xl font-semibold mt-6 mb-3">📂 2º Grupo: Subcontas</h3>
        
        <h4 className="text-lg font-semibold mt-4 mb-2">💰 Receitas (Entradas de Dinheiro)</h4>
        <p className="mb-2">Aqui você cadastra tudo que faz seu saldo crescer!</p>
        <ul className="list-disc pl-6 mb-4">
          <li>🛍️ Vendas de Produtos – Valor recebido das plataformas.</li>
          <li>🚛 Frete Pago pelo Cliente – Quando o cliente arca com a entrega.</li>
          <li>💸 Receitas Financeiras – Cashback, juros sobre saldo em conta.</li>
          <li>🎁 Outras Receitas – Reembolsos e bônus promocionais.</li>
        </ul>

        <h4 className="text-lg font-semibold mt-4 mb-2">💸 Despesas (Saídas de Dinheiro)</h4>
        <p className="mb-2">Aqui você controla tudo que sai do seu caixa!</p>

        <h5 className="text-base font-semibold mt-3 mb-2">💼 Custos Diretos (Relacionados à venda de produtos):</h5>
        <ul className="list-disc pl-6 mb-4">
          <li>📦 Compra de Mercadorias – Custos com fornecedores e fabricação.</li>
          <li>🎀 Embalagens e Insumos – Caixas, etiquetas, fitas, proteção.</li>
          <li>🚚 Frete e Logística – Custos com envio, coletas e transportadoras.</li>
          <li>🏬 Comissões dos Marketplaces – Taxas cobradas pelo Mercado Livre, Amazon, Shopee, etc.</li>
          <li>💳 Taxas de Pagamento – Tarifas de antecipação, taxas do cartão e PIX.</li>
        </ul>

        <h5 className="text-base font-semibold mt-3 mb-2">🏢 Despesas Operacionais (Custos fixos e variáveis do negócio):</h5>
        <ul className="list-disc pl-6 mb-4">
          <li>🖥️ Plataformas e Ferramentas – ERP, softwares, anúncios pagos.</li>
          <li>📢 Marketing e Publicidade – Anúncios patrocinados, influencers, promoções.</li>
          <li>📑 Impostos e Taxas – MEI, Simples Nacional, emissão de notas fiscais.</li>
          <li>🔧 Equipamentos e Manutenção – Computador, impressora térmica, celular, aluguel de espaço.</li>
        </ul>

        <h3 className="text-xl font-semibold mt-6 mb-3">📝 3º Grupo: Descrição da Conta</h3>
        <p className="mb-4">Para cada conta cadastrada, você pode adicionar uma descrição personalizada. Isso ajuda a detalhar melhor suas entradas e saídas, facilitando a gestão financeira.</p>

        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
          <h4 className="text-lg font-semibold mb-2">🎯 Exemplo:</h4>
          <p><strong>Conta:</strong> Comissões dos Marketplaces</p>
          <p><strong>Descrição:</strong> Taxas cobradas pelo Mercado Livre em cada venda realizada.</p>
        </div>
      </Dialog>

      <div className="overflow-auto max-h-[500px]">
        <table className="min-w-full">
          <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} sticky top-0`}>
            <tr>
              <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Data</th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Lojista</th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Tipo</th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Categoria</th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Descrição</th>
              <th className={`px-6 py-3 text-right text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Valor (R$)</th>
              <th className={`px-6 py-3 text-right text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Ações</th>
            </tr>
          </thead>
          <tbody className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
            {sortedTransactions.map((transaction) => (
              <tr key={transaction.id}>
                {editingId === transaction.id ? (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="date"
                        value={editForm?.dataDoInput}
                        onChange={(e) => {
                          const date = new Date(e.target.value);
                          const formattedDate = format(date, 'dd-MM-yyyy');
                          setEditForm(prev => prev ? {...prev, dataDoInput: formattedDate} : null);
                        }}
                        className={`border rounded px-2 py-1 w-full ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300'
                        }`}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="text"
                        value={editForm?.nomeLogista}
                        onChange={(e) => setEditForm(prev => prev ? {...prev, nomeLogista: e.target.value} : null)}
                        className={`border rounded px-2 py-1 w-full ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300'
                        }`}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={editForm?.nomeGrupo1}
                        onChange={(e) => {
                          const nomeGrupo1 = e.target.value as Transaction['nomeGrupo1'];
                          setEditForm(prev => prev ? {
                            ...prev,
                            nomeGrupo1,
                            nomeGrupo2: SUB_GROUPS[nomeGrupo1][0]
                          } : null);
                        }}
                        className={`border rounded px-2 py-1 w-full ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300'
                        }`}
                      >
                        <option value="Receita">Receita (Entrada)</option>
                        <option value="Despesa">Despesa (Saída)</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={editForm?.nomeGrupo2}
                        onChange={(e) => setEditForm(prev => prev ? {...prev, nomeGrupo2: e.target.value} : null)}
                        className={`border rounded px-2 py-1 w-full ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300'
                        }`}
                      >
                        {editForm && SUB_GROUPS[editForm.nomeGrupo1].map((subGroup) => (
                          <option key={subGroup} value={subGroup}>
                            {subGroup}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="text"
                        value={editForm?.nomeGrupo3 || ''}
                        onChange={(e) => setEditForm(prev => prev ? {...prev, nomeGrupo3: e.target.value} : null)}
                        className={`border rounded px-2 py-1 w-full ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300'
                        }`}
                        placeholder="Descrição (opcional)"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        value={editForm?.valorDoInput}
                        onChange={(e) => setEditForm(prev => prev ? {...prev, valorDoInput: Number(e.target.value)} : null)}
                        className={`border rounded px-2 py-1 w-full text-right ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300'
                        }`}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={saveEditing}
                        className="text-green-600 hover:text-green-900 mr-2"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={cancelEditing}
                        className={`${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'}`}
                      >
                        <X size={16} />
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className={`px-6 py-4 whitespace-nowrap ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                      {transaction.dataDoInput}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                      {transaction.nomeLogista}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        transaction.nomeGrupo1 === 'Receita' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.nomeGrupo1}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                      {transaction.nomeGrupo2}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                      {transaction.nomeGrupo3 || '-'}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-right ${
                      transaction.nomeGrupo1 === 'Receita' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.valorDoInput.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => startEditing(transaction)}
                        className="text-blue-600 hover:text-blue-900 mr-2"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => onDeleteTransaction(transaction.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Transaction } from '../types';
import { format, parse, subDays, subMonths, subYears, isWithinInterval, startOfDay, startOfMonth, endOfMonth } from 'date-fns';

type DateRange = '1W' | '1M' | '1Y' | 'ALL';

interface DashboardChartsProps {
  transactions: Transaction[];
  isDarkMode: boolean;
  showNumbers: boolean;
}

const COLORS = {
  revenue: '#10B981', // Green
  expense: '#EF4444', // Red
  // Colors for different categories
  'Vendas de Produtos': '#3B82F6',
  'Frete Pago pelo Cliente': '#6366F1',
  'Receitas Financeiras': '#8B5CF6',
  'Outras Receitas': '#EC4899',
  'Custos Diretos': '#F59E0B',
  'Compra de Mercadorias': '#D97706',
  'Embalagens e Insumos': '#B45309',
  'Frete e Logística': '#92400E',
  'Comissões dos Marketplaces': '#059669',
  'Taxas de Pagamento': '#047857',
  'Despesas Operacionais': '#DC2626',
  'Plataformas e Ferramentas': '#B91C1C',
  'Marketing e Publicidade': '#991B1B',
  'Impostos e Taxas': '#7F1D1D',
  'Equipamentos e Manutenção': '#4B5563'
};

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ transactions, isDarkMode, showNumbers }) => {
  const [expensesRange, setExpensesRange] = useState<DateRange>('1M');
  const [revenueRange, setRevenueRange] = useState<DateRange>('1M');
  const [netIncomeRange, setNetIncomeRange] = useState<DateRange>('1M');

  const parseTransactionDate = (dateStr: string) => {
    return parse(dateStr, 'dd-MM-yyyy', new Date());
  };

  const getDateRange = (range: DateRange) => {
    const now = new Date();
    switch (range) {
      case '1W':
        return { start: subDays(now, 7), end: now };
      case '1M':
        return { start: subMonths(now, 1), end: now };
      case '1Y':
        return { start: subYears(now, 1), end: now };
      default:
        return null;
    }
  };

  const filterTransactionsByRange = (transactions: Transaction[], range: DateRange) => {
    const dateRange = getDateRange(range);
    if (!dateRange) return transactions;

    return transactions.filter(t => {
      const transactionDate = startOfDay(parseTransactionDate(t.dataDoInput));
      return isWithinInterval(transactionDate, dateRange);
    });
  };

  const getCurrentMonthTransactions = () => {
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);

    return transactions.filter(t => {
      const transactionDate = startOfDay(parseTransactionDate(t.dataDoInput));
      return isWithinInterval(transactionDate, { start, end });
    });
  };

  const processDataForExpenses = (range: DateRange) => {
    const filteredTransactions = filterTransactionsByRange(transactions, range);
    const expensesByDay = filteredTransactions
      .filter(t => t.nomeGrupo1 === 'Despesa')
      .reduce((acc: any, curr) => {
        const date = format(parseTransactionDate(curr.dataDoInput), 'dd/MM');
        acc[date] = (acc[date] || 0) + curr.valorDoInput;
        return acc;
      }, {});

    return Object.entries(expensesByDay).map(([date, value]) => ({
      date,
      value
    })).sort((a, b) => {
      const [dayA, monthA] = a.date.split('/').map(Number);
      const [dayB, monthB] = b.date.split('/').map(Number);
      return (monthA * 31 + dayA) - (monthB * 31 + dayB);
    });
  };

  const processDataForRevenue = (range: DateRange) => {
    const filteredTransactions = filterTransactionsByRange(transactions, range);
    const revenueByDay = filteredTransactions
      .filter(t => t.nomeGrupo1 === 'Receita')
      .reduce((acc: any, curr) => {
        const date = format(parseTransactionDate(curr.dataDoInput), 'dd/MM');
        acc[date] = (acc[date] || 0) + curr.valorDoInput;
        return acc;
      }, {});

    return Object.entries(revenueByDay).map(([date, value]) => ({
      date,
      value
    })).sort((a, b) => {
      const [dayA, monthA] = a.date.split('/').map(Number);
      const [dayB, monthB] = b.date.split('/').map(Number);
      return (monthA * 31 + dayA) - (monthB * 31 + dayB);
    });
  };

  const processDataForNetIncome = (range: DateRange) => {
    const filteredTransactions = filterTransactionsByRange(transactions, range);
    const netIncomeByDay = filteredTransactions.reduce((acc: any, curr) => {
      const date = format(parseTransactionDate(curr.dataDoInput), 'dd/MM');
      const value = curr.nomeGrupo1 === 'Receita' ? curr.valorDoInput : -curr.valorDoInput;
      acc[date] = (acc[date] || 0) + value;
      return acc;
    }, {});

    return Object.entries(netIncomeByDay).map(([date, value]) => ({
      date,
      value
    })).sort((a, b) => {
      const [dayA, monthA] = a.date.split('/').map(Number);
      const [dayB, monthB] = b.date.split('/').map(Number);
      return (monthA * 31 + dayA) - (monthB * 31 + dayB);
    });
  };

  const RangeSelector = ({ value, onChange }: { value: DateRange, onChange: (range: DateRange) => void }) => (
    <div className="flex gap-2 mb-4">
      {(['1W', '1M', '1Y', 'ALL'] as DateRange[]).map((range) => (
        <button
          key={range}
          onClick={() => onChange(range)}
          className={`px-3 py-1 rounded text-sm ${
            value === range
              ? 'bg-blue-600 text-white'
              : isDarkMode 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {range}
        </button>
      ))}
    </div>
  );

  const totalExpenses = filterTransactionsByRange(transactions, expensesRange)
    .filter(t => t.nomeGrupo1 === 'Despesa')
    .reduce((acc, curr) => acc + curr.valorDoInput, 0);

  const totalRevenue = filterTransactionsByRange(transactions, revenueRange)
    .filter(t => t.nomeGrupo1 === 'Receita')
    .reduce((acc, curr) => acc + curr.valorDoInput, 0);

  const netIncome = filterTransactionsByRange(transactions, netIncomeRange)
    .reduce((acc, curr) => 
      curr.nomeGrupo1 === 'Receita' 
        ? acc + curr.valorDoInput 
        : acc - curr.valorDoInput
    , 0);

  const currentMonthTransactions = getCurrentMonthTransactions();
  const currentMonthNetIncome = currentMonthTransactions.reduce(
    (acc, curr) => curr.nomeGrupo1 === 'Receita' ? acc + curr.valorDoInput : acc - curr.valorDoInput,
    0
  );

  const group1Data = currentMonthTransactions.reduce((acc, curr) => {
    const type = curr.nomeGrupo1;
    acc[type] = (acc[type] || 0) + curr.valorDoInput;
    return acc;
  }, {} as Record<string, number>);

  const group1PieData = Object.entries(group1Data).map(([name, value]) => ({
    name,
    value
  }));

  const group2Data = currentMonthTransactions.reduce((acc, curr) => {
    const category = curr.nomeGrupo2;
    acc[category] = (acc[category] || 0) + curr.valorDoInput;
    return acc;
  }, {} as Record<string, number>);

  const group2PieData = Object.entries(group2Data).map(([name, value]) => ({
    name,
    value
  }));

  const CustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (!showNumbers) return null;
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill={isDarkMode ? 'white' : 'black'}
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const total = payload[0].name === 'Receita' ? totalRevenue : totalExpenses;
      return (
        <div className={`p-2 rounded shadow-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
          <p className="font-semibold">{data.name}</p>
          {showNumbers && (
            <p>
              {data.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              {' '}
              ({((data.value / total) * 100).toFixed(1)}%)
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    return (
      <ul className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry: any, index: number) => (
          <li key={`legend-${index}`} className="flex items-center">
            <span
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: entry.color }}
            />
            <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {entry.value}
            </span>
          </li>
        ))}
      </ul>
    );
  };

  const formatValue = (value: number) => {
    if (!showNumbers) return '***';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Despesas Dia a Dia
          </h3>
          <RangeSelector value={expensesRange} onChange={setExpensesRange} />
          <div className="text-2xl font-bold text-red-600 mb-4">
            {formatValue(totalExpenses)}
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={processDataForExpenses(expensesRange)}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
                <XAxis dataKey="date" stroke={isDarkMode ? '#9CA3AF' : '#4B5563'} />
                <YAxis stroke={isDarkMode ? '#9CA3AF' : '#4B5563'} tickFormatter={showNumbers ? undefined : () => '***'} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                    borderColor: isDarkMode ? '#374151' : '#E5E7EB',
                    color: isDarkMode ? '#FFFFFF' : '#000000'
                  }}
                  formatter={(value: any) => showNumbers ? value : '***'}
                />
                <Bar dataKey="value" fill="#FF0000" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Receita Geral
          </h3>
          <RangeSelector value={revenueRange} onChange={setRevenueRange} />
          <div className="text-2xl font-bold text-blue-600 mb-4">
            {formatValue(totalRevenue)}
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={processDataForRevenue(revenueRange)}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
                <XAxis dataKey="date" stroke={isDarkMode ? '#9CA3AF' : '#4B5563'} />
                <YAxis stroke={isDarkMode ? '#9CA3AF' : '#4B5563'} tickFormatter={showNumbers ? undefined : () => '***'} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                    borderColor: isDarkMode ? '#374151' : '#E5E7EB',
                    color: isDarkMode ? '#FFFFFF' : '#000000'
                  }}
                  formatter={(value: any) => showNumbers ? value : '***'}
                />
                <Bar dataKey="value" fill="#0000FF" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Receita Líquida
          </h3>
          <RangeSelector value={netIncomeRange} onChange={setNetIncomeRange} />
          <div className={`text-2xl font-bold mb-4 ${netIncome >= 0 ? (isDarkMode ? 'text-green-400' : 'text-green-600') : 'text-red-600'}`}>
            {formatValue(netIncome)}
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={processDataForNetIncome(netIncomeRange)}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
                <XAxis dataKey="date" stroke={isDarkMode ? '#9CA3AF' : '#4B5563'} />
                <YAxis stroke={isDarkMode ? '#9CA3AF' : '#4B5563'} tickFormatter={showNumbers ? undefined : () => '***'} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                    borderColor: isDarkMode ? '#374151' : '#E5E7EB',
                    color: isDarkMode ? '#FFFFFF' : '#000000'
                  }}
                  formatter={(value: any) => showNumbers ? value : '***'}
                />
                <Bar 
                  dataKey="value" 
                  fill={(data) => data.value >= 0 ? '#000000' : '#FF0000'}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Seu Saldo do Mês Atual
          </h3>
          <div className={`text-4xl font-bold ${
            currentMonthNetIncome >= 0 
              ? (isDarkMode ? 'text-green-400' : 'text-green-600') 
              : 'text-red-600'
          }`}>
            {formatValue(currentMonthNetIncome)}
          </div>
        </div>

        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Entradas e Saídas (mês atual)
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={group1PieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  labelLine={false}
                  label={CustomPieLabel}
                >
                  {group1PieData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.name === 'Receita' ? COLORS.revenue : COLORS.expense}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
                <Legend content={<CustomLegend />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Despesas e Receitas (mês atual)
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={group2PieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  labelLine={false}
                  label={CustomPieLabel}
                >
                  {group2PieData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[entry.name as keyof typeof COLORS] || `#${Math.floor(Math.random()*16777215).toString(16)}`}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
                <Legend content={<CustomLegend />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
export type TransactionType = 'Receita' | 'Despesa';

export type SubGroupReceita = 
  | 'Vendas de Produtos'
  | 'Frete Pago pelo Cliente'
  | 'Receitas Financeiras'
  | 'Outras Receitas';

export type SubGroupDespesa = 
  | 'Custos Diretos'
  | 'Compra de Mercadorias'
  | 'Embalagens e Insumos'
  | 'Frete e Logística'
  | 'Comissões dos Marketplaces'
  | 'Taxas de Pagamento'
  | 'Despesas Operacionais'
  | 'Plataformas e Ferramentas'
  | 'Marketing e Publicidade'
  | 'Impostos e Taxas'
  | 'Equipamentos e Manutenção';

export type SubGroup = SubGroupReceita | SubGroupDespesa;

export interface Transaction {
  id: string;
  idLogista: number;
  nomeLogista: string;
  nomeGrupo1: TransactionType;
  nomeGrupo2: SubGroup;
  nomeGrupo3?: string;
  dataDoInput: string;
  valorDoInput: number;
}

export const SUB_GROUPS: Record<TransactionType, string[]> = {
  'Receita': [
    'Vendas de Produtos',
    'Frete Pago pelo Cliente',
    'Receitas Financeiras',
    'Outras Receitas'
  ],
  'Despesa': [
    'Custos Diretos',
    'Compra de Mercadorias',
    'Embalagens e Insumos',
    'Frete e Logística',
    'Comissões dos Marketplaces',
    'Taxas de Pagamento',
    'Despesas Operacionais',
    'Plataformas e Ferramentas',
    'Marketing e Publicidade',
    'Impostos e Taxas',
    'Equipamentos e Manutenção'
  ]
};
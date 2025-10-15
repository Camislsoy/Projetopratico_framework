export interface Produto { id: string; nome: string; quantidade: number; }
export interface Movimentacao {
  id: string;
  idProduto: string;
  nomeProduto: string;
  tipo: 'entrada' | 'saida';
  quantidade: number;
  data: string;
}


// frontend/src/services/movimentacoes.ts
import { api } from './api';
import type { Movimentacao, Produto } from '../types';

// GET /api/movimentacoes
export async function listarMovimentacoes(): Promise<Movimentacao[]> {
  const res = await api.get<Movimentacao[]>('/movimentacoes');
  return res.data;
}

// POST /api/movimentacoes
export async function criarMovimentacao(
  idProduto: string,
  tipo: 'entrada' | 'saida',
  quantidade: number
): Promise<{ movimentacao: Movimentacao; produto: Produto }> {
  const res = await api.post<{ movimentacao: Movimentacao; produto: Produto }>(
    '/movimentacoes',
    { idProduto, tipo, quantidade }
  );
  return res.data;
}

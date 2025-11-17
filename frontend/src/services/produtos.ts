import { api } from './api';
import type { Produto } from '../types';

// GET /api/produtos
export async function listarProdutos(): Promise<Produto[]> {
  const res = await api.get('/produtos');
  return res.data;
}

// POST /api/produtos
export async function criarProduto(nome: string, quantidadeInicial: number) {
  const res = await api.post('/produtos', {
    nome,
    quantidadeInicial,
  });
  return res.data;
}

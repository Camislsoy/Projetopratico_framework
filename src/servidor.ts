import express from 'express';
import cors from 'cors';

interface Produto { id: string; nome: string; quantidade: number; }
interface Movimentacao { id: string; idProduto: string; nomeProduto: string; tipo: 'entrada'|'saida'; quantidade: number; data: string; }

const produtos: Produto[] = [];
const movimentacoes: Movimentacao[] = [];

const app = express();
app.use(cors());
app.use(express.json());

const PORTA = 4000;
const agora = () => new Date().toLocaleString();
const novoId = () => Math.random().toString(36).slice(2, 9);

// saúde
app.get('/api/saude', (_req, res) => res.json({ ok: true }));

// LISTAR produtos
app.get('/api/produtos', (_req, res) => res.json(produtos));

// CRIAR produto
app.post('/api/produtos', (req, res) => {
  const nome: string = String(req.body?.nome || '').trim();
  const quantidadeInicial: number = Number(req.body?.quantidadeInicial || 0);
  if (!nome) return res.status(400).json({ mensagem: 'Informe o nome do produto.' });
  if (quantidadeInicial < 0) return res.status(400).json({ mensagem: 'Quantidade inicial inválida.' });

  const novo: Produto = { id: novoId(), nome, quantidade: quantidadeInicial };
  produtos.push(novo);
  return res.status(201).json(novo);
});

// LISTAR movimentações (mais recentes primeiro)
app.get('/api/movimentacoes', (_req, res) => res.json(movimentacoes.slice().reverse()));

// CRIAR movimentação
app.post('/api/movimentacoes', (req, res) => {
  const idProduto: string = String(req.body?.idProduto || '');
  const tipo = String(req.body?.tipo);
  const quantidade = Number(req.body?.quantidade || 0);

  const produto = produtos.find(p => p.id === idProduto);
  if (!produto) return res.status(404).json({ mensagem: 'Produto não encontrado.' });
  if (!['entrada','saida'].includes(tipo)) return res.status(400).json({ mensagem: 'Tipo inválido.' });
  if (quantidade <= 0) return res.status(400).json({ mensagem: 'Quantidade deve ser maior que zero.' });
  if (tipo === 'saida' && produto.quantidade < quantidade) return res.status(400).json({ mensagem: 'Estoque insuficiente para saída.' });

  if (tipo === 'entrada') produto.quantidade += quantidade;
  else produto.quantidade -= quantidade;

  const mov: Movimentacao = { id: novoId(), idProduto: produto.id, nomeProduto: produto.nome, tipo: tipo as any, quantidade, data: agora() };
  movimentacoes.push(mov);

  return res.status(201).json({ movimentacao: mov, produto });
});

app.listen(PORTA, () => console.log(`API rodando em http://localhost:${PORTA}`));

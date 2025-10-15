import express from 'express';
import cors from 'cors';
import { conectarBanco } from './db';
import { ProdutoModel } from './models/Produtos';
import { MovimentacaoModel} from './models/Movimentacao';

// utilidades
const agora = () => new Date().toLocaleString();

const app = express();
app.use(cors());
app.use(express.json());

// saúde
app.get('/api/saude', (_req, res) => res.json({ ok: true }));

// listar produtos
app.get('/api/produtos', async (_req, res) => {
  const produtos = await ProdutoModel.find().sort({ createdAt: -1 }).lean();
  // normaliza _id -> id para o front
  res.json(produtos.map(p => ({ id: String(p._id), nome: p.nome, quantidade: p.quantidade })));
});

// criar produto
app.post('/api/produtos', async (req, res) => {
  const nome: string = String(req.body?.nome || '').trim();
  const quantidadeInicial: number = Number(req.body?.quantidadeInicial || 0);
  if (!nome) return res.status(400).json({ mensagem: 'Informe o nome do produto.' });
  if (quantidadeInicial < 0) return res.status(400).json({ mensagem: 'Quantidade inicial inválida.' });

  const novo = await ProdutoModel.create({ nome, quantidade: quantidadeInicial });
  return res.status(201).json({ id: String(novo._id), nome: novo.nome, quantidade: novo.quantidade });
});

// listar movimentações (mais recentes primeiro)
app.get('/api/movimentacoes', async (_req, res) => {
  const movs = await MovimentacaoModel.find().sort({ _id: -1 }).limit(200).lean();
  res.json(movs.map(m => ({
    id: String(m._id),
    idProduto: String(m.idProduto),
    nomeProduto: m.nomeProduto,
    tipo: m.tipo,
    quantidade: m.quantidade,
    data: m.data,
  })));
});

// criar movimentação (atualiza saldo de forma atômica)
app.post('/api/movimentacoes', async (req, res) => {
  const idProduto = String(req.body?.idProduto || '');
  const tipo = String(req.body?.tipo);
  const quantidade = Number(req.body?.quantidade || 0);

  if (!['entrada', 'saida'].includes(tipo)) return res.status(400).json({ mensagem: 'Tipo inválido.' });
  if (quantidade <= 0) return res.status(400).json({ mensagem: 'Quantidade deve ser maior que zero.' });

  // para saída, garante estoque suficiente no filtro
  const inc = tipo === 'entrada' ? quantidade : -quantidade;
  const filtro: any = { _id: idProduto };
  if (tipo === 'saida') filtro.quantidade = { $gte: quantidade };

  const produtoAtualizado = await ProdutoModel.findOneAndUpdate(
    filtro,
    { $inc: { quantidade: inc } },
    { new: true } // retorna o documento já atualizado
  );

  if (!produtoAtualizado) {
    // ou produto inexistente ou estoque insuficiente
    const existe = await ProdutoModel.exists({ _id: idProduto });
    return res.status(existe ? 400 : 404).json({
      mensagem: existe ? 'Estoque insuficiente para saída.' : 'Produto não encontrado.'
    });
  }

  const mov = await MovimentacaoModel.create({
    idProduto,
    nomeProduto: produtoAtualizado.nome,
    tipo,
    quantidade,
    data: agora(),
  });

  return res.status(201).json({
    movimentacao: {
      id: String(mov._id),
      idProduto: String(mov.idProduto),
      nomeProduto: mov.nomeProduto,
      tipo: mov.tipo,
      quantidade: mov.quantidade,
      data: mov.data,
    },
    produto: { id: String(produtoAtualizado._id), nome: produtoAtualizado.nome, quantidade: produtoAtualizado.quantidade }
  });
});

// start
const PORTA = Number(process.env.PORTA || 4000);
conectarBanco()
  .then(() => app.listen(PORTA, () => console.log(`API rodando em http://localhost:${PORTA}`)))
  .catch((e) => {
    console.error('✗ Falha ao conectar no MongoDB', e);
    process.exit(1);
  });

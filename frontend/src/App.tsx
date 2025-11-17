// frontend/src/App.tsx
import { useEffect, useMemo, useState } from 'react';
import './App.scss';

import type { Produto, Movimentacao } from './types';
import { listarProdutos, criarProduto } from './services/produtos';
import { listarMovimentacoes, criarMovimentacao } from './services/movimentacoes';

type TipoMov = 'entrada' | 'saida';

export default function App() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [movs, setMovs] = useState<Movimentacao[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [nome, setNome] = useState('');
  const [quantidadeInicial, setQuantidadeInicial] = useState<number>(0);

  const [idProduto, setIdProduto] = useState('');
  const [tipo, setTipo] = useState<TipoMov>('entrada');
  const [quantidade, setQuantidade] = useState<number>(1);

  const [busca, setBusca] = useState('');

  const produtosFiltrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return q
      ? produtos.filter((p) => p.nome.toLowerCase().includes(q))
      : produtos;
  }, [produtos, busca]);

  async function carregarTudo() {
    try {
      setCarregando(true);
      setErro(null);

      const [pRes, mRes] = await Promise.all([
        listarProdutos(),
        listarMovimentacoes(),
      ]);

      setProdutos(pRes);
      setMovs(mRes);
    } catch (e: any) {
      setErro(e?.message || 'Falha ao carregar');
    } finally {
      setCarregando(false);
    }
  }

  async function handleCadastrarProduto() {
    if (!nome.trim()) return alert('Informe o nome do produto');

    try {
      setCarregando(true);
      const novo = await criarProduto(nome.trim(), Number(quantidadeInicial) || 0);

      setProdutos((prev) => [novo, ...prev]);
      setNome('');
      setQuantidadeInicial(0);
    } catch (e: any) {
      alert(e?.response?.data?.mensagem || 'Erro ao cadastrar');
    } finally {
      setCarregando(false);
    }
  }

  async function handleRegistrarMov() {
    if (!idProduto || !quantidade || quantidade <= 0) {
      return alert('Selecione produto e quantidade válida');
    }

    try {
      setCarregando(true);
      const { movimentacao, produto } = await criarMovimentacao(
        idProduto,
        tipo,
        Number(quantidade)
      );

      setMovs((prev) => [movimentacao, ...prev]);
      setProdutos((prev) =>
        prev.map((p) => (p.id === produto.id ? produto : p))
      );
      setQuantidade(1);
    } catch (e: any) {
      alert(e?.response?.data?.mensagem || 'Erro na movimentação');
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarTudo();
  }, []);

  return (
    <div className="container">
      <h1>Controle de Estoque</h1>

      <div className="card">
        <div className="header">
          <h2>Produtos</h2>
          <input
            className="input search"
            placeholder="Buscar produto"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <div className="grid grid-3" style={{ marginBottom: 8 }}>
          <input
            className="input"
            placeholder="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
          <input
            className="input"
            type="number"
            min={0}
            placeholder="Quantidade inicial"
            value={quantidadeInicial}
            onChange={(e) => setQuantidadeInicial(Number(e.target.value))}
          />
          <button
            className="btn"
            onClick={handleCadastrarProduto}
            disabled={carregando}
          >
            Cadastrar
          </button>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Nome</th>
              <th style={{ textAlign: 'right' }}>Quantidade</th>
            </tr>
          </thead>
          <tbody>
            {produtosFiltrados.map((p) => (
              <tr key={p.id}>
                <td>{p.nome}</td>
                <td style={{ textAlign: 'right' }}>{p.quantidade}</td>
              </tr>
            ))}
            {produtosFiltrados.length === 0 && (
              <tr>
                <td colSpan={2}>Nenhum produto</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h2>Movimentar Estoque</h2>
        <div className="grid grid-4">
          <select
            className="input"
            value={idProduto}
            onChange={(e) => setIdProduto(e.target.value)}
          >
            <option value="">Selecione o produto</option>
            {produtos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>

          <select
            className="input"
            value={tipo}
            onChange={(e) => setTipo(e.target.value as TipoMov)}
          >
            <option value="entrada">ENTRADA</option>
            <option value="saida">SAÍDA</option>
          </select>

          <input
            className="input"
            type="number"
            min={1}
            value={quantidade}
            onChange={(e) => setQuantidade(Number(e.target.value))}
          />

          <button
            className="btn"
            onClick={handleRegistrarMov}
            disabled={carregando || !idProduto}
          >
            Registrar
          </button>
        </div>
      </div>

      <div className="card">
        <h2>Histórico</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Produto</th>
              <th>Tipo</th>
              <th>Quantidade</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            {movs.map((m) => (
              <tr key={m.id}>
                <td>{m.nomeProduto}</td>
                <td className={`status ${m.tipo}`}>
                  {m.tipo.toUpperCase()}
                </td>
                <td>{m.quantidade}</td>
                <td>{m.data}</td>
              </tr>
            ))}
            {movs.length === 0 && (
              <tr>
                <td colSpan={4}>Sem movimentações ainda</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {erro && <p style={{ color: 'crimson' }}>{erro}</p>}
    </div>
  );
}

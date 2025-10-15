
const produtos = []; 
const historico = []; 


const $ = (id) => document.getElementById(id);
const agora = () => new Date().toLocaleString();
const novoId = () => Math.random().toString(36).slice(2, 9);

function atualizarSelectProdutos() {
  const select = $('produtoSelecionado');
  select.innerHTML = '<option value="">Selecione um produto</option>';
  produtos.forEach((p, i) => {
    const opt = document.createElement('option');
    opt.value = String(i);
    opt.textContent = `${p.nome}`;
    select.appendChild(opt);
  });
}

function renderizarEstoque() {
  const corpo = $('tabelaEstoque').querySelector('tbody');
  corpo.innerHTML = '';
  produtos.forEach((p) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${p.nome}</td><td>${p.quantidade}</td>`;
    corpo.appendChild(tr);
  });
}

function renderizarHistorico() {
  const corpo = $('tabelaHistorico').querySelector('tbody');
  corpo.innerHTML = '';
  historico.forEach((h) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${h.produto}</td>
      <td class="${h.tipo}">${h.tipo.toUpperCase()}</td>
      <td>${h.quantidade}</td>
      <td>${h.data}</td>
    `;
    corpo.appendChild(tr);
  });
}

function atualizarTela() {
  atualizarSelectProdutos();
  renderizarEstoque();
  renderizarHistorico();
}


function cadastrarProduto() {
  const nome = $('nomeProduto').value.trim();
  const quantidadeInicial = parseInt($('quantidadeInicial').value) || 0;
  if (!nome) { alert('Informe o nome do produto.'); return; }

  produtos.push({ id: novoId(), nome, quantidade: quantidadeInicial });
  $('nomeProduto').value = '';
  $('quantidadeInicial').value = '';
  atualizarTela();
}

function registrarMovimentacao() {
  const indice = $('produtoSelecionado').value;
  const tipo = $('tipoMovimentacao').value; // entrada | saida
  const quantidade = parseInt($('quantidadeMov').value) || 0;

  if (indice === '' || quantidade <= 0) { alert('Selecione um produto e informe uma quantidade válida.'); return; }

  const produto = produtos[Number(indice)];
  if (!produto) { alert('Produto não encontrado.'); return; }

  if (tipo === 'saida' && produto.quantidade < quantidade) {
    alert('Estoque insuficiente para saída.');
    return;
  }

  produto.quantidade += (tipo === 'entrada' ? quantidade : -quantidade);
  historico.push({ produto: produto.nome, tipo, quantidade, data: agora() });

  $('quantidadeMov').value = '';
  atualizarTela();
}


window.addEventListener('DOMContentLoaded', () => {
  $('btnCadastrar').addEventListener('click', cadastrarProduto);
  $('btnMovimentar').addEventListener('click', registrarMovimentacao);
  atualizarTela();
});
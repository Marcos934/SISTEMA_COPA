import { config } from './config.js'; // Importa a configuração do arquivo config.js
import './comprar.js'; // Importa o novo arquivo

document.addEventListener('DOMContentLoaded', async function () {
    const cpf = localStorage.getItem('cpfUsuario');

    if (!cpf) {
        alert('Você precisa estar logado como usuário para acessar esta página.');
        window.location.href = 'login.html'; // Redireciona para a página de login se o CPF não estiver disponível
        return;
    }

    try {
        const response = await fetch(`${config.baseURL}listar_produtos.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ cpf: cpf })
        });

        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        const data = await response.json();
        console.log('Resposta da API:', data); // Log para verificar a resposta

        if (data.success) {
            listarProdutos(data.produtos);
        } else {
            alert('Erro ao listar produtos: ' + data.message);
        }

    } catch (error) {
        console.error('Erro durante a requisição:', error);
        alert('Ocorreu um erro ao tentar listar os produtos.');
    }
});

// Variável global para armazenar produtos
let produtosGlobais = [];

// Função para listar produtos
function listarProdutos(produtos) {
    produtosGlobais = produtos; // Armazena produtos globalmente
    exibirProdutos(produtos); // Exibe todos os produtos inicialmente
}

// Função para exibir produtos na interface
function exibirProdutos(produtos) {
    const produtosList = document.getElementById('produtosList');
    produtosList.innerHTML = ''; // Limpa a lista antes de exibir

    produtos.forEach(produto => {
        const imgUrl = produto.url_img ? produto.url_img : 'https://via.placeholder.com/100'; // Placeholder se a URL não estiver disponível

        const produtoCard = `
            <div class="col">
                <div class="card">
                    <img src="${imgUrl}" class="card-img-top" alt="${produto.nome}">
                    <div class="card-body">
                        <h5 class="card-title text-center">${produto.nome}</h5>
                        <p class="card-text" style="margin-bottom: 0;">Tipo: ${produto.tipo}</p>
                        <p class="card-text" style="margin-bottom: 0;">Preço: R$ ${produto.preco}</p>
                        <p class="card-text" style="margin-bottom: 0;">Disponível: ${produto.qntd}</p>
                        <p class="card-text" style="margin-bottom: 0;">Informação: ${produto.informacao || 'N/A'}</p>
                        <button class="btn btn-warning w-100" onmouseover="this.querySelector('#iconCanecaVazia').style.display='none'; this.querySelector('#iconCanecaCheia').style.display='inline';" onmouseout="this.querySelector('#iconCanecaVazia').style.display='inline'; this.querySelector('#iconCanecaCheia').style.display='none';" onclick="abrirModal('${produto.nome}', '${imgUrl}', '${produto.tipo}', ${produto.preco}, ${produto.qntd}, '${produto.informacao}', ${produto.id_produto})">
                            <i class="bi bi-cup" id="iconCanecaVazia"></i>
                            <i class="bi bi-cup-fill" id="iconCanecaCheia" style="display: none;"></i>
                            Consumir
                        </button>
                    </div>
                </div>
            </div>
        `;

        produtosList.innerHTML += produtoCard; // Adiciona o cartão do produto à lista
    });
}

// Função para abrir o modal e preencher os dados
window.abrirModal = function (nome, imagem, tipo, preco, qntd, informacao, idProduto) {
    document.getElementById('modalNome').textContent = nome;
    document.getElementById('modalImagem').src = imagem;
    document.getElementById('modalImagem').setAttribute('data-id', idProduto); // Armazena o ID do produto na imagem
    document.getElementById('modalTipo').textContent = `Tipo: ${tipo}`;
    document.getElementById('modalPreco').textContent = `Preço: R$ ${preco.toFixed(2)}`;
    document.getElementById('modalQuantidade').textContent = `Disponível: ${qntd}`;
    document.getElementById('modalInformacao').textContent = informacao;

    const quantidadeInput = document.getElementById('quantidadeInput');
    quantidadeInput.value = 1; // Resetar a quantidade para 1

    // Atualizar o total inicial
    atualizarTotal(preco);

    const modal = new bootstrap.Modal(document.getElementById('produtoModal'));
    modal.show();
}

// Função para atualizar o total
function atualizarTotal(preco) {
    const quantidadeInput = document.getElementById('quantidadeInput');
    const totalValue = document.getElementById('totalValue');
    const quantidadeSelecionada = parseInt(quantidadeInput.value);

    totalValue.textContent = `Total: R$ ${(preco * quantidadeSelecionada).toFixed(2)}`;
}

// Funções para incrementar e decrementar a quantidade
document.getElementById('btnIncrease').addEventListener('click', function () {
    const quantidadeInput = document.getElementById('quantidadeInput');
    const maxQuantidade = parseInt(document.getElementById('modalQuantidade').textContent.split(': ')[1]);

    if (parseInt(quantidadeInput.value) < maxQuantidade) {
        quantidadeInput.value = parseInt(quantidadeInput.value) + 1;
        atualizarTotal(parseFloat(document.getElementById('modalPreco').textContent.split('R$ ')[1]));
    }
});

document.getElementById('btnDecrease').addEventListener('click', function () {
    const quantidadeInput = document.getElementById('quantidadeInput');

    if (parseInt(quantidadeInput.value) > 1) {
        quantidadeInput.value = parseInt(quantidadeInput.value) - 1;
        atualizarTotal(parseFloat(document.getElementById('modalPreco').textContent.split('R$ ')[1]));
    }
});

// Adiciona evento para atualizar total ao alterar quantidade manualmente
document.getElementById('quantidadeInput').addEventListener('input', function () {
    const quantidadeInput = document.getElementById('quantidadeInput');
    const preco = parseFloat(document.getElementById('modalPreco').textContent.split('R$ ')[1]);

    if (quantidadeInput.value < 1) {
        quantidadeInput.value = 1; // Limita a quantidade mínima a 1
    }

    // Se a quantidade for maior que a quantidade disponível, redefine para o máximo
    const maxQuantidade = parseInt(document.getElementById('modalQuantidade').textContent.split(': ')[1]);
    if (quantidadeInput.value > maxQuantidade) {
        quantidadeInput.value = maxQuantidade; // Limita a quantidade máxima à disponível
    }

    const totalValue = document.getElementById('totalValue');
    totalValue.textContent = `Total: R$ ${(preco * quantidadeInput.value).toFixed(2)}`;
});

// Filtro para os produtos
document.getElementById('searchInput').addEventListener('input', function () {
    const searchValue = this.value.toLowerCase();
    const tipoValue = document.getElementById('tipoSelect').value;

    const produtosFiltrados = produtosGlobais.filter(produto => {
        const matchNome = produto.nome.toLowerCase().includes(searchValue);
        const matchTipo = tipoValue ? produto.tipo === tipoValue : true; // Verifica se o tipo foi selecionado

        return matchNome && matchTipo;
    });

    exibirProdutos(produtosFiltrados); // Atualiza a lista exibida com os produtos filtrados
});

document.getElementById('tipoSelect').addEventListener('change', function () {
    const tipoValue = this.value;
    const searchValue = document.getElementById('searchInput').value.toLowerCase();

    const produtosFiltrados = produtosGlobais.filter(produto => {
        const matchNome = produto.nome.toLowerCase().includes(searchValue);
        const matchTipo = tipoValue ? produto.tipo === tipoValue : true; // Verifica se o tipo foi selecionado

        return matchNome && matchTipo;
    });

    exibirProdutos(produtosFiltrados); // Atualiza a lista exibida com os produtos filtrados
});

import { config } from './config.js'; // Importa a configuração do arquivo config.js

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
                    </div>
                </div>
            </div>
        `;
        
        produtosList.innerHTML += produtoCard; // Adiciona o cartão do produto à lista
    });
}

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

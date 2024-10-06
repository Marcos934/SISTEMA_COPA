import { config } from './config.js'; // Importa a configuração do arquivo config.js

document.addEventListener('DOMContentLoaded', async function () {
    const cpf = localStorage.getItem('cpfUsuario');

    if (!cpf) {
        alert('Você precisa estar logado como usuário para acessar esta página.');
        window.location.href = 'login.html'; // Redireciona para a página de login se o CPF não estiver disponível
        return;
    }

    // Carrega as compras ao inicializar
    await carregarCompras();

    async function carregarCompras(data_inicial = '', data_final = '') {
        try {
            const body = { cpf: cpf };

            if (data_inicial && data_final) {
                body.data_inicial = data_inicial;
                body.data_final = data_final;
            }

            const response = await fetch(`${config.baseURL}listar_compras_usuario.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            const data = await response.json();
            console.log('Resposta da API:', data); // Log para verificar a resposta

            if (data.success) {
                listarCompras(data.compras); // Lista as compras inicialmente
            } else {
                alert('Erro ao listar compras: ' + data.message);
            }

        } catch (error) {
            console.error('Erro durante a requisição:', error);
            alert('Ocorreu um erro ao tentar listar as compras.');
        }
    }

    // Função para listar compras
    function listarCompras(compras) {
        const historicoListPendentes = document.getElementById('historicoListPendentes');
        const historicoListPagas = document.getElementById('historicoListPagas');
        
        historicoListPendentes.innerHTML = ''; // Limpa a lista de pendentes antes de exibir
        historicoListPagas.innerHTML = ''; // Limpa a lista de pagas antes de exibir

        compras.forEach(compra => {
            const compraCard = `
                <div class="col">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">${compra.nome_produto}</h5>
                            <p class="card-text">Quantidade: ${compra.quantidade}</p>
                            <p class="card-text">Total: R$ ${compra.total}</p>
                            <p class="card-text">Data: ${new Date(compra.data).toLocaleString()}</p>
                            <p class="card-text">Status: ${compra.pgto}</p>
                        </div>
                    </div>
                </div>
            `;

            if (compra.pgto === 'pendente') {
                historicoListPendentes.innerHTML += compraCard; // Adiciona à lista de pendentes
            } else {
                historicoListPagas.innerHTML += compraCard; // Adiciona à lista de pagas
            }
        });
    }

    // Filtros de data
    const dataInicialInput = document.getElementById('dataInicial');
    const dataFinalInput = document.getElementById('dataFinal');

    dataInicialInput.addEventListener('change', () => {
        const dataInicial = dataInicialInput.value;
        const dataFinal = dataFinalInput.value;
        carregarCompras(dataInicial, dataFinal);
    });

    dataFinalInput.addEventListener('change', () => {
        const dataInicial = dataInicialInput.value;
        const dataFinal = dataFinalInput.value;
        carregarCompras(dataInicial, dataFinal);
    });

    // Campo de busca
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', function () {
        const searchValue = this.value.toLowerCase();
        const comprasPendentes = Array.from(document.querySelectorAll('#historicoListPendentes .card'));
        const comprasPagas = Array.from(document.querySelectorAll('#historicoListPagas .card'));

        comprasPendentes.forEach(compraCard => {
            const cardTitle = compraCard.querySelector('.card-title').textContent.toLowerCase();
            compraCard.style.display = cardTitle.includes(searchValue) ? 'block' : 'none';
        });

        comprasPagas.forEach(compraCard => {
            const cardTitle = compraCard.querySelector('.card-title').textContent.toLowerCase();
            compraCard.style.display = cardTitle.includes(searchValue) ? 'block' : 'none';
        });
    });
});

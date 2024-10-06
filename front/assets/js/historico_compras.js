import { config } from './config.js'; // Importa a configuração do arquivo config.js

document.addEventListener('DOMContentLoaded', async function () {
    const cpf = localStorage.getItem('cpfUsuario');

    if (!cpf) {
        alert('Você precisa estar logado como usuário para acessar esta página.');
        window.location.href = 'login.html'; // Redireciona para a página de login se o CPF não estiver disponível
        return;
    }

    // Carrega as compras ao inicializar
    const todasCompras = await carregarCompras(); // Carrega todas as compras inicialmente
    calcularTotalPendente(todasCompras); // Calcula o total pendente ao iniciar

    async function carregarCompras(pgto = '', data_inicial = '', data_final = '') {
        try {
            const body = { cpf: cpf };

            if (pgto) {
                body.pgto = pgto; // Define o status de pagamento se fornecido
            }

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
                return data.compras; // Retorna as compras para cálculo de total pendente
            } else {
                alert('Erro ao listar compras: ' + data.message);
            }

        } catch (error) {
            console.error('Erro durante a requisição:', error);
            alert('Ocorreu um erro ao tentar listar as compras.');
        }
    }

    // Função para calcular o total pendente
    function calcularTotalPendente(compras) {
        const totalPendente = compras.reduce((total, compra) => {
            return compra.pgto === 'pendente' ? total + parseFloat(compra.total) : total;
        }, 0);
        
        // Atualiza o total pendente no elemento correspondente
        const totalPendenteElement = document.getElementById('totalPendente');
        totalPendenteElement.textContent = `Total pendente para pagamento: R$ ${totalPendente.toFixed(2)}`;
        
        // Muda a cor do alert com base no valor
        const totalPendenteContainer = document.getElementById('totalPendenteContainer');
        totalPendenteContainer.className = totalPendente > 0 ? 'alert alert-danger' : 'alert alert-info';
    }

    // Função para listar compras
    function listarCompras(compras) {
        const historicoListPendentes = document.getElementById('historicoListPendentes');
        const historicoListPagas = document.getElementById('historicoListPagas');
        
        // Limpa as listas antes de exibir
        historicoListPendentes.innerHTML = '';
        historicoListPagas.innerHTML = '';

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

        // Verifica se a data final é anterior à data inicial
        if (dataFinal && new Date(dataFinal) < new Date(dataInicial)) {
            alert('Data final não pode ser anterior à data inicial. Ambas as datas foram ajustadas.');
            dataFinalInput.value = dataInicial; // Ajusta a data final para ser a mesma que a inicial
        }
        carregarCompras(document.querySelector('.nav-link.active').id.split('-')[0], dataInicial, dataFinal);
    });

    dataFinalInput.addEventListener('change', () => {
        const dataInicial = dataInicialInput.value;
        const dataFinal = dataFinalInput.value;

        // Verifica se a data final é anterior à data inicial
        if (dataInicial && new Date(dataFinal) < new Date(dataInicial)) {
            alert('Data final não pode ser anterior à data inicial. Ambas as datas foram ajustadas.');
            dataFinalInput.value = dataInicial; // Ajusta a data final para ser a mesma que a inicial
        }
        carregarCompras(document.querySelector('.nav-link.active').id.split('-')[0], dataInicial, dataFinal);
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

    // Eventos para trocar entre as abas
    const tabLinks = document.querySelectorAll('.nav-link');
    tabLinks.forEach(link => {
        link.addEventListener('click', () => {
            const pgto = link.id.split('-')[0]; // 'pendente' ou 'pago'
            carregarCompras(pgto); // Carrega compras de acordo com a aba ativa
        });
    });
});

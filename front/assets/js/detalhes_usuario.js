import { config } from './config.js'; // Importa a configuração do arquivo config.js

document.addEventListener('DOMContentLoaded', async function () {
    const admin_cpf = localStorage.getItem('cpfUsuario'); // Obtém o CPF do administrador do localStorage
    const cpf_usuario = new URLSearchParams(window.location.search).get('cpf_usuario'); // Obtém o CPF do usuário a ser consultado

    if (!admin_cpf) {
        alert('Você precisa estar logado como administrador para acessar esta página.');
        window.location.href = 'login.html'; // Redireciona para a página de login se o CPF não estiver disponível
        return;
    }

    if (!cpf_usuario) {
        alert('Nenhum usuário foi selecionado.');
        window.location.href = 'relatorio.html'; // Redireciona de volta ao relatório se o CPF do usuário não estiver disponível
        return;
    }

    try {
        const response = await fetch(`${config.baseURL}relatorio_pendencia.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                admin_cpf: admin_cpf,  // CPF do administrador ativo
                cpf_usuario: cpf_usuario // CPF do usuário a ser consultado
            })
        });

        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        const data = await response.json();
        console.log('Resposta da API:', data); // Log para verificar a resposta

        if (data.success) {
            listarDetalhes(data.relatorio);
        } else {
            alert('Erro ao listar detalhes do usuário: ' + data.message);
        }

    } catch (error) {
        console.error('Erro durante a requisição:', error);
        alert('Ocorreu um erro ao tentar listar os detalhes do usuário.');
    }
});

// Função para listar detalhes do usuário
function listarDetalhes(relatorio) {
    const totalDevidoElement = document.getElementById('totalDevido');
    const historicoListPendentes = document.getElementById('historicoListPendentes');
    const historicoListPagas = document.getElementById('historicoListPagas');

    let totalDevido = 0;

    // Limpa as listas antes de exibir
    historicoListPendentes.innerHTML = '';
    historicoListPagas.innerHTML = '';

    relatorio.forEach(item => {
        if (item.pgto === 'pendente') {
            totalDevido += parseFloat(item.total);
            const compraCard = `
                <div class="col">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">${item.nome_produto}</h5>
                            <p class="card-text">Quantidade: ${item.quantidade}</p>
                            <p class="card-text">Total: R$ ${item.total}</p>
                            <p class="card-text">Data: ${new Date(item.data).toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            `;
            historicoListPendentes.innerHTML += compraCard; // Adiciona à lista de pendentes
        } else if (item.pgto === 'pago') {
            const compraCard = `
                <div class="col">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">${item.nome_produto}</h5>
                            <p class="card-text">Quantidade: ${item.quantidade}</p>
                            <p class="card-text">Total: R$ ${item.total}</p>
                            <p class="card-text">Data: ${new Date(item.data).toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            `;
            historicoListPagas.innerHTML += compraCard; // Adiciona à lista de pagas
        }
    });

    totalDevidoElement.textContent = totalDevido.toFixed(2); // Atualiza o total devido
}

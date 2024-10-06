import { config } from './config.js'; // Importa a configuração do arquivo config.js

document.addEventListener('DOMContentLoaded', async function () {
    const cpf = localStorage.getItem('cpfUsuario');

    if (!cpf) {
        alert('Você precisa estar logado como usuário para acessar esta página.');
        window.location.href = 'login.html'; // Redireciona para a página de login se o CPF não estiver disponível
        return;
    }

    try {
        const response = await fetch(`${config.baseURL}listar_compras_usuario.php`, {
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
            listarCompras(data.compras);
        } else {
            alert('Erro ao listar compras: ' + data.message);
        }

    } catch (error) {
        console.error('Erro durante a requisição:', error);
        alert('Ocorreu um erro ao tentar listar as compras.');
    }
});

// Função para listar compras
function listarCompras(compras) {
    const historicoList = document.getElementById('historicoList');
    historicoList.innerHTML = ''; // Limpa a lista antes de exibir

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

        historicoList.innerHTML += compraCard; // Adiciona o cartão da compra à lista
    });
}

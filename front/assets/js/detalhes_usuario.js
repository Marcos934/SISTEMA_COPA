import { config } from './config.js'; // Importa a configuração do arquivo config.js

document.addEventListener('DOMContentLoaded', async function () {
    const cpf_usuario = new URLSearchParams(window.location.search).get('cpf_usuario');
    const admin_cpf = localStorage.getItem('cpfUsuario');

    if (!admin_cpf) {
        alert('Você precisa estar logado como administrador para acessar esta página.');
        window.location.href = 'login.html'; // Redireciona para a página de login se o CPF não estiver disponível
        return;
    }

    try {
        const response = await fetch(`${config.baseURL}relatorio_pendencia.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ admin_cpf: admin_cpf, cpf_usuario: cpf_usuario })
        });

        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        const data = await response.json();
        console.log('Resposta da API:', data); // Log para verificar a resposta

        if (data.success) {
            listarProdutos(data.relatorio);
        } else {
            alert('Erro ao listar produtos: ' + data.message);
        }

    } catch (error) {
        console.error('Erro durante a requisição:', error);
        alert('Ocorreu um erro ao tentar listar os produtos.');
    }
});

// Função para listar produtos
function listarProdutos(produtos) {
    const produtosListPendentes = document.getElementById('produtosListPendentes');
    const produtosListPagos = document.getElementById('produtosListPagos');
    
    produtosListPendentes.innerHTML = ''; // Limpa a lista de pendentes antes de exibir
    produtosListPagos.innerHTML = ''; // Limpa a lista de pagos antes de exibir

    let totalDevido = 0; // Inicializa a variável para calcular o total devido

    produtos.forEach(produto => {
        const produtoItem = `
            <tr>
                <td><input type="checkbox" class="form-check-input" value="${produto.id_compra}"></td>
                <td>${produto.id_compra}</td>
                <td>${produto.nome_produto}</td>
                <td>${produto.quantidade}</td>
                <td>${new Date(produto.data).toLocaleString()}</td>
                <td>R$ ${produto.total}</td>
            </tr>
        `;

        if (produto.pgto === 'pendente') {
            produtosListPendentes.innerHTML += produtoItem; // Adiciona o item à lista de pendentes
            totalDevido += parseFloat(produto.total); // Soma o total devido
        } else if (produto.pgto === 'pago') {
            produtosListPagos.innerHTML += produtoItem; // Adiciona o item à lista de pagos
        }
    });

    // Atualiza o total devido na página
    document.getElementById('totalDevido').textContent = totalDevido.toFixed(2);
}

// Botão para selecionar/desmarcar todos os checkboxes
document.getElementById('selecionarTudoBtn').addEventListener('click', function () {
    const checkboxes = document.querySelectorAll('#produtosListPendentes input[type="checkbox"]');
    const allChecked = Array.from(checkboxes).every(checkbox => checkbox.checked);

    checkboxes.forEach(checkbox => {
        checkbox.checked = !allChecked; // Se todos estiverem selecionados, desmarcar; caso contrário, marcar
    });
});

// Botão para alterar status para Pago
document.getElementById('alterarStatusBtn').addEventListener('click', async function () {
    const checkboxes = document.querySelectorAll('#produtosListPendentes input[type="checkbox"]:checked');
    const idsSelecionados = Array.from(checkboxes).map(checkbox => checkbox.value);

    if (idsSelecionados.length === 0) {
        alert('Selecione pelo menos um produto para alterar o status.');
        return;
    }

    const admin_cpf = localStorage.getItem('cpfUsuario');

    try {
        const response = await fetch(`${config.baseURL}alterar_status_pgto.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                admin_cpf: admin_cpf,
                id_compras: idsSelecionados,
                cpf_comprador: new URLSearchParams(window.location.search).get('cpf_usuario'),
                pgto: 'pago'
            })
        });

        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        const data = await response.json();
        console.log('Resposta da API:', data); // Log para verificar a resposta

        if (data.success) {
            alert('Status alterado para pago com sucesso!');
            // Atualizar a lista de produtos após a alteração de status
            listarProdutos(await fetchProdutos());
        } else {
            alert('Erro ao alterar status: ' + data.message);
        }

    } catch (error) {
        console.error('Erro durante a requisição:', error);
        alert('Ocorreu um erro ao tentar alterar o status dos produtos.');
    }
});

// Botão para alterar status para Pendente na aba Pagas
document.getElementById('alterarStatusPagoBtn').addEventListener('click', async function () {
    const checkboxes = document.querySelectorAll('#produtosListPagos input[type="checkbox"]:checked');
    const idsSelecionados = Array.from(checkboxes).map(checkbox => checkbox.value);

    if (idsSelecionados.length === 0) {
        alert('Selecione pelo menos um produto para alterar o status.');
        return;
    }

    const admin_cpf = localStorage.getItem('cpfUsuario');

    try {
        const response = await fetch(`${config.baseURL}alterar_status_pgto.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                admin_cpf: admin_cpf,
                id_compras: idsSelecionados,
                cpf_comprador: new URLSearchParams(window.location.search).get('cpf_usuario'),
                pgto: 'pendente'
            })
        });

        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        const data = await response.json();
        console.log('Resposta da API:', data); // Log para verificar a resposta

        if (data.success) {
            alert('Status alterado para pendente com sucesso!');
            // Atualizar a lista de produtos após a alteração de status
            listarProdutos(await fetchProdutos());
        } else {
            alert('Erro ao alterar status: ' + data.message);
        }

    } catch (error) {
        console.error('Erro durante a requisição:', error);
        alert('Ocorreu um erro ao tentar alterar o status dos produtos.');
    }
});

// Função para buscar produtos novamente (opcional, para atualizar a lista)
async function fetchProdutos() {
    const cpf_usuario = new URLSearchParams(window.location.search).get('cpf_usuario');
    const admin_cpf = localStorage.getItem('cpfUsuario');
    const response = await fetch(`${config.baseURL}relatorio_pendencia.php`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ admin_cpf: admin_cpf, cpf_usuario: cpf_usuario })
    });

    if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
    }

    const data = await response.json();
    return data.relatorio; // Retorna a lista de produtos
}

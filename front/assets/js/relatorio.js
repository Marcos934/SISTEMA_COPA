import { config } from './config.js'; // Importa a configuração do arquivo config.js

document.addEventListener('DOMContentLoaded', async function () {
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
            body: JSON.stringify({ admin_cpf: admin_cpf })
        });

        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        const data = await response.json();
        console.log('Resposta da API:', data); // Log para verificar a resposta

        if (data.success) {
            listarUsuarios(data.relatorio);
        } else {
            alert('Erro ao listar usuários: ' + data.message);
        }

    } catch (error) {
        console.error('Erro durante a requisição:', error);
        alert('Ocorreu um erro ao tentar listar os usuários.');
    }
});

// Função para listar usuários agrupados por compras
function listarUsuarios(relatorio) {
    const usuariosMap = new Map();

    // Agrupa os dados dos usuários
    relatorio.forEach(item => {
        if (!usuariosMap.has(item.cpf)) {
            usuariosMap.set(item.cpf, {
                nome: item.nome,
                telefone: item.telefone,
                tipo: item.tipo,
                status: item.status,
                quantidade: 0,
                total: 0,
            });
        }
        if (item.pgto === 'pendente') {
            usuariosMap.get(item.cpf).quantidade += 1;
            usuariosMap.get(item.cpf).total += parseFloat(item.total);
        }
    });

    const usuariosList = document.getElementById('usuariosList');
    usuariosList.innerHTML = ''; // Limpa a lista antes de exibir

    usuariosMap.forEach((usuario, cpf) => {
        const usuarioRow = `
            <tr>
                <td>${usuario.quantidade}</td>
                <td>${usuario.nome}</td>
                <td>R$ ${usuario.total.toFixed(2)}</td>
                <td>${usuario.telefone}</td>
                <td>
                    <button class="btn btn-info btn-sm" onclick="mostrarDetalhes('${cpf}')">Detalhes</button>
                    <button class="btn btn-warning btn-sm" onclick="alterarStatus('${cpf}')">Alterar Status</button>
                </td>
            </tr>
        `;
        usuariosList.innerHTML += usuarioRow; // Adiciona a linha do usuário à tabela
    });
}

// Função para mostrar detalhes (implementação opcional)
function mostrarDetalhes(cpf) {
    alert(`Mostrar detalhes para o usuário com CPF: ${cpf}`);
}

// Função para alterar status (implementação opcional)
function alterarStatus(cpf) {
    alert(`Alterar status para o usuário com CPF: ${cpf}`);
}

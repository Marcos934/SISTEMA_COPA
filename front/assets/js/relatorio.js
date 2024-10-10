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
                tipo: item.tipo === 'CS' ? 'Usuário' : 'Admin', // Formatação do tipo
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

    const usuariosListPendentes = document.getElementById('usuariosList');
    const usuariosListOK = document.getElementById('usuariosListOK');
    usuariosListPendentes.innerHTML = ''; // Limpa a lista antes de exibir
    usuariosListOK.innerHTML = ''; // Limpa a lista de OK antes de exibir

    usuariosMap.forEach((usuario, cpf) => {
        const usuarioRow = `
            <tr>
                <td>${usuario.quantidade}</td>
                <td>${usuario.nome}</td>
                <td>R$ ${usuario.total.toFixed(2)}</td>
                <td>${usuario.telefone}</td>
                <td>${usuario.tipo}</td>
                <td>
                    <button class="btn btn-info btn-sm" onclick="mostrarDetalhes('${cpf}')">Detalhes</button>
                </td>
            </tr>
        `;

        // Adiciona à lista de pendentes ou OK
        if (usuario.total > 0) {
            usuariosListPendentes.innerHTML += usuarioRow; // Adiciona à lista de pendentes
        } else {
            usuariosListOK.innerHTML += usuarioRow; // Adiciona à lista de OK
        }
    });
}

// Função para mostrar detalhes
window.mostrarDetalhes = function(cpf) { // Define a função como global
    window.location.href = `detalhes_usuario.html?cpf_usuario=${cpf}`; // Passa apenas o CPF do usuário
}

import { config } from './config.js'; // Importa a configuração do arquivo config.js

document.addEventListener('DOMContentLoaded', async function () {
    const admin_cpf = localStorage.getItem('cpfUsuario');

    if (!admin_cpf) {
        alert('Você precisa estar logado como administrador para acessar esta página.');
        window.location.href = 'login.html'; // Redireciona para a página de login se o CPF não estiver disponível
        return;
    }

    try {
        const response = await fetch(`${config.baseURL}listar_usuarios.php`, { // Usando a URL do arquivo de configuração
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
            listarUsuarios(data.usuarios);
        } else {
            alert('Erro ao listar usuários: ' + data.message);
        }

    } catch (error) {
        console.error('Erro durante a requisição:', error);
        alert('Ocorreu um erro ao tentar listar os usuários.');
    }
});

function listarUsuarios(usuarios) {
    const usuariosList = document.getElementById('usuariosList');

    let table = `<table class="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nome</th>
                            <th>CPF</th>
                            <th>Telefone</th>
                            <th>Tipo</th>
                            <th>Status</th>
                            <th>Ação</th>
                        </tr>
                    </thead>
                    <tbody>`;
    
    usuarios.forEach(usuario => {
        table += `<tr>
                      <td>${usuario.id_usuario}</td>
                      <td>${usuario.nome}</td>
                      <td>${usuario.cpf}</td>
                      <td>${usuario.telefone || 'N/A'}</td>
                      <td>${usuario.tipo}</td>
                      <td>${usuario.status}</td>
                      <td>
                          <button class="btn btn-warning btn-sm" data-id="${usuario.id_usuario}" data-nome="${usuario.nome}" data-telefone="${usuario.telefone || ''}" data-status="${usuario.status}">Editar</button>
                      </td>
                  </tr>`;
    });

    table += `</tbody></table>`;
    usuariosList.innerHTML = table; // Adiciona a tabela ao elemento de listagem

    // Adiciona o evento de clique para cada botão "Editar"
    document.querySelectorAll('button[data-id]').forEach(button => {
        button.addEventListener('click', function () {
            const id_usuario = this.getAttribute('data-id');
            const nome = this.getAttribute('data-nome');
            const telefone = this.getAttribute('data-telefone');
            const status = this.getAttribute('data-status');

            // Depuração
            console.log('Status obtido:', status); // Adiciona um log para depuração

            // Preenche os campos do modal
            document.getElementById('editarNome').value = nome;
            document.getElementById('editarTelefone').value = telefone;

            // Garante que o status seja preenchido corretamente
            document.getElementById('editarStatus').value = status; // Aqui usamos o valor correto

            document.getElementById('usuarioId').value = id_usuario;

            // Abre o modal
            const modal = new bootstrap.Modal(document.getElementById('editarUsuarioModal'));
            modal.show();
        });
    });
}

// Função para salvar as edições
document.getElementById('salvarEdicoes').addEventListener('click', async function () {
    const id_usuario = document.getElementById('usuarioId').value;
    const nome = document.getElementById('editarNome').value;
    const telefone = document.getElementById('editarTelefone').value;
    const status = document.getElementById('editarStatus').value;
    const senha = document.getElementById('editarSenha').value;
    const admin_cpf = localStorage.getItem('cpfUsuario'); // Obtém o CPF do administrador do localStorage

    try {
        // Envia a requisição para editar usuário
        const response = await fetch(`${config.baseURL}editar_usuario.php`, { // Usando a URL do arquivo de configuração
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                admin_cpf: admin_cpf,
                id_usuario: id_usuario,
                nome: nome,
                telefone: telefone,
                status: status,
                password: senha || undefined // Envia a senha apenas se fornecida
            })
        });

        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        const data = await response.json();
        console.log('Resposta da API:', data); // Log para verificar a resposta

        if (data.success) {
            alert(data.message); // Exibe mensagem de sucesso
            // Atualiza a lista de usuários ou fecha o modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('editarUsuarioModal'));
            modal.hide();
            listarUsuarios(await fetchUsuarios()); // Atualiza a lista de usuários
        } else {
            alert('Erro ao editar: ' + data.message);
        }

    } catch (error) {
        console.error('Erro durante a requisição:', error);
        alert('Ocorreu um erro ao tentar editar o usuário.');
    }
});

// Função para buscar usuários novamente (opcional, para atualizar a lista)
async function fetchUsuarios() {
    const admin_cpf = localStorage.getItem('cpfUsuario');
    const response = await fetch(`${config.baseURL}listar_usuarios.php`, { // Usando a URL do arquivo de configuração
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
    return data.usuarios; // Retorna a lista de usuários
}

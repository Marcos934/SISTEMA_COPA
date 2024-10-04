import { config } from './config.js'; // Importa a configuração do arquivo config.js

document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault(); // Evita o envio tradicional do formulário

    // Pega os valores do formulário
    const cpf = document.getElementById('cpf').value.trim(); // remove espaços extras
    const password = document.getElementById('senha').value.trim(); // corrigido para 'password'

    // Verifica se os campos estão preenchidos
    if (!cpf || !password) {
        alert('CPF e Senha são obrigatórios.');
        return; // Para a execução se os campos estiverem vazios
    }

    try {
        // Faz a requisição para o endpoint de login
        const response = await fetch(`${config.baseURL}login.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                cpf: cpf,
                password: password
            })
        });

        // Verifica se a resposta HTTP foi bem-sucedida
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        // Processa a resposta JSON
        const data = await response.json();
        console.log('Resposta da API:', data); // Log para verificar a resposta

        if (data.success) {
            // Armazena o nome, tipo e CPF do usuário no localStorage
            localStorage.setItem('nomeUsuario', data.nome); // Armazenando o nome do usuário
            localStorage.setItem('usuarioTipo', data.usuario_tipo); // Armazenando o tipo de usuário
            localStorage.setItem('cpfUsuario', data.cpf); // Armazenando o CPF do usuário

            // alert(data.message);

            // Redireciona para a página específica com base no tipo de usuário
            if (data.usuario_tipo === 'AD') {
                window.location.href = 'menu-gdz.html'; // Redireciona para menu do administrador
            } else if (data.usuario_tipo === 'CS') {
                window.location.href = 'menu.html'; // Redireciona para menu do usuário comum
            }
        } else {
            alert('Erro ao fazer login: ' + data.message);
        }

    } catch (error) {
        console.error('Erro durante a requisição:', error);
        alert('Ocorreu um erro ao tentar fazer login.');
    }
});

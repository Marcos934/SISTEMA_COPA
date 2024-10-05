import { config, verificarSessao } from './config.js'; // Importa a configuração e a função de verificação

// Verifica se o usuário está logado ao acessar esta página
verificarSessao(); // Chama a função de verificação de sessão

document.addEventListener('DOMContentLoaded', function () {
    // Recupera o nome do usuário armazenado no localStorage
    const nomeUsuario = localStorage.getItem('nomeUsuario');

    // Exibe a saudação com o nome do usuário
    const saudacaoElemento = document.getElementById('saudacao');
    saudacaoElemento.textContent = nomeUsuario ? `Olá, ${nomeUsuario}` : 'Olá, Usuário'; // Saudação padrão

    // Adiciona a função de logout ao botão
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', async function () {
        await logout(); // Chama a função de logout
    });
});

// Função de logout
async function logout() {
    try {
        // Faz a requisição para o endpoint de logout no servidor
        const response = await fetch(`${config.baseURL}logout.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Verifica se a resposta foi bem-sucedida
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        const data = await response.json();
        console.log('Resposta do logout:', data);

        if (data.success) {
            // Se o logout foi bem-sucedido no servidor, remove a sessão no front-end
            localStorage.removeItem('nomeUsuario');
            localStorage.removeItem('usuarioTipo');

            // Redireciona de volta para a página de login
            window.location.href = 'login.html';
        } else {
            alert('Erro ao fazer logout: ' + data.message);
        }

    } catch (error) {
        console.error('Erro ao tentar encerrar a sessão:', error);
        alert('Ocorreu um erro ao tentar fazer logout.');
    }
}

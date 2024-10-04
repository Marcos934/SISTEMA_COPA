const config = {
    baseURL: 'http://localhost/SISTEMA_COPA/back/api/' // Defina aqui a URL base para o seu ambiente
};

// Função para verificar se o usuário está logado
async function verificarSessao() {
    const nomeUsuario = localStorage.getItem('nomeUsuario');
    const usuarioTipo = localStorage.getItem('usuarioTipo');
    const cpfUsuario = localStorage.getItem('cpfUsuario'); // Adicionando a verificação do CPF

    // Verifica se há dados do nome, tipo ou CPF do usuário
    if (!nomeUsuario || !usuarioTipo || !cpfUsuario) {
        // Se não houver dados do usuário, redireciona para a página de login
        window.location.href = 'login.html';
    } else {
        // Verifica o status do usuário
        await verificarStatusUsuario(cpfUsuario, usuarioTipo);
    }
}

// Função para verificar o status do usuário
async function verificarStatusUsuario(cpf, tipo) {
    try {
        const response = await fetch(`${config.baseURL}verificar_usuario.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ cpf: cpf, tipo: tipo })
        });

        const data = await response.json();
        console.log('Verificação de usuário:', data); // Log para debugar a resposta

        if (data.success && data.status !== 'ativo') {
            // Se o status não for ativo, realiza o logout
            realizarLogout();
        }
    } catch (error) {
        console.error('Erro ao verificar status do usuário:', error);
        realizarLogout(); // Se houver erro, também faz o logout
    }
}

// Função para realizar logout
function realizarLogout() {
    // Remove os dados do localStorage
    localStorage.removeItem('nomeUsuario');
    localStorage.removeItem('usuarioTipo');
    localStorage.removeItem('cpfUsuario');

    // Redireciona para a página de login
    window.location.href = 'login.html';
}

// Exporta a configuração e as funções de verificação
export { config, verificarSessao };

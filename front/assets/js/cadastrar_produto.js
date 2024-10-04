import { config } from './config.js'; // Importa a configuração do arquivo config.js

document.getElementById('cadastrarForm').addEventListener('submit', async function (e) {
    e.preventDefault(); // Impede o envio do formulário padrão

    // Captura os valores dos campos do formulário
    const nome = document.getElementById('nome').value.trim();
    const tipo = document.getElementById('tipo').value;
    const preco = parseFloat(document.getElementById('preco').value.trim());
    const qntd = parseInt(document.getElementById('qntd').value.trim());
    const informacao = document.getElementById('informacao').value.trim();
    const admin_cpf = localStorage.getItem('cpfUsuario'); // Obtém o CPF do administrador do localStorage

    try {
        // Envia a requisição para o endpoint de cadastrar produto
        const response = await fetch(`${config.baseURL}cadastrar_produto.php`, { // Usando a URL do arquivo de configuração
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nome: nome,
                tipo: tipo,
                preco: preco,
                qntd: qntd,
                informacao: informacao,
                admin_cpf: admin_cpf // Inclui o CPF do administrador
            })
        });

        // Verifica se a resposta foi bem-sucedida
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        // Processa a resposta JSON
        const data = await response.json();
        console.log('Resposta da API:', data); // Log para verificar a resposta

        if (data.success) {
            alert(data.message); // Exibe mensagem de sucesso
            window.location.href = 'menu-gdz.html'; // Redireciona para o menu de administrador
        } else {
            alert('Erro ao cadastrar produto: ' + data.message);
        }

    } catch (error) {
        console.error('Erro durante a requisição:', error);
        alert('Ocorreu um erro ao tentar cadastrar o produto.');
    }
});

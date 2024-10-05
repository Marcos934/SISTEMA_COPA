// comprar.js

import { config } from './config.js'; // Importa a configuração do arquivo config.js

document.addEventListener('DOMContentLoaded', function () {
    const confirmarCompraBtn = document.getElementById('confirmarCompra');
    
    confirmarCompraBtn.addEventListener('click', async function () {
        const cpf = localStorage.getItem('cpfUsuario');
        const quantidade = parseInt(document.getElementById('quantidadeInput').value);
        const total = parseFloat(document.getElementById('totalValue').textContent.split('R$ ')[1]);
        const idProduto = document.getElementById('modalNome').textContent; // Aqui você deve ajustar para obter o id do produto corretamente

        // Para obter o id do produto corretamente, você pode armazenar no modal durante a abertura
        const idProdutoNumber = parseInt(document.getElementById('modalImagem').getAttribute('data-id')); // Aqui estamos assumindo que você armazena o id do produto na imagem

        const dadosCompra = {
            cpf: cpf,
            produtos: [{
                id_produto: idProdutoNumber, // Usar o id correto
                quantidade: quantidade
            }],
            total: total
        };

        try {
            const response = await fetch(`${config.baseURL}comprar.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dadosCompra)
            });

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            const data = await response.json();
            console.log('Resposta da compra:', data);

            if (data.success) {
                const mensagemConfirmacao = document.getElementById('mensagemConfirmacao');
                mensagemConfirmacao.textContent = 'A compra foi realizada com sucesso!'; // Mensagem de sucesso
            } else {
                alert('Erro ao realizar a compra: ' + data.message);
            }
        } catch (error) {
            console.error('Erro durante a requisição:', error);
            alert('Ocorreu um erro ao tentar realizar a compra.');
        }

        // Fecha o modal de detalhes do produto
        const modal = bootstrap.Modal.getInstance(document.getElementById('produtoModal'));
        modal.hide();

        // Abre o modal de confirmação
        const confirmacaoModal = new bootstrap.Modal(document.getElementById('confirmacaoModal'));
        confirmacaoModal.show();
    });
});

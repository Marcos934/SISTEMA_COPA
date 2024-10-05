// comprar.js

import { config } from './config.js'; // Importa a configuração do arquivo config.js

document.addEventListener('DOMContentLoaded', function () {
    const confirmarCompraBtn = document.getElementById('confirmarCompra');
    
    confirmarCompraBtn.addEventListener('click', async function () {
        // Desabilita o botão para evitar múltiplos cliques
        confirmarCompraBtn.disabled = true;

        const cpf = localStorage.getItem('cpfUsuario');
        const quantidade = parseInt(document.getElementById('quantidadeInput').value);
        const total = parseFloat(document.getElementById('totalValue').textContent.split('R$ ')[1]);
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
                
                // Inicializa a barra de progresso
                let progressBar = document.getElementById('progressBar');
                let width = 100;
                const interval = setInterval(() => {
                    if (width <= 0) {
                        clearInterval(interval);
                        const confirmacaoModal = new bootstrap.Modal(document.getElementById('confirmacaoModal'));
                        confirmacaoModal.hide();

                        // Recarrega a página ao final da barra de progresso
                        location.reload();
                    } else {
                        width--;
                        progressBar.style.width = width + '%';
                        progressBar.setAttribute('aria-valuenow', width);
                    }
                }, 300); // Atualiza a barra a cada 300ms
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

    // Adiciona evento para recarregar a página ao fechar o modal
    const confirmacaoModalElement = document.getElementById('confirmacaoModal');
    confirmacaoModalElement.addEventListener('hidden.bs.modal', function () {
        location.reload(); // Recarrega a página
    });
});

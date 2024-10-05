import { config } from './config.js'; // Importa a configuração do arquivo config.js

// Função para realizar a compra
window.realizarCompra = async function (quantidade, precoTotal, idProduto) {
    const cpf = localStorage.getItem('cpfUsuario');
    const produtos = [
        {
            id_produto: idProduto,
            quantidade: quantidade
        }
    ];

    const dadosCompra = {
        cpf: cpf,
        produtos: produtos,
        total: precoTotal
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
            alert('Compra realizada com sucesso!');
        } else {
            alert('Erro ao realizar a compra: ' + data.message);
        }
    } catch (error) {
        console.error('Erro ao tentar realizar a compra:', error);
        alert('Ocorreu um erro ao tentar realizar a compra.');
    }
};

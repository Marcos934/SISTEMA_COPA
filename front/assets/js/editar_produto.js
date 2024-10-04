import { config } from './config.js'; // Importa a configuração do arquivo config.js

document.addEventListener('DOMContentLoaded', async function () {
    const admin_cpf = localStorage.getItem('cpfUsuario');

    if (!admin_cpf) {
        alert('Você precisa estar logado como administrador para acessar esta página.');
        window.location.href = 'login.html'; // Redireciona para a página de login se o CPF não estiver disponível
        return;
    }

    try {
        const response = await fetch(`${config.baseURL}listar_produtos.php`, { // Usando a URL do arquivo de configuração
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
            listarProdutos(data.produtos);
        } else {
            alert('Erro ao listar produtos: ' + data.message);
        }

    } catch (error) {
        console.error('Erro durante a requisição:', error);
        alert('Ocorreu um erro ao tentar listar os produtos.');
    }
});

function listarProdutos(produtos) {
    const produtosList = document.getElementById('produtosList');

    let table = `<table class="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nome</th>
                            <th>Tipo</th>
                            <th>Preço</th>
                            <th>Quantidade</th>
                            <th>Informação</th>
                            <th>Ação</th>
                        </tr>
                    </thead>
                    <tbody>`;
    
    produtos.forEach(produto => {
        table += `<tr>
                      <td>${produto.id_produto}</td>
                      <td>${produto.nome}</td>
                      <td>${produto.tipo}</td>
                      <td>${produto.preco}</td>
                      <td>${produto.qntd}</td>
                      <td>${produto.informacao || 'N/A'}</td>
                      <td>
                          <button class="btn btn-warning btn-sm" data-id="${produto.id_produto}" data-nome="${produto.nome}" data-tipo="${produto.tipo}" data-preco="${produto.preco}" data-qntd="${produto.qntd}" data-informacao="${produto.informacao}">Editar</button>
                      </td>
                  </tr>`;
    });

    table += `</tbody></table>`;
    produtosList.innerHTML = table; // Adiciona a tabela ao elemento de listagem

    // Adiciona o evento de clique para cada botão "Editar"
    document.querySelectorAll('button[data-id]').forEach(button => {
        button.addEventListener('click', function () {
            const id_produto = this.getAttribute('data-id');
            const nome = this.getAttribute('data-nome');
            const tipo = this.getAttribute('data-tipo');
            const preco = this.getAttribute('data-preco');
            const qntd = this.getAttribute('data-qntd');
            const informacao = this.getAttribute('data-informacao');

            // Preenche os campos do modal
            document.getElementById('editarNome').value = nome;
            document.getElementById('editarTipo').value = tipo;
            document.getElementById('editarPreco').value = preco;
            document.getElementById('editarQntd').value = qntd;
            document.getElementById('editarInformacao').value = informacao;

            document.getElementById('produtoId').value = id_produto;

            // Abre o modal
            const modal = new bootstrap.Modal(document.getElementById('editarProdutoModal'));
            modal.show();
        });
    });
}

// Função para salvar as edições
document.getElementById('salvarEdicoes').addEventListener('click', async function () {
    const id_produto = document.getElementById('produtoId').value;
    const nome = document.getElementById('editarNome').value;
    const tipo = document.getElementById('editarTipo').value;
    const preco = parseFloat(document.getElementById('editarPreco').value);
    const qntd = parseInt(document.getElementById('editarQntd').value);
    const informacao = document.getElementById('editarInformacao').value;
    const admin_cpf = localStorage.getItem('cpfUsuario'); // Obtém o CPF do administrador do localStorage

    try {
        // Envia a requisição para editar produto
        const response = await fetch(`${config.baseURL}editar_produto.php`, { // Usando a URL do arquivo de configuração
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                admin_cpf: admin_cpf,
                id_produto: id_produto,
                nome: nome,
                tipo: tipo,
                preco: preco,
                qntd: qntd,
                informacao: informacao
            })
        });

        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        const data = await response.json();
        console.log('Resposta da API:', data); // Log para verificar a resposta

        if (data.success) {
            alert(data.message); // Exibe mensagem de sucesso
            // Atualiza a lista de produtos ou fecha o modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('editarProdutoModal'));
            modal.hide();
            listarProdutos(await fetchProdutos()); // Atualiza a lista de produtos
        } else {
            alert('Erro ao editar: ' + data.message);
        }

    } catch (error) {
        console.error('Erro durante a requisição:', error);
        alert('Ocorreu um erro ao tentar editar o produto.');
    }
});

// Função para buscar produtos novamente (opcional, para atualizar a lista)
async function fetchProdutos() {
    const admin_cpf = localStorage.getItem('cpfUsuario');
    const response = await fetch(`${config.baseURL}listar_produtos.php`, { // Usando a URL do arquivo de configuração
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
    return data.produtos; // Retorna a lista de produtos
}

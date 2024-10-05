import { config } from './config.js'; // Importa a configuração do arquivo config.js

document.addEventListener('DOMContentLoaded', async function () {
    const admin_cpf = localStorage.getItem('cpfUsuario');

    if (!admin_cpf) {
        alert('Você precisa estar logado como administrador para acessar esta página.');
        window.location.href = 'login.html'; // Redireciona para a página de login se o CPF não estiver disponível
        return;
    }

    try {
        const response = await fetch(`${config.baseURL}listar_produtos.php`, {
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
                            <th>Imagem</th>
                            <th>Nome</th>
                            <th>Tipo</th>
                            <th>Preço</th>
                            <th>Quantidade</th>
                            <th>Informação</th>
                            <th>Status</th>
                            <th>Ação</th>
                        </tr>
                    </thead>
                    <tbody>`;
    
    produtos.forEach(produto => {
        const imgUrl = produto.url_img ? produto.url_img : 'https://via.placeholder.com/100'; // Placeholder se a URL não estiver disponível
        const statusButton = produto.status_produto === "ativo" 
            ? `<button class="btn btn-danger btn-sm" onclick="alterarStatus('${produto.id_produto}', '${produto.qntd}', 'inativo')">Desativar</button>`
            : `<button class="btn btn-success btn-sm" onclick="alterarStatus('${produto.id_produto}', '${produto.qntd}', 'ativo')">Ativar</button>`;
        
        table += `<tr>
                      <td><img src="${imgUrl}" alt="Imagem do produto" style="width: 100px; height: 100px;"></td>
                      <td>${produto.nome}</td>
                      <td>${produto.tipo}</td>
                      <td>${produto.preco}</td>
                      <td>${produto.qntd}</td>
                      <td>${produto.informacao || 'N/A'}</td>
                      <td>${produto.status_produto}</td>
                      <td>
                          <button class="btn btn-warning btn-sm" data-id="${produto.id_produto}" data-nome="${produto.nome}" data-tipo="${produto.tipo}" data-preco="${produto.preco}" data-qntd="${produto.qntd}" data-informacao="${produto.informacao}" data-url="${produto.url_img}">Editar</button>
                          ${statusButton} <!-- Botão de alterar status -->
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
            const url_img = this.getAttribute('data-url'); // Captura a URL da imagem

            // Preenche os campos do modal
            document.getElementById('editarNome').value = nome;
            document.getElementById('editarTipo').value = tipo;
            document.getElementById('editarPreco').value = preco;
            document.getElementById('editarQntd').value = qntd;
            document.getElementById('editarInformacao').value = informacao;
            document.getElementById('url_img').value = url_img; // Preenche a URL da imagem

            // Exibe a imagem antiga
            const imgAntiga = document.getElementById('imgAntiga');
            imgAntiga.src = url_img;
            imgAntiga.style.display = 'block';

            document.getElementById('produtoId').value = id_produto;

            // Abre o modal
            const modal = new bootstrap.Modal(document.getElementById('editarProdutoModal'));
            modal.show();
        });
    });
}

// Função para alterar o status do produto
window.alterarStatus = async function(id_produto, qntd, novoStatus) { // Define a função como global
    const confirmacao = confirm(`Você realmente deseja ${novoStatus === 'inativo' ? 'desativar' : 'ativar'} este produto?`);

    if (confirmacao) {
        const admin_cpf = localStorage.getItem('cpfUsuario');

        try {
            const response = await fetch(`${config.baseURL}editar_produto.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    admin_cpf: admin_cpf,
                    id_produto: id_produto,
                    qntd: qntd, // Inclui a quantidade atual
                    status_produto: novoStatus // Envia o novo status
                })
            });

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            const data = await response.json();
            console.log('Resposta da API:', data); // Log para verificar a resposta

            if (data.success) {
                alert(data.message); // Exibe mensagem de sucesso
                listarProdutos(await fetchProdutos()); // Atualiza a lista de produtos
            } else {
                alert('Erro ao alterar status: ' + data.message);
            }

        } catch (error) {
            console.error('Erro durante a requisição:', error);
            alert('Ocorreu um erro ao tentar alterar o status do produto.');
        }
    }
}

// Função para editar o produto
document.getElementById('salvarEdicoes').addEventListener('click', async function () {
    const id_produto = document.getElementById('produtoId').value;
    const nome = document.getElementById('editarNome').value;
    const tipo = document.getElementById('editarTipo').value;
    const preco = document.getElementById('editarPreco').value;
    const qntd = document.getElementById('editarQntd').value;
    const informacao = document.getElementById('editarInformacao').value;
    const url_img = document.getElementById('url_img').value; // Captura a URL da imagem
    const admin_cpf = localStorage.getItem('cpfUsuario'); // Obtém o CPF do administrador do localStorage

    try {
        const response = await fetch(`${config.baseURL}editar_produto.php`, {
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
                informacao: informacao,
                url_img: url_img // Envia a nova URL da imagem
            })
        });

        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        const data = await response.json();
        console.log('Resposta da API:', data); // Log para verificar a resposta

        if (data.success) {
            alert(data.message); // Exibe mensagem de sucesso
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
    const response = await fetch(`${config.baseURL}listar_produtos.php`, {
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

// Adiciona o evento para visualizar a nova imagem
document.getElementById('url_img').addEventListener('input', function() {
    const imgPreview = document.getElementById('imgPreview');
    const urlNova = this.value;

    if (urlNova) {
        imgPreview.src = urlNova; // Atualiza a nova imagem
        imgPreview.style.display = 'block'; // Exibe a nova imagem
    } else {
        imgPreview.style.display = 'none'; // Esconde a nova imagem se a URL estiver vazia
    }

    // Oculta a pré-visualização da nova imagem se a URL for igual à antiga
    const imgAntiga = document.getElementById('imgAntiga').src;
    if (urlNova === imgAntiga) {
        imgPreview.style.display = 'none'; // Esconde se for a mesma
    }
});

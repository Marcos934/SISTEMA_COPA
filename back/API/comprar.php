<?php
// back/api/comprar.php
include 'cors.php'; // Inclui as configurações de CORS
header('Access-Control-Allow-Methods: POST');
session_start();

// header('Content-Type: application/json');
// header('Access-Control-Allow-Origin: *');
// header('Access-Control-Allow-Headers: Content-Type');
// header('Access-Control-Allow-Methods: POST');

// Verifica se o usuário está autenticado
// if (!isset($_SESSION['usuario_id'])) {
//     http_response_code(401); // Não autorizado
//     echo json_encode(['success' => false, 'message' => 'Usuário não autenticado.']);
//     exit();
// }

require_once 'db.php';

// Obtém os dados enviados
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['cpf']) || !isset($data['produtos']) || !isset($data['total'])) {
    http_response_code(400); // Requisição inválida
    echo json_encode(['success' => false, 'message' => 'CPF, produtos e total são obrigatórios.']);
    exit();
}

$cpf = $data['cpf'];
$produtos = $data['produtos'];
$total = $data['total'];

try {
    $db = new Database();
    $pdo = $db->getConnection();

    // Inicia a transação
    $pdo->beginTransaction();

    // Verifica se o CPF fornecido pertence a um usuário ativo
    $stmt = $pdo->prepare('SELECT id_usuario, status FROM usuario WHERE cpf = :cpf');
    $stmt->execute(['cpf' => $cpf]);
    $usuario = $stmt->fetch();

    if (!$usuario) {
        http_response_code(404); // Usuário não encontrado
        echo json_encode(['success' => false, 'message' => 'Usuário não encontrado.']);
        exit();
    }

    // Verifica se o usuário está ativo
    if ($usuario['status'] !== 'ativo') {
        http_response_code(403); // Proibido
        echo json_encode(['success' => false, 'message' => 'Usuário inativo.']);
        exit();
    }

    $usuario_id = $usuario['id_usuario'];

    // Verifica se há estoque suficiente para cada produto
    foreach ($produtos as $produto) {
        $id_produto = $produto['id_produto'];
        $quantidade = $produto['quantidade'];

        // Verifica a quantidade em estoque do produto
        $stmt = $pdo->prepare('SELECT qntd FROM produto WHERE id_produto = :id_produto FOR UPDATE');
        $stmt->execute(['id_produto' => $id_produto]);
        $produto_db = $stmt->fetch();

        if ($produto_db['qntd'] < $quantidade) {
            // Se o estoque for insuficiente, desfaz a transação
            $pdo->rollBack();
            echo json_encode(['success' => false, 'message' => 'Estoque insuficiente para o produto ID ']);
            exit();
        }
    }

    // Insere uma nova compra na tabela "compra"
    $stmt = $pdo->prepare('INSERT INTO compra (fk_id_usuario, total, pgto) VALUES (:fk_id_usuario, :total, "pendente")');
    $stmt->execute(['fk_id_usuario' => $usuario_id, 'total' => $total]);

    // Obtém o ID da compra recém-criada
    $id_compra = $pdo->lastInsertId();

    // Insere os produtos comprados na tabela "compra_produto" e atualiza o estoque
    foreach ($produtos as $produto) {
        $id_produto = $produto['id_produto'];
        $quantidade = $produto['quantidade'];

        // Insere o produto na tabela compra_produto
        $stmt = $pdo->prepare('INSERT INTO compra_produto (fk_id_compra, fk_id_produto, quantidade) VALUES (:fk_id_compra, :fk_id_produto, :quantidade)');
        $stmt->execute([
            'fk_id_compra' => $id_compra,
            'fk_id_produto' => $id_produto,
            'quantidade' => $quantidade
        ]);

        // Atualiza o estoque do produto na tabela "produto"
        $stmt = $pdo->prepare('UPDATE produto SET qntd = qntd - :quantidade WHERE id_produto = :id_produto');
        $stmt->execute([
            'quantidade' => $quantidade,
            'id_produto' => $id_produto
        ]);
    }

    // Confirma a transação
    $pdo->commit();

    echo json_encode(['success' => true, 'message' => 'Compra registrada com sucesso.']);
} catch (PDOException $e) {
    // Desfaz a transação em caso de erro
    $pdo->rollBack();
    http_response_code(500); // Erro no servidor
    echo json_encode(['success' => false, 'message' => 'Erro no servidor: ' . $e->getMessage()]);
}
?>
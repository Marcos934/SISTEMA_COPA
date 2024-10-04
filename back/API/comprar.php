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
if (!isset($_SESSION['usuario_id'])) {
    http_response_code(401); // Não autorizado
    echo json_encode(['success' => false, 'message' => 'Usuário não autenticado.']);
    exit();
}

require_once 'db.php';

// Obtém os dados enviados
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['produtos']) || !is_array($data['produtos'])) {
    http_response_code(400); // Requisição inválida
    echo json_encode(['success' => false, 'message' => 'Dados inválidos. Produtos devem ser um array.']);
    exit();
}

$usuario_id = $_SESSION['usuario_id'];
$produtos = $data['produtos']; // Array de objetos com 'id_produto' e 'quantidade'

try {
    $db = new Database();
    $pdo = $db->getConnection();

    // Inicia uma transação para garantir a consistência dos dados
    $pdo->beginTransaction();

    $total = 0;

    foreach ($produtos as $item) {
        // Verifica se os dados estão corretos
        if (!isset($item['id_produto']) || !isset($item['quantidade'])) {
            throw new Exception('Dados de produto inválidos');
        }

        // Verifica se o produto existe e se há estoque suficiente
        $stmt = $pdo->prepare('SELECT preco, qntd FROM produto WHERE id_produto = :id_produto');
        $stmt->execute(['id_produto' => $item['id_produto']]);
        $produto = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$produto || $produto['qntd'] < $item['quantidade']) {
            throw new Exception('Produto indisponível ou quantidade insuficiente.');
        }

        // Calcula o subtotal do produto
        $subtotal = $produto['preco'] * $item['quantidade'];
        $total += $subtotal;

        // Atualiza a quantidade em estoque
        $stmt = $pdo->prepare('UPDATE produto SET qntd = qntd - :quantidade WHERE id_produto = :id_produto');
        $stmt->execute([
            'quantidade' => $item['quantidade'],
            'id_produto' => $item['id_produto']
        ]);
    }

    // Registra a compra com o status de pagamento como 'pendente'
    $stmt = $pdo->prepare('INSERT INTO compra (fk_id_usuario, total, pgto) VALUES (:fk_id_usuario, :total, :pgto)');
    $stmt->execute([
        'fk_id_usuario' => $usuario_id,
        'total' => $total,
        'pgto' => 'pendente' // O status de pagamento é 'pendente' por padrão
    ]);
    $id_compra = $pdo->lastInsertId();

    // Registra os produtos da compra
    foreach ($produtos as $item) {
        $stmt = $pdo->prepare('INSERT INTO compra_produto (fk_id_compra, fk_id_produto, quantidade) VALUES (:fk_id_compra, :fk_id_produto, :quantidade)');
        $stmt->execute([
            'fk_id_compra' => $id_compra,
            'fk_id_produto' => $item['id_produto'],
            'quantidade' => $item['quantidade']
        ]);
    }

    // Finaliza a transação
    $pdo->commit();

    echo json_encode(['success' => true, 'message' => 'Compra realizada com sucesso.']);
} catch (Exception $e) {
    // Em caso de erro, faz rollback da transação
    $pdo->rollBack();
    http_response_code(400); // Requisição inválida
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>

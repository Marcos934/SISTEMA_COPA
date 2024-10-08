<?php
// back/api/cadastrar_produto.php
include 'cors.php'; // Inclui as configurações de CORS
header('Access-Control-Allow-Methods: POST');
session_start();


require_once 'db.php';

// Obtém os dados enviados
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['admin_cpf']) || (!isset($data['id_compra']) && !isset($data['id_compras'])) || !isset($data['cpf_comprador']) || !isset($data['pgto'])) {
    http_response_code(400); // Requisição inválida
    echo json_encode(['success' => false, 'message' => 'Parâmetros obrigatórios: admin_cpf, cpf_comprador, pgto, id_compra ou id_compras.']);
    exit();
}

$admin_cpf = $data['admin_cpf'];
$cpf_comprador = $data['cpf_comprador'];
$pgto = $data['pgto'];
$id_compra = isset($data['id_compra']) ? $data['id_compra'] : null;
$id_compras = isset($data['id_compras']) ? $data['id_compras'] : null;

// Verifica se o status de pagamento é válido (pendente ou pago)
if (!in_array($pgto, ['pendente', 'pago'])) {
    http_response_code(400); // Requisição inválida
    echo json_encode(['success' => false, 'message' => 'Status de pagamento inválido.']);
    exit();
}

try {
    $db = new Database();
    $pdo = $db->getConnection();

    // Verifica se o CPF fornecido é de um administrador ativo
    $stmt = $pdo->prepare('SELECT id_usuario FROM usuario WHERE cpf = :cpf AND tipo = "AD" AND status = "ativo"');
    $stmt->execute(['cpf' => $admin_cpf]);
    $admin = $stmt->fetch();

    if (!$admin) {
        http_response_code(403); // Proibido
        echo json_encode(['success' => false, 'message' => 'Acesso negado. Apenas administradores ativos podem alterar o status de pagamento.']);
        exit();
    }

    // Verifica se o comprador existe
    $stmt = $pdo->prepare('SELECT id_usuario FROM usuario WHERE cpf = :cpf_comprador');
    $stmt->execute(['cpf_comprador' => $cpf_comprador]);
    $comprador = $stmt->fetch();

    if (!$comprador) {
        http_response_code(404); // Comprador não encontrado
        echo json_encode(['success' => false, 'message' => 'Comprador não encontrado.']);
        exit();
    }

    $comprador_id = $comprador['id_usuario'];

    // Se múltiplos id_compras forem fornecidos, atualiza todos eles
    if ($id_compras) {
        // Gera a lista de IDs e faz a atualização
        $placeholders = implode(',', array_fill(0, count($id_compras), '?'));
        $sql = 'UPDATE compra SET pgto = ? WHERE id_compra IN (' . $placeholders . ') AND fk_id_usuario = ?';
        $stmt = $pdo->prepare($sql);
        $params = array_merge([$pgto], $id_compras, [$comprador_id]);
        $stmt->execute($params);

        echo json_encode(['success' => true, 'message' => 'Status de pagamento atualizado para múltiplas compras.']);
    } else {
        // Atualiza uma única compra
        $stmt = $pdo->prepare('UPDATE compra SET pgto = :pgto WHERE id_compra = :id_compra AND fk_id_usuario = :fk_id_usuario');
        $stmt->execute(['pgto' => $pgto, 'id_compra' => $id_compra, 'fk_id_usuario' => $comprador_id]);

        echo json_encode(['success' => true, 'message' => 'Status de pagamento atualizado com sucesso.']);
    }
} catch (PDOException $e) {
    http_response_code(500); // Erro no servidor
    echo json_encode(['success' => false, 'message' => 'Erro no servidor: ' . $e->getMessage()]);
}
?>
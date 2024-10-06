<?php
include 'cors.php'; // Inclui as configurações de CORS
header('Access-Control-Allow-Methods: POST');


require_once 'db.php';

// Obtém os dados enviados
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['admin_cpf'])) {
    http_response_code(400); // Requisição inválida
    echo json_encode(['success' => false, 'message' => 'CPF do administrador é obrigatório.']);
    exit();
}

$admin_cpf = $data['admin_cpf'];

try {
    $db = new Database();
    $pdo = $db->getConnection();

    // Verifica se o CPF fornecido é de um administrador ativo
    $stmt = $pdo->prepare('SELECT id_usuario FROM usuario WHERE cpf = :cpf AND tipo = "AD" AND status = "ativo"');
    $stmt->execute(['cpf' => $admin_cpf]);
    $admin = $stmt->fetch();

    if (!$admin) {
        http_response_code(403); // Proibido
        echo json_encode(['success' => false, 'message' => 'Acesso negado. Apenas administradores ativos podem acessar este relatório.']);
        exit();
    }

    // Consulta todos os usuários e seus dados de compra, exceto o campo password
    $sql = '
        SELECT u.nome, u.cpf, u.tipo, u.telefone, u.status,
               c.id_compra, p.nome AS nome_produto, cp.quantidade, c.total, c.data, c.pgto
        FROM usuario u
        LEFT JOIN compra c ON u.id_usuario = c.fk_id_usuario
        LEFT JOIN compra_produto cp ON c.id_compra = cp.fk_id_compra
        LEFT JOIN produto p ON cp.fk_id_produto = p.id_produto
        ORDER BY u.nome ASC, c.data ASC';

    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $relatorio = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'relatorio' => $relatorio]);
} catch (PDOException $e) {
    http_response_code(500); // Erro no servidor
    echo json_encode(['success' => false, 'message' => 'Erro no servidor: ' . $e->getMessage()]);
}
?>

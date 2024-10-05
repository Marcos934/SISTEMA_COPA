<?php
// back/api/listar_compras.php
include 'cors.php'; // Inclui as configurações de CORS
header('Access-Control-Allow-Methods: GET');
session_start();

// header('Content-Type: application/json');
// header('Access-Control-Allow-Origin: *');
// header('Access-Control-Allow-Headers: Content-Type');
// header('Access-Control-Allow-Methods: GET');

// Verifica se o usuário está autenticado e se é administrador
// if (!isset($_SESSION['usuario_id']) || $_SESSION['usuario_tipo'] !== 'AD') {
//     http_response_code(403); // Proibido
//     echo json_encode(['success' => false, 'message' => 'Acesso negado. Apenas administradores podem visualizar as compras.']);
//     exit();
// }

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

    // Verifica se o CPF fornecido pertence a um administrador (tipo AD)
    $stmt = $pdo->prepare('SELECT * FROM usuario WHERE cpf = :cpf AND tipo = "AD"');
    $stmt->execute(['cpf' => $admin_cpf]);
    $admin = $stmt->fetch();

    if (!$admin) {
        http_response_code(403); // Proibido
        echo json_encode(['success' => false, 'message' => 'Acesso negado. Apenas administradores podem visualizar os produtos.']);
        exit();
    }

    // Lista todos os produtos com todos os campos
    $stmt = $pdo->prepare('SELECT * FROM produto');
    $stmt->execute();
    $produtos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'produtos' => $produtos]);
} catch (PDOException $e) {
    http_response_code(500); // Erro interno do servidor
    echo json_encode(['success' => false, 'message' => 'Erro no servidor: ' . $e->getMessage()]);
}
?>
<?php
// back/api/listar_usuarios.php
include 'cors.php'; // Inclui as configurações de CORSheader('Access-Control-Allow-Methods: POST');

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

    // Verifica se o CPF do administrador é válido
    $stmt = $pdo->prepare('SELECT * FROM usuario WHERE cpf = :cpf AND tipo = "AD"');
    $stmt->execute(['cpf' => $admin_cpf]);
    $admin = $stmt->fetch();

    if (!$admin) {
        http_response_code(403); // Proibido
        echo json_encode(['success' => false, 'message' => 'Acesso negado. Apenas administradores podem visualizar os usuários.']);
        exit();
    }

    // Lista todos os usuários do tipo AD e CS
    $stmt = $pdo->prepare('SELECT id_usuario, nome, cpf, telefone, tipo, status FROM usuario WHERE tipo IN ("AD", "CS")');
    $stmt->execute();
    $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Retorna a lista de usuários
    echo json_encode(['success' => true, 'usuarios' => $usuarios]);
} catch (PDOException $e) {
    http_response_code(500); // Erro interno do servidor
    echo json_encode(['success' => false, 'message' => 'Erro no servidor: ' . $e->getMessage()]);
}
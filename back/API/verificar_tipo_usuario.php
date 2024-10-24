<?php
// back/api/login.php

include 'cors.php'; // Inclui as configurações de CORS
header('Access-Control-Allow-Methods: POST');

require_once 'db.php';

// Obtém os dados enviados
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['cpf'])) {
    http_response_code(400); // Requisição inválida
    echo json_encode(['success' => false, 'message' => 'CPF é obrigatório.']);
    exit();
}

$cpf = $data['cpf'];

try {
    $db = new Database();
    $pdo = $db->getConnection();

    // Verifica se o usuário com o CPF fornecido existe
    $stmt = $pdo->prepare('SELECT tipo, status FROM usuario WHERE cpf = :cpf');
    $stmt->execute(['cpf' => $cpf]);
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$usuario) {
        http_response_code(404); // Usuário não encontrado
        echo json_encode(['success' => false, 'message' => 'Usuário não encontrado.']);
        exit();
    }

    // Retorna o tipo e o status do usuário
    echo json_encode(['success' => true, 'tipo' => $usuario['tipo'], 'status' => $usuario['status']]);
} catch (PDOException $e) {
    http_response_code(500); // Erro no servidor
    echo json_encode(['success' => false, 'message' => 'Erro no servidor: ' . $e->getMessage()]);
}
?>

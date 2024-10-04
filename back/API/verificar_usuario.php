<?php
// back/api/login.php

include 'cors.php'; // Inclui as configurações de CORS
header('Access-Control-Allow-Methods: POST');



require_once 'db.php';
// Obtém os dados enviados
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['cpf']) || !isset($data['tipo'])) {
    http_response_code(400); // Requisição inválida
    echo json_encode(['success' => false, 'message' => 'CPF e tipo são obrigatórios.']);
    exit();
}

$cpf = $data['cpf'];
$tipo = $data['tipo'];

try {
    $db = new Database();
    $pdo = $db->getConnection();

    // Verifica se o CPF e o tipo de usuário existem na tabela
    $stmt = $pdo->prepare('SELECT id_usuario, nome, status FROM usuario WHERE cpf = :cpf AND tipo = :tipo');
    $stmt->execute(['cpf' => $cpf, 'tipo' => $tipo]);
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($usuario) {
        // Usuário encontrado, retorna o status
        echo json_encode([
            'success' => true,
            'message' => 'Usuário encontrado.',
            'usuario_id' => $usuario['id_usuario'],
            'nome' => $usuario['nome'],
            'status' => $usuario['status']  // Incluindo o status do usuário
        ]);
    } else {
        // Usuário não encontrado
        echo json_encode(['success' => false, 'message' => 'Usuário não encontrado com o CPF e tipo fornecidos.']);
    }
} catch (PDOException $e) {
    http_response_code(500); // Erro interno do servidor
    echo json_encode(['success' => false, 'message' => 'Erro no servidor: ' . $e->getMessage()]);
}
?>
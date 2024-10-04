<?php
// back/api/login.php

include 'cors.php'; // Inclui as configurações de CORS
header('Access-Control-Allow-Methods: POST');

// Lidar com preflight (requisição OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200); // Retorna 200 OK para a requisição preflight
    exit();
}

session_start();


// header('Access-Control-Allow-Origin: *');
// header('Access-Control-Allow-Headers: Content-Type');
// header('Access-Control-Allow-Methods: POST');

require_once 'db.php';

// Obtém os dados enviados
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['cpf']) || !isset($data['password'])) {
    http_response_code(400); // Requisição inválida
    echo json_encode(['success' => false, 'message' => 'CPF e senha são obrigatórios.']);
    exit();
}

$cpf = $data['cpf'];
$password = $data['password'];

try {
    $db = new Database();
    $pdo = $db->getConnection();

    // Consulta o usuário pelo CPF e verifica também o status
    $stmt = $pdo->prepare('SELECT id_usuario, nome, cpf, tipo, password, status FROM usuario WHERE cpf = :cpf');
    $stmt->execute(['cpf' => $cpf]);
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($usuario) {
        // Verifica se o status é ativo
        if ($usuario['status'] !== 'ativo') {
            echo json_encode(['success' => false, 'message' => 'Usuário desativado.']);
            exit();
        }

        // Verifica a senha
        if (password_verify($password, $usuario['password'])) {
            // Sucesso no login - cria a sessão
            $_SESSION['usuario_id'] = $usuario['id_usuario'];
            $_SESSION['usuario_tipo'] = $usuario['tipo'];

            // Retorna o sucesso do login junto com o tipo de usuário, nome e CPF
            echo json_encode([
                'success' => true,
                'message' => 'Login realizado com sucesso.',
                'usuario_tipo' => $usuario['tipo'], // Retorna o tipo de usuário
                'nome' => $usuario['nome'],         // Retorna o nome do usuário
                'cpf' => $usuario['cpf']            // Retorna o CPF do usuário
            ]);
        } else {
            // Senha incorreta
            http_response_code(401); // Não autorizado
            echo json_encode(['success' => false, 'message' => 'CPF ou senha inválidos.']);
        }
    } else {
        // Usuário não encontrado
        http_response_code(401); // Não autorizado
        echo json_encode(['success' => false, 'message' => 'CPF ou senha inválidos.']);
    }
} catch (PDOException $e) {
    http_response_code(500); // Erro interno do servidor
    echo json_encode(['success' => false, 'message' => 'Erro no servidor: ' . $e->getMessage()]);
}
?>
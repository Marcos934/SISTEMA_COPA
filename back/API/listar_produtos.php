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

if (!isset($data['cpf'])) {
    http_response_code(400); // Requisição inválida
    echo json_encode(['success' => false, 'message' => 'CPF é obrigatório.']);
    exit();
}

$cpf = $data['cpf'];

try {
    $db = new Database();
    $pdo = $db->getConnection();

    // Verifica se o CPF fornecido pertence a um usuário ativo e qual o tipo (AD ou CS)
    $stmt = $pdo->prepare('SELECT tipo, status FROM usuario WHERE cpf = :cpf');
    $stmt->execute(['cpf' => $cpf]);
    $usuario = $stmt->fetch();

    if (!$usuario) {
        http_response_code(404); // Não encontrado
        echo json_encode(['success' => false, 'message' => 'Usuário não encontrado.']);
        exit();
    }

    // Verifica se o usuário está ativo
    if ($usuario['status'] !== 'ativo') {
        http_response_code(403); // Proibido
        echo json_encode(['success' => false, 'message' => 'Usuário não está ativo.']);
        exit();
    }

    // Permite o acesso completo para administradores
    if ($usuario['tipo'] === 'AD') {
        // Lista todos os produtos para administradores
        $stmt = $pdo->prepare('SELECT * FROM produto');
        $stmt->execute();
        $produtos = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(['success' => true, 'produtos' => $produtos]);

    // Aplica a regra de negócio para usuários CS
    } elseif ($usuario['tipo'] === 'CS') {
        // Lista apenas os produtos com quantidade > 0 e status_produto = 'ativo'
        $stmt = $pdo->prepare('SELECT * FROM produto WHERE qntd > 0 AND status_produto = "ativo"');
        $stmt->execute();
        $produtos = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(['success' => true, 'produtos' => $produtos]);
    } else {
        http_response_code(403); // Proibido
        echo json_encode(['success' => false, 'message' => 'Acesso negado.']);
    }
} catch (PDOException $e) {
    http_response_code(500); // Erro interno do servidor
    echo json_encode(['success' => false, 'message' => 'Erro no servidor: ' . $e->getMessage()]);
}
?>
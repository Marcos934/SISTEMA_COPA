<?php
// back/api/editar_usuario.php

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

if (!isset($data['admin_cpf']) || !isset($data['id_usuario'])) {
    http_response_code(400); // Requisição inválida
    echo json_encode(['success' => false, 'message' => 'CPF do administrador e ID do usuário são obrigatórios.']);
    exit();
}

$admin_cpf = $data['admin_cpf'];
$id_usuario = $data['id_usuario'];

// Dados que podem ser editados
$nome = isset($data['nome']) ? $data['nome'] : null;
$telefone = isset($data['telefone']) ? $data['telefone'] : null;
$status = isset($data['status']) ? $data['status'] : null;
$password = isset($data['password']) ? $data['password'] : null;
$tipo = isset($data['tipo']) ? $data['tipo'] : null; // Novo campo para editar o tipo de usuário

try {
    $db = new Database();
    $pdo = $db->getConnection();

    // Verifica se o CPF fornecido pertence a um administrador (tipo AD)
    $stmt = $pdo->prepare('SELECT * FROM usuario WHERE cpf = :cpf AND tipo = "AD"');
    $stmt->execute(['cpf' => $admin_cpf]);
    $admin = $stmt->fetch();

    if (!$admin) {
        http_response_code(403); // Proibido
        echo json_encode(['success' => false, 'message' => 'Acesso negado. Apenas administradores podem editar usuários.']);
        exit();
    }

    // Verifica se o usuário que será editado existe
    $stmt = $pdo->prepare('SELECT * FROM usuario WHERE id_usuario = :id_usuario');
    $stmt->execute(['id_usuario' => $id_usuario]);
    $usuario = $stmt->fetch();

    if (!$usuario) {
        http_response_code(404); // Não encontrado
        echo json_encode(['success' => false, 'message' => 'Usuário não encontrado.']);
        exit();
    }

    // Constrói a query de atualização dinamicamente
    $campos = [];
    $valores = ['id_usuario' => $id_usuario];

    if ($nome) {
        $campos[] = 'nome = :nome';
        $valores['nome'] = $nome;
    }
    if ($telefone) {
        $campos[] = 'telefone = :telefone';
        $valores['telefone'] = $telefone;
    }
    if ($status) {
        $campos[] = 'status = :status';
        $valores['status'] = $status;
    }
    if ($password) {
        // Se a senha for fornecida, cria o hash
        $campos[] = 'password = :password';
        $valores['password'] = password_hash($password, PASSWORD_DEFAULT);
    }
    if ($tipo && in_array($tipo, ['AD', 'CS'])) {
        // Verifica se o tipo é válido antes de alterar
        $campos[] = 'tipo = :tipo';
        $valores['tipo'] = $tipo;
    }

    // Se houver campos para atualizar, executa a query
    if (count($campos) > 0) {
        $sql = 'UPDATE usuario SET ' . implode(', ', $campos) . ' WHERE id_usuario = :id_usuario';
        $stmt = $pdo->prepare($sql);
        $stmt->execute($valores);

        echo json_encode(['success' => true, 'message' => 'Usuário atualizado com sucesso.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Nenhum campo para atualizar.']);
    }
} catch (PDOException $e) {
    http_response_code(500); // Erro interno do servidor
    echo json_encode(['success' => false, 'message' => 'Erro no servidor: ' . $e->getMessage()]);
}
?>
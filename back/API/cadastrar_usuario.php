<?php
// back/api/cadastrar_usuario.php
include 'cors.php'; // Inclui as configurações de CORS
header('Access-Control-Allow-Methods: POST');

require_once 'db.php';

// Obtém os dados enviados
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['nome']) || !isset($data['cpf']) || !isset($data['tipo']) || !isset($data['password']) || !isset($data['admin_cpf'])) {
    http_response_code(400); // Requisição inválida
    echo json_encode(['success' => false, 'message' => 'Parâmetros inválidos.']);
    exit();
}

// Dados do novo usuário
$nome = $data['nome'];
$cpf = $data['cpf'];
$tipo = $data['tipo'];
$password = $data['password'];
$admin_cpf = $data['admin_cpf'];
$telefone = isset($data['telefone']) ? $data['telefone'] : null;

// Verifica se o tipo de usuário é válido (AD ou CS)
if (!in_array($tipo, ['AD', 'CS'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Tipo de usuário inválido.']);
    exit();
}

try {
    $db = new Database();
    $pdo = $db->getConnection();

    // Verifica se o CPF do administrador é válido
    $stmt = $pdo->prepare('SELECT * FROM usuario WHERE cpf = :cpf AND tipo = "AD"');
    $stmt->execute(['cpf' => $admin_cpf]);
    $admin = $stmt->fetch();

    if (!$admin) {
        http_response_code(403); // Proibido
        echo json_encode(['success' => false, 'message' => 'Acesso negado. Apenas administradores podem cadastrar usuários.']);
        exit();
    }

    // Verifica se o CPF do novo usuário já existe no sistema
    $stmt = $pdo->prepare('SELECT * FROM usuario WHERE cpf = :cpf');
    $stmt->execute(['cpf' => $cpf]);
    if ($stmt->fetch()) {
        http_response_code(409); // Conflito
        echo json_encode(['success' => false, 'message' => 'Usuário com esse CPF já existe.']);
        exit();
    }

    // Cria o hash da senha
    $password_hash = password_hash($password, PASSWORD_DEFAULT);

    // Insere o novo usuário no banco de dados com status "ativo"
    $stmt = $pdo->prepare('INSERT INTO usuario (nome, cpf, tipo, password, telefone, status) VALUES (:nome, :cpf, :tipo, :password, :telefone, :status)');
    $stmt->execute([
        'nome' => $nome,
        'cpf' => $cpf,
        'tipo' => $tipo,
        'password' => $password_hash,
        'telefone' => $telefone,
        'status' => 'ativo'  // Status definido como "ativo" por padrão
    ]);

    echo json_encode(['success' => true, 'message' => 'Usuário cadastrado com sucesso.']);
} catch (PDOException $e) {
    http_response_code(500); // Erro interno do servidor
    echo json_encode(['success' => false, 'message' => 'Erro no servidor: ' . $e->getMessage()]);
}
?>

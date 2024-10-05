<?php
// back/api/cadastrar_produto.php
include 'cors.php'; // Inclui as configurações de CORS
header('Access-Control-Allow-Methods: POST');
session_start();

// header('Content-Type: application/json');
// header('Access-Control-Allow-Origin: *');
// header('Access-Control-Allow-Headers: Content-Type');
// header('Access-Control-Allow-Methods: POST');

// Verifica se o usuário está autenticado e se é administrador
// if (!isset($_SESSION['usuario_id']) || $_SESSION['usuario_tipo'] !== 'AD') {
//     http_response_code(403); // Proibido
//     echo json_encode(['success' => false, 'message' => 'Acesso negado. Apenas administradores podem cadastrar produtos.']);
//     exit();
// }

require_once 'db.php';

require_once 'db.php';

// Obtém os dados enviados
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['admin_cpf']) || !isset($data['nome']) || !isset($data['tipo']) || !isset($data['preco']) || !isset($data['qntd'])) {
    http_response_code(400); // Requisição inválida
    echo json_encode(['success' => false, 'message' => 'Parâmetros inválidos. Todos os campos obrigatórios devem ser preenchidos.']);
    exit();
}

$admin_cpf = $data['admin_cpf'];
$nome = $data['nome'];
$tipo = $data['tipo'];
$preco = $data['preco'];
$qntd = $data['qntd'];
$informacao = isset($data['informacao']) ? $data['informacao'] : null;
$url_img = isset($data['url_img']) ? $data['url_img'] : null; // URL opcional

// Valida a URL da imagem (se fornecida)
if ($url_img && !preg_match('/^https?:\/\/.+$/', $url_img)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'URL da imagem inválida. Ela deve começar com http ou https.']);
    exit();
}

// Verifica se o tipo de produto é válido (COMIDA ou BEBIDA)
if (!in_array($tipo, ['COMIDA', 'BEBIDA'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Tipo de produto inválido.']);
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
        echo json_encode(['success' => false, 'message' => 'Acesso negado. Apenas administradores podem cadastrar produtos.']);
        exit();
    }

    // Insere o novo produto no banco de dados
    $stmt = $pdo->prepare('INSERT INTO produto (nome, tipo, preco, qntd, informacao, url_img) VALUES (:nome, :tipo, :preco, :qntd, :informacao, :url_img)');
    $stmt->execute([
        'nome' => $nome,
        'tipo' => $tipo,
        'preco' => $preco,
        'qntd' => $qntd,
        'informacao' => $informacao,
        'url_img' => $url_img // URL da imagem (pode ser nula)
    ]);

    echo json_encode(['success' => true, 'message' => 'Produto cadastrado com sucesso.']);
} catch (PDOException $e) {
    http_response_code(500); // Erro interno do servidor
    echo json_encode(['success' => false, 'message' => 'Erro no servidor: ' . $e->getMessage()]);
}
?>
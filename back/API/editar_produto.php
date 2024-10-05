<?php
// back/api/editar_produto.php
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
//     echo json_encode(['success' => false, 'message' => 'Acesso negado. Apenas administradores podem editar produtos.']);
//     exit();
// }


require_once 'db.php';

// Obtém os dados enviados
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['admin_cpf']) || !isset($data['id_produto']) || !isset($data['qntd'])) {
    http_response_code(400); // Requisição inválida
    echo json_encode(['success' => false, 'message' => 'CPF do administrador, ID do produto e quantidade são obrigatórios.']);
    exit();
}

$admin_cpf = $data['admin_cpf'];
$id_produto = $data['id_produto'];
$qntd = $data['qntd'];

// Outros campos opcionais para atualização
$nome = isset($data['nome']) ? $data['nome'] : null;
$tipo = isset($data['tipo']) ? $data['tipo'] : null;
$preco = isset($data['preco']) ? $data['preco'] : null;
$informacao = isset($data['informacao']) ? $data['informacao'] : null;
$url_img = isset($data['url_img']) ? $data['url_img'] : null; // URL opcional
$status_produto = isset($data['status_produto']) ? $data['status_produto'] : null; // Status opcional

// Valida a URL da imagem (se fornecida)
if ($url_img && !preg_match('/^https?:\/\/.+$/', $url_img)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'URL da imagem inválida. Ela deve começar com http ou https.']);
    exit();
}

// Valida o status do produto (se fornecido)
if ($status_produto && !in_array($status_produto, ['ativo', 'inativo'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Status do produto inválido. Use "ativo" ou "inativo".']);
    exit();
}

try {
    $db = new Database();
    $pdo = $db->getConnection();

    // Verifica se o CPF fornecido pertence a um administrador (tipo AD)
    $stmt = $pdo->prepare('SELECT * FROM usuario WHERE cpf = :cpf AND tipo = "AD"');
    $stmt->execute(['cpf' => $admin_cpf]);
    $admin = $stmt->fetch();

    if (!$admin) {
        http_response_code(403); // Proibido
        echo json_encode(['success' => false, 'message' => 'Acesso negado. Apenas administradores podem editar produtos.']);
        exit();
    }

    // Verifica se o produto que será editado existe
    $stmt = $pdo->prepare('SELECT * FROM produto WHERE id_produto = :id_produto');
    $stmt->execute(['id_produto' => $id_produto]);
    $produto = $stmt->fetch();

    if (!$produto) {
        http_response_code(404); // Não encontrado
        echo json_encode(['success' => false, 'message' => 'Produto não encontrado.']);
        exit();
    }

    // Constrói a query de atualização dinamicamente
    $campos = [];
    $valores = ['id_produto' => $id_produto, 'qntd' => $qntd];

    if ($nome) {
        $campos[] = 'nome = :nome';
        $valores['nome'] = $nome;
    }
    if ($tipo && in_array($tipo, ['COMIDA', 'BEBIDA'])) {
        $campos[] = 'tipo = :tipo';
        $valores['tipo'] = $tipo;
    }
    if ($preco) {
        $campos[] = 'preco = :preco';
        $valores['preco'] = $preco;
    }
    if ($informacao) {
        $campos[] = 'informacao = :informacao';
        $valores['informacao'] = $informacao;
    }
    if ($url_img) {
        $campos[] = 'url_img = :url_img';
        $valores['url_img'] = $url_img;
    }
    if ($status_produto) {
        $campos[] = 'status_produto = :status_produto';
        $valores['status_produto'] = $status_produto;
    }

    // A quantidade é obrigatória e será sempre atualizada
    $campos[] = 'qntd = :qntd';

    // Se houver campos para atualizar, executa a query
    if (count($campos) > 0) {
        $sql = 'UPDATE produto SET ' . implode(', ', $campos) . ' WHERE id_produto = :id_produto';
        $stmt = $pdo->prepare($sql);
        $stmt->execute($valores);

        echo json_encode(['success' => true, 'message' => 'Produto atualizado com sucesso.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Nenhum campo para atualizar.']);
    }
} catch (PDOException $e) {
    http_response_code(500); // Erro interno do servidor
    echo json_encode(['success' => false, 'message' => 'Erro no servidor: ' . $e->getMessage()]);
}
?>
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
if (!isset($_SESSION['usuario_id']) || $_SESSION['usuario_tipo'] !== 'AD') {
    http_response_code(403); // Proibido
    echo json_encode(['success' => false, 'message' => 'Acesso negado. Apenas administradores podem editar produtos.']);
    exit();
}

require_once 'db.php';

// Obtém os dados enviados
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['id_produto'])) {
    http_response_code(400); // Requisição inválida
    echo json_encode(['success' => false, 'message' => 'ID do produto é obrigatório.']);
    exit();
}

$id_produto = $data['id_produto'];

// Monta a query dinamicamente com base nos campos fornecidos
$campos_para_atualizar = [];
$parametros = ['id_produto' => $id_produto];

if (isset($data['nome'])) {
    $campos_para_atualizar[] = 'nome = :nome';
    $parametros['nome'] = $data['nome'];
}

if (isset($data['tipo'])) {
    // Verifica se o tipo de produto é válido (COMIDA ou BEBIDA)
    if (!in_array($data['tipo'], ['COMIDA', 'BEBIDA'])) {
        http_response_code(400); // Requisição inválida
        echo json_encode(['success' => false, 'message' => 'Tipo de produto inválido.']);
        exit();
    }
    $campos_para_atualizar[] = 'tipo = :tipo';
    $parametros['tipo'] = $data['tipo'];
}

if (isset($data['preco'])) {
    $campos_para_atualizar[] = 'preco = :preco';
    $parametros['preco'] = $data['preco'];
}

if (isset($data['qntd'])) {
    $campos_para_atualizar[] = 'qntd = :qntd';
    $parametros['qntd'] = $data['qntd'];
}

if (isset($data['informacao'])) {
    $campos_para_atualizar[] = 'informacao = :informacao';
    $parametros['informacao'] = $data['informacao'];
}

// Se não houver campos para atualizar, retorna uma mensagem
if (empty($campos_para_atualizar)) {
    echo json_encode(['success' => false, 'message' => 'Nenhum campo para atualizar.']);
    exit();
}

try {
    // Conecta ao banco de dados
    $db = new Database();
    $pdo = $db->getConnection();

    // Atualiza os dados do produto
    $sql = 'UPDATE produto SET ' . implode(', ', $campos_para_atualizar) . ' WHERE id_produto = :id_produto';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($parametros);

    if ($stmt->rowCount()) {
        echo json_encode(['success' => true, 'message' => 'Produto atualizado com sucesso.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Nenhuma alteração feita ou produto não encontrado.']);
    }
} catch (PDOException $e) {
    http_response_code(500); // Erro interno do servidor
    echo json_encode(['success' => false, 'message' => 'Erro no servidor: ' . $e->getMessage()]);
}
?>

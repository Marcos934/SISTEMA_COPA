<?php
// back/api/listar_compras_usuario.php
include 'cors.php'; // Inclui as configurações de CORS
header('Access-Control-Allow-Methods: GET');
session_start();

// header('Content-Type: application/json');
// header('Access-Control-Allow-Origin: *');
// header('Access-Control-Allow-Headers: Content-Type');
// header('Access-Control-Allow-Methods: GET');

// Verifica se o usuário está autenticado
// if (!isset($_SESSION['usuario_id'])) {
//     http_response_code(401); // Não autorizado
//     echo json_encode(['success' => false, 'message' => 'Usuário não autenticado.']);
//     exit();
// }
require_once 'db.php';

// Obtém os dados enviados
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['cpf'])) {
    http_response_code(400); // Requisição inválida
    echo json_encode(['success' => false, 'message' => 'CPF do usuário é obrigatório.']);
    exit();
}

$cpf = $data['cpf'];
$data_inicial = isset($data['data_inicial']) ? $data['data_inicial'] : null;
$data_final = isset($data['data_final']) ? $data['data_final'] : null;
$pgto = isset($data['pgto']) ? $data['pgto'] : null;

try {
    $db = new Database();
    $pdo = $db->getConnection();

    // Verifica se o CPF fornecido pertence a um usuário ativo
    $stmt = $pdo->prepare('SELECT id_usuario, status FROM usuario WHERE cpf = :cpf');
    $stmt->execute(['cpf' => $cpf]);
    $usuario = $stmt->fetch();

    if (!$usuario) {
        http_response_code(404); // Usuário não encontrado
        echo json_encode(['success' => false, 'message' => 'Usuário não encontrado.']);
        exit();
    }

    // Verifica se o usuário está ativo
    if ($usuario['status'] !== 'ativo') {
        http_response_code(403); // Proibido
        echo json_encode(['success' => false, 'message' => 'Usuário inativo.']);
        exit();
    }

    $usuario_id = $usuario['id_usuario'];

    // Consulta o histórico de compras do usuário com ou sem filtro de data e pgto
    $sql = '
        SELECT c.id_compra, p.nome AS nome_produto, cp.quantidade, c.total, c.data, c.pgto
        FROM compra c
        JOIN compra_produto cp ON c.id_compra = cp.fk_id_compra
        JOIN produto p ON cp.fk_id_produto = p.id_produto
        WHERE c.fk_id_usuario = :usuario_id';

    // Adiciona o filtro de data, ignorando horas
    if ($data_inicial && $data_final) {
        $sql .= ' AND DATE(c.data) BETWEEN :data_inicial AND :data_final';
    }

    // Adiciona o filtro de pgto se enviado
    if ($pgto) {
        $sql .= ' AND c.pgto = :pgto';
    }

    // Ordena do mais antigo para o mais recente
    $sql .= ' ORDER BY c.data DESC';
    $stmt = $pdo->prepare($sql);

    // Vincula os parâmetros de data e pgto se enviados
    $params = ['usuario_id' => $usuario_id];
    
    if ($data_inicial && $data_final) {
        $params['data_inicial'] = $data_inicial;
        $params['data_final'] = $data_final;
    }
    
    if ($pgto) {
        $params['pgto'] = $pgto;
    }

    $stmt->execute($params);
    $compras = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'compras' => $compras]);
} catch (PDOException $e) {
    http_response_code(500); // Erro no servidor
    echo json_encode(['success' => false, 'message' => 'Erro no servidor: ' . $e->getMessage()]);
}
?>
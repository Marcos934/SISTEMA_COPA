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
if (!isset($_SESSION['usuario_id'])) {
    http_response_code(401); // Não autorizado
    echo json_encode(['success' => false, 'message' => 'Usuário não autenticado.']);
    exit();
}

require_once 'db.php';

// Obtém os parâmetros de data, se fornecidos
$data_inicial = isset($_GET['data_inicial']) ? $_GET['data_inicial'] : null;
$data_final = isset($_GET['data_final']) ? $_GET['data_final'] : null;

// ID do usuário logado
$usuario_id = $_SESSION['usuario_id'];

try {
    // Conecta ao banco de dados
    $db = new Database();
    $pdo = $db->getConnection();

    // Cria a query de base
    $sql = '
        SELECT compra.id_compra, compra.total, compra.data 
        FROM compra
        WHERE compra.fk_id_usuario = :usuario_id
    ';

    // Adiciona condições de data se os parâmetros forem fornecidos (considerando apenas a parte da data)
    $parametros = ['usuario_id' => $usuario_id];
    if ($data_inicial && $data_final) {
        $sql .= ' AND DATE(compra.data) BETWEEN :data_inicial AND :data_final';
        $parametros['data_inicial'] = $data_inicial;
        $parametros['data_final'] = $data_final;
    } elseif ($data_inicial) {
        $sql .= ' AND DATE(compra.data) >= :data_inicial';
        $parametros['data_inicial'] = $data_inicial;
    } elseif ($data_final) {
        $sql .= ' AND DATE(compra.data) <= :data_final';
        $parametros['data_final'] = $data_final;
    }

    // Ordena por data da compra (mais recente primeiro)
    $sql .= ' ORDER BY compra.data DESC';

    // Executa a consulta
    $stmt = $pdo->prepare($sql);
    $stmt->execute($parametros);
    $compras = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'compras' => $compras]);
} catch (PDOException $e) {
    http_response_code(500); // Erro interno do servidor
    echo json_encode(['success' => false, 'message' => 'Erro no servidor: ' . $e->getMessage()]);
}
?>

<?php
// back/api/produtos.php
include 'cors.php'; // Inclui as configurações de CORS
header('Access-Control-Allow-Methods: GET');
session_start();

// header('Content-Type: application/json');

// // Configurar CORS
// header('Access-Control-Allow-Origin: *');
// header('Access-Control-Allow-Headers: Content-Type');
// header('Access-Control-Allow-Methods: GET');

// Verifica se o usuário está autenticado
if (!isset($_SESSION['usuario_id'])) {
    http_response_code(401); // Não autorizado
    echo json_encode(['success' => false, 'message' => 'Usuário não autenticado']);
    exit();
}

require_once 'db.php';

// Conecta ao banco de dados
$db = new Database();
$pdo = $db->getConnection();

// Consulta os produtos no banco de dados
$stmt = $pdo->query('SELECT * FROM produto');
$produtos = $stmt->fetchAll();

echo json_encode(['success' => true, 'produtos' => $produtos]);
?>

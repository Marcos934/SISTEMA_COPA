<?php
// back/api/logout.php
include 'cors.php'; // Inclui as configurações de CORS
header('Access-Control-Allow-Methods: POST');
session_start();

// header('Content-Type: application/json');

// Configurar CORS
// header('Access-Control-Allow-Origin: *');
// header('Access-Control-Allow-Headers: Content-Type');
// header('Access-Control-Allow-Methods: POST');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Método não permitido
    echo json_encode(['success' => false, 'message' => 'Método não permitido']);
    exit();
}

// Encerra a sessão
session_unset();
session_destroy();

echo json_encode(['success' => true, 'message' => 'Logout realizado com sucesso']);
?>

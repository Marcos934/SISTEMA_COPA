<?php

include 'cors.php'; // Inclui as configurações de CORS
header('Access-Control-Allow-Methods: GET');
session_start();

// header('Content-Type: application/json');
// header('Access-Control-Allow-Origin: *');
// header('Access-Control-Allow-Methods: GET');
// header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Verifica se o usuário está autenticado
if (isset($_SESSION['usuario_id']) && isset($_SESSION['usuario_tipo'])) {
    // Sessão está aberta, retorna o tipo de usuário e o nome
    echo json_encode([
        'success' => true,
        'message' => 'Sessão está ativa.',
        'usuario_id' => $_SESSION['usuario_id'],
        'usuario_tipo' => $_SESSION['usuario_tipo'],
    ]);
} else {
    // Sessão não está aberta
    echo json_encode([
        'success' => false,
        'message' => 'Usuário não autenticado.'
    ]);
}
?>

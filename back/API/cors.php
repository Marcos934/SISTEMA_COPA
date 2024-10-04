<?php
// Habilitar CORS
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Permitir todas as origens, ou especifique um domínio específico
// header('Access-Control-Allow-Methods: POST, GET, OPTIONS'); // Permitir métodos POST, GET e OPTIONS
header('Access-Control-Allow-Headers: Content-Type, Authorization'); // Permitir cabeçalhos como Content-Type e Authorization

// Lidar com preflight (requisição OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200); // Retorna 200 OK para a requisição preflight
    exit();
}
?>

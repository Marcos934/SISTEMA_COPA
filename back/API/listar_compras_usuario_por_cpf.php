<?php
// back/api/listar_compras_usuario_por_cpf.php
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
    echo json_encode(['success' => false, 'message' => 'Acesso negado. Apenas administradores podem acessar essa função.']);
    exit();
}

require_once 'db.php';

// Obtém os dados enviados
$data = json_decode(file_get_contents('php://input'), true);

// Verifica se o CPF foi fornecido
if (!isset($data['cpf'])) {
    http_response_code(400); // Requisição inválida
    echo json_encode(['success' => false, 'message' => 'CPF é obrigatório.']);
    exit();
}

$cpf = $data['cpf'];
$data_inicial = isset($data['data_inicial']) ? $data['data_inicial'] : null;
$data_final = isset($data['data_final']) ? $data['data_final'] : null;
$status_pgto = isset($data['status_pgto']) ? $data['status_pgto'] : null; // "pendente" ou "pago"

try {
    // Conecta ao banco de dados
    $db = new Database();
    $pdo = $db->getConnection();

    // Verifica se o usuário com o CPF fornecido existe
    $stmt = $pdo->prepare('SELECT id_usuario FROM usuario WHERE cpf = :cpf');
    $stmt->execute(['cpf' => $cpf]);
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$usuario) {
        echo json_encode(['success' => false, 'message' => 'Usuário não encontrado.']);
        exit();
    }

    $usuario_id = $usuario['id_usuario'];

    // Cria a query para listar as compras do usuário
    $sql = '
        SELECT compra.id_compra, compra.total, compra.data, compra.pgto 
        FROM compra 
        WHERE compra.fk_id_usuario = :usuario_id
    ';

    // Adiciona condições de data se os parâmetros forem fornecidos (usando DATE() para ignorar o horário)
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

    // Executa a consulta para listar as compras
    $stmt = $pdo->prepare($sql);
    $stmt->execute($parametros);
    $compras = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Se o administrador quiser alterar o status de pagamento
    if ($status_pgto && in_array($status_pgto, ['pendente', 'pago'])) {
        foreach ($compras as &$compra) {
            // Atualiza o status de pagamento para cada compra listada
            $stmt = $pdo->prepare('UPDATE compra SET pgto = :pgto WHERE id_compra = :id_compra');
            $stmt->execute([
                'pgto' => $status_pgto,
                'id_compra' => $compra['id_compra']
            ]);
            // Atualiza o campo de pagamento nas compras retornadas
            $compra['pgto'] = $status_pgto;
        }
    }

    echo json_encode(['success' => true, 'compras' => $compras]);
} catch (PDOException $e) {
    http_response_code(500); // Erro interno do servidor
    echo json_encode(['success' => false, 'message' => 'Erro no servidor: ' . $e->getMessage()]);
}
?>

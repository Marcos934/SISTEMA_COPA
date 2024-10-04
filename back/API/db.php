<?php
// back/api/db.php

class Database {
    private $pdo;

    public function __construct() {
        $config = require_once __DIR__ . '/../config/config.php';

        try {
            $this->pdo = new PDO(
                "mysql:host={$config['db_host']};dbname={$config['db_name']};charset=utf8",
                $config['db_user'],
                $config['db_pass']
            );
            // Configura o PDO para lançar exceções em caso de erro
            $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            // Configura o PDO para retornar em formato de array associativo
            $this->pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            // Em produção, você pode querer registrar o erro em vez de exibi-lo
            die('Erro ao conectar com o banco de dados: ' . $e->getMessage());
        }
    }

    public function getConnection() {
        return $this->pdo;
    }
}
?>

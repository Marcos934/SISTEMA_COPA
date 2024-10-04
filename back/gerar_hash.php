<?php
$senha = '123'; // Substitua pela senha do usuário
$hash = password_hash($senha, PASSWORD_DEFAULT);
echo $hash;
?>
# SISTEMA_COPA

**Desenvolvedor:** Marcos Vinicius Mulinari  
**Email:** marcos.mulinari97@gmail.com

## 📋 Descrição do Sistema

O Sistema Copa é uma aplicação web completa para gerenciamento de vendas e compras em um ambiente corporativo, desenvolvida especificamente para a GoldZone. O sistema permite o controle de produtos, usuários, compras e relatórios financeiros.

## 🏗️ Arquitetura do Sistema

### Frontend
O frontend está localizado na pasta `front/` e é organizado da seguinte forma:

```
front/
├── assets/
│   ├── css/          # Estilos customizados
│   ├── img/          # Imagens e logos
│   │   ├── img_prod/ # Imagens dos produtos
│   │   ├── logo-gdz.png
│   │   └── sirva-se.webp
│   └── js/           # Scripts JavaScript
│       ├── cadastrar_produto.js
│       ├── cadastrar_usuario.js
│       ├── comprar.js
│       ├── config.js
│       ├── detalhes_usuario.js
│       ├── editar_produto.js
│       ├── editar_usuario.js
│       ├── historico_compras.js
│       ├── login.js
│       ├── menu-gdz.js
│       ├── menu.js
│       ├── menu_usuario.js
│       └── relatorio.js
└── html/
    ├── cadastrar_produto.html
    ├── cadastrar_usuario.html
    ├── detalhes_usuario.html
    ├── editar_produto.html
    ├── editar_usuario.html
    ├── historico_compras.html
    ├── login.html
    ├── menu-gdz.html    # Menu administrativo
    ├── menu.html        # Menu do usuário comum
    └── relatorio.html
```

### Backend
O backend está localizado na pasta `back/` e segue uma arquitetura RESTful:

```
back/
├── .htaccess         # Configurações do Apache
├── config/
│   └── config.php    # Configurações do banco de dados
├── API/
│   ├── alterar_status_pgto.php
│   ├── cadastrar_produto.php
│   ├── cadastrar_usuario.php
│   ├── comprar.php
│   ├── cors.php      # Configurações CORS
│   ├── db.php        # Classe de conexão com banco
│   ├── editar_produto.php
│   ├── editar_usuario.php
│   ├── listar_compras.php
│   ├── listar_compras_usuario.php
│   ├── listar_compras_usuario_por_cpf.php
│   ├── listar_produtos.php
│   ├── listar_usuarios.php
│   ├── login.php
│   ├── logout.php
│   ├── produtos.php
│   ├── relatorio_pendencia.php
│   ├── verificar_sessao.php
│   ├── verificar_tipo_usuario.php
│   └── verificar_usuario.php
└── gerar_hash.php    # Utilitário para gerar hashes
```

## 🛠️ Tecnologias Utilizadas

### Frontend
- **HTML5** - Estrutura das páginas
- **CSS3** - Estilização
- **Bootstrap 5.3.0** - Framework CSS responsivo
- **Bootstrap Icons** - Ícones
- **JavaScript ES6+** - Lógica do frontend
- **Fetch API** - Comunicação com o backend
- **LocalStorage** - Armazenamento local de sessão

### Backend
- **PHP 7.4+** - Linguagem de programação
- **MySQL** - Sistema de gerenciamento de banco de dados
- **PDO** - Interface de acesso ao banco de dados
- **JSON** - Formato de troca de dados
- **Apache** - Servidor web

### Banco de Dados
- **MySQL** com charset UTF-8
- **Estrutura relacional** com chaves estrangeiras
- **Tabelas principais:**
  - `usuario` - Gerenciamento de usuários
  - `produto` - Catálogo de produtos
  - `compra` - Registro de compras
  - `compra_produto` - Relação many-to-many entre compras e produtos
  - `carteira` - Controle financeiro dos usuários

## 🗄️ Estrutura do Banco de Dados

### Tabela `usuario`
- `id_usuario` (INT, AUTO_INCREMENT, PRIMARY KEY)
- `nome` (VARCHAR(100), NOT NULL)
- `tipo` (ENUM('AD', 'CS'), NOT NULL) - AD: Administrador, CS: Cliente
- `password` (VARCHAR(255), NOT NULL)
- `cpf` (VARCHAR(14), UNIQUE)
- `status` (ENUM('ativo', 'inativo'))

### Tabela `produto`
- `id_produto` (INT, AUTO_INCREMENT, PRIMARY KEY)
- `nome` (VARCHAR(100), NOT NULL)
- `tipo` (ENUM('COMIDA', 'BEBIDA'), NOT NULL)
- `preco` (DECIMAL(10, 2), NOT NULL)
- `qntd` (INT, NOT NULL)
- `informacao` (TEXT)

### Tabela `compra`
- `id_compra` (INT, AUTO_INCREMENT, PRIMARY KEY)
- `fk_id_usuario` (INT, NOT NULL, FOREIGN KEY)
- `total` (DECIMAL(10, 2), NOT NULL)
- `data` (DATETIME, DEFAULT CURRENT_TIMESTAMP)

### Tabela `compra_produto`
- `id_compra_produto` (INT, AUTO_INCREMENT, PRIMARY KEY)
- `fk_id_compra` (INT, NOT NULL, FOREIGN KEY)
- `fk_id_produto` (INT, NOT NULL, FOREIGN KEY)
- `quantidade` (INT, NOT NULL)

### Tabela `carteira`
- `id_carteira` (INT, AUTO_INCREMENT, PRIMARY KEY)
- `fk_id_usuario` (INT, NOT NULL, FOREIGN KEY)
- `saldo` (DECIMAL(10, 2), DEFAULT 0.00)
- `total_devedor` (DECIMAL(10, 2), DEFAULT 0.00)
- `data` (DATETIME, DEFAULT CURRENT_TIMESTAMP)

## 🚀 Como Executar o Sistema

### Pré-requisitos
- **XAMPP** ou **WAMP** (Apache + MySQL + PHP)
- **Navegador web** moderno
- **MySQL** configurado e rodando

### Passo a Passo

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/Marcos934/SISTEMA_COPA.git
   ```

2. **Configure o ambiente:**
   - Coloque o projeto na pasta `htdocs` do XAMPP
   - Inicie o Apache e MySQL no painel do XAMPP

3. **Configure o banco de dados:**
   - Acesse o phpMyAdmin (http://localhost/phpmyadmin)
   - Crie um banco de dados chamado `devloo72_goldzone_copa`
   - Execute o script SQL contido no arquivo `SQL.txt`

4. **Configure a conexão:**
   - Edite o arquivo `back/config/config.php`
   - Ajuste as credenciais do banco de dados conforme seu ambiente:
   ```php
   return [
       'db_host' => 'localhost',
       'db_name' => 'devloo72_goldzone_copa',
       'db_user' => 'seu_usuario',
       'db_pass' => 'sua_senha',
       'base_url' => 'http://localhost/SISTEMA_COPA/back/api/'
   ];
   ```

5. **Configure o frontend:**
   - Edite o arquivo `front/assets/js/config.js`
   - Ajuste a URL base se necessário:
   ```javascript
   const config = {
       baseURL: 'http://localhost/SISTEMA_COPA/back/api/'
   };
   ```

6. **Acesse o sistema:**
   - Abra o navegador e acesse: `http://localhost/SISTEMA_COPA/front/html/login.html`
   - Use as credenciais padrão:
     - **Usuário:** mulinari
     - **Senha:** 123

## 👥 Tipos de Usuário

### Administrador (AD)
- Acesso completo ao sistema
- Gerenciamento de produtos
- Gerenciamento de usuários
- Relatórios financeiros
- Controle de status de pagamentos

### Cliente/Usuário Comum (CS)
- Visualização de produtos
- Realização de compras
- Histórico pessoal de compras
- Consulta de saldo e pendências

## 🔧 Funcionalidades Principais

### Sistema de Autenticação
- Login com CPF e senha
- Controle de sessão via LocalStorage
- Verificação de status do usuário
- Redirecionamento baseado no tipo de usuário

### Gerenciamento de Produtos
- Cadastro de produtos (COMIDA/BEBIDA)
- Edição de produtos existentes
- Controle de estoque
- Upload de imagens

### Sistema de Compras
- Carrinho de compras
- Cálculo automático de totais
- Registro de transações
- Controle de estoque automático

### Relatórios e Controle Financeiro
- Histórico de compras por usuário
- Relatórios de pendências
- Controle de carteira digital
- Status de pagamentos

## 🔒 Segurança

- **CORS configurado** para requisições cross-origin
- **Validação de entrada** em todos os endpoints
- **Controle de sessão** e autenticação
- **Prepared statements** para prevenir SQL injection
- **Verificação de permissões** baseada no tipo de usuário

## 📱 Responsividade

O sistema é totalmente responsivo, utilizando Bootstrap 5 para garantir uma experiência consistente em:
- Desktop
- Tablets
- Smartphones

## 🤝 Contribuição

Para contribuir com o projeto:

1. Faça um fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Contato

**Marcos Vinicius Mulinari**  
Email: marcos.mulinari97@gmail.com  
GitHub: [@Marcos934](https://github.com/Marcos934)

---

*Sistema desenvolvido para gerenciamento interno da GoldZone*
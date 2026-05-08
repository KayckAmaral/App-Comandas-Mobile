-- Criação do Banco de Dados
CREATE DATABASE IF NOT EXISTS fastcomanda;
USE fastcomanda;

-- Tabela de Usuários (para autenticação)
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  expo_push_token VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de Clientes
CREATE TABLE IF NOT EXISTS clientes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  telefone VARCHAR(20),
  cpf VARCHAR(14),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de Produtos
CREATE TABLE IF NOT EXISTS produtos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  preco DECIMAL(10, 2) NOT NULL,
  quantidade_estoque INT DEFAULT 0,
  estoque_minimo INT DEFAULT 5,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de Comandas
CREATE TABLE IF NOT EXISTS comandas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT,
  usuario_id INT NOT NULL,
  tipo_venda ENUM('vista', 'fiado') DEFAULT 'vista',
  status ENUM('aberta', 'fechada', 'cancelada') DEFAULT 'aberta',
  valor_total DECIMAL(10, 2) DEFAULT 0.00,
  data_abertura TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_fechamento TIMESTAMP NULL,
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE SET NULL,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabela de Itens da Comanda
CREATE TABLE IF NOT EXISTS comandas_itens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  comanda_id INT NOT NULL,
  produto_id INT NOT NULL,
  quantidade INT NOT NULL,
  preco_unitario DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (comanda_id) REFERENCES comandas(id) ON DELETE CASCADE,
  FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE
);

-- Índices para melhor performance
CREATE INDEX idx_comandas_status ON comandas(status);
CREATE INDEX idx_comandas_data ON comandas(data_abertura);
CREATE INDEX idx_produtos_ativo ON produtos(ativo);
CREATE INDEX idx_clientes_nome ON clientes(nome);

-- Inserir dados de exemplo
INSERT INTO usuarios (nome, email, senha) VALUES 
('Admin', 'admin@fastcomanda.com', '$2a$10$rR5vY4L4qZqZxqZ0qZqZxOYJ1kVYJ1kVYJ1kVYJ1kVYJ1kVYJ1kVY');
-- Senha: admin123 (você deve trocar isso!)

INSERT INTO clientes (nome, telefone, cpf) VALUES 
('João Silva', '(11) 98765-4321', '123.456.789-00'),
('Maria Santos', '(11) 91234-5678', '987.654.321-00'),
('Pedro Oliveira', '(11) 99999-8888', '456.789.123-00');

INSERT INTO produtos (nome, descricao, preco, quantidade_estoque, estoque_minimo) VALUES 
('Hambúrguer Clássico', 'Pão, hambúrguer, queijo, alface e tomate', 25.00, 50, 10),
('Batata Frita', 'Porção de batata frita crocante', 15.00, 30, 5),
('Refrigerante Lata', 'Coca-Cola, Guaraná ou Sprite', 6.00, 100, 20),
('Suco Natural', 'Laranja, limão ou morango', 8.00, 25, 5),
('Pizza Margherita', 'Molho, mussarela e manjericão', 45.00, 15, 3),
('Água Mineral', 'Garrafa 500ml', 3.00, 200, 30);

-- ================ CRIAÇÃO DA TABELA USUARIOS ================
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    foto_perfil VARCHAR(255),
    tipo ENUM('CLIENTE', 'FUNCIONARIO', 'ADM') DEFAULT 'CLIENTE',
    unidade_id INT,
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ================ INSERÇÃO DE DADOS DE TESTE ================
-- Senha: 123456 (hash bcrypt)
INSERT IGNORE INTO usuarios (nome, email, senha, telefone, tipo, unidade_id, ativo) VALUES
('Administrador', 'admin@barbearia.com', '$2a$12$RCctxhp/wWpLUaKP1iSJs.WKvU3Tll.oJWhRvq9ZklUe8Q8bqiPvG', '(11) 99999-9999', 'ADM', NULL, TRUE),
('João Silva', 'joao@email.com', '$2a$12$RCctxhp/wWpLUaKP1iSJs.WKvU3Tll.oJWhRvq9ZklUe8Q8bqiPvG', '(11) 98888-8888', 'CLIENTE', NULL, TRUE),
('Maria Santos', 'maria@email.com', '$2a$12$RCctxhp/wWpLUaKP1iSJs.WKvU3Tll.oJWhRvq9ZklUe8Q8bqiPvG', '(11) 97777-7777', 'CLIENTE', NULL, TRUE),
('Pedro Barbeiro', 'pedro@barbearia.com', '$2a$12$RCctxhp/wWpLUaKP1iSJs.WKvU3Tll.oJWhRvq9ZklUe8Q8bqiPvG', '(11) 96666-6666', 'FUNCIONARIO', 1, TRUE),
('Ana Cabeleireira', 'ana@barbearia.com', '$2a$12$RCctxhp/wWpLUaKP1iSJs.WKvU3Tll.oJWhRvq9ZklUe8Q8bqiPvG', '(11) 95555-5555', 'FUNCIONARIO', 1, TRUE),
('Carlos Cliente', 'carlos@email.com', '$2a$12$RCctxhp/wWpLUaKP1iSJs.WKvU3Tll.oJWhRvq9ZklUe8Q8bqiPvG', '(11) 94444-4444', 'CLIENTE', NULL, FALSE),
('Luiza Funcionaria', 'luiza@barbearia.com', '$2a$12$RCctxhp/wWpLUaKP1iSJs.WKvU3Tll.oJWhRvq9ZklUe8Q8bqiPvG', '(11) 93333-3333', 'FUNCIONARIO', 2, TRUE),
('Roberto Cliente', 'roberto@email.com', '$2a$12$RCctxhp/wWpLUaKP1iSJs.WKvU3Tll.oJWhRvq9ZklUe8Q8bqiPvG', '(11) 92222-2222', 'CLIENTE', NULL, TRUE),
('Fernanda Admin', 'fernanda@barbearia.com', '$2a$12$RCctxhp/wWpLUaKP1iSJs.WKvU3Tll.oJWhRvq9ZklUe8Q8bqiPvG', '(11) 91111-1111', 'ADM', NULL, TRUE),
('Paulo Cliente', 'paulo@email.com', '$2a$12$RCctxhp/wWpLUaKP1iSJs.WKvU3Tll.oJWhRvq9ZklUe8Q8bqiPvG', '(11) 90000-0000', 'CLIENTE', NULL, TRUE);

-- ================ VERIFICAÇÃO ================
SELECT 'Tabela usuarios criada e populada com sucesso!' as status;
SELECT COUNT(*) as total_usuarios FROM usuarios;
SELECT tipo, COUNT(*) as quantidade FROM usuarios GROUP BY tipo;
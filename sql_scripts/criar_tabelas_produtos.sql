-- =====================================================
-- TABELA DE CATEGORIAS DE PRODUTOS
-- =====================================================
CREATE TABLE IF NOT EXISTS categorias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  unidade_id INT NOT NULL,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  ativo TINYINT(1) DEFAULT 1,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (unidade_id) REFERENCES unidades(id_unidade) ON DELETE CASCADE,
  INDEX idx_unidade_categorias (unidade_id),
  INDEX idx_ativo_categorias (ativo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABELA DE PRODUTOS
-- =====================================================
CREATE TABLE IF NOT EXISTS produtos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  unidade_id INT NOT NULL,
  categoria_id INT,
  nome VARCHAR(200) NOT NULL,
  descricao TEXT,
  preco DECIMAL(10, 2) NOT NULL,
  estoque INT DEFAULT 0,
  foto_url VARCHAR(500),
  ativo TINYINT(1) DEFAULT 1,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (unidade_id) REFERENCES unidades(id_unidade) ON DELETE CASCADE,
  FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL,
  INDEX idx_unidade_produtos (unidade_id),
  INDEX idx_categoria_produtos (categoria_id),
  INDEX idx_ativo_produtos (ativo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- DADOS DE TESTE (OPCIONAL)
-- =====================================================

-- Inserir categorias de exemplo para unidade_id = 1
INSERT INTO categorias (unidade_id, nome, descricao, ativo) VALUES
(1, 'Cortes de Cabelo', 'Serviços de corte e penteado', 1),
(1, 'Barba', 'Serviços para barba e bigode', 1),
(1, 'Produtos Capilares', 'Pomadas, ceras e finalizadores', 1),
(1, 'Produtos para Barba', 'Óleos, bálsamos e produtos para barba', 1),
(1, 'Acessórios', 'Pentes, escovas e outros acessórios', 1);

-- Inserir produtos de exemplo para unidade_id = 1
INSERT INTO produtos (unidade_id, categoria_id, nome, descricao, preco, estoque, ativo) VALUES
-- Cortes de Cabelo
(1, 1, 'Corte Social Masculino', 'Corte clássico e profissional', 45.00, 999, 1),
(1, 1, 'Corte Degradê', 'Corte moderno com degradê nas laterais', 50.00, 999, 1),
(1, 1, 'Corte + Barba', 'Combo completo de corte e barba', 70.00, 999, 1),

-- Barba
(1, 2, 'Barba Completa', 'Aparar e modelar a barba', 30.00, 999, 1),
(1, 2, 'Desenho de Barba', 'Desenho e contorno profissional', 35.00, 999, 1),
(1, 2, 'Barboterapia', 'Tratamento completo para barba', 80.00, 999, 1),

-- Produtos Capilares
(1, 3, 'Pomada Modeladora Forte', 'Fixação forte e acabamento natural', 35.00, 50, 1),
(1, 3, 'Cera Modeladora', 'Textura e definição para o cabelo', 32.00, 45, 1),
(1, 3, 'Gel Fixador', 'Gel de alta fixação', 25.00, 60, 1),
(1, 3, 'Spray Finalizador', 'Finalização e brilho', 28.00, 40, 1),

-- Produtos para Barba
(1, 4, 'Óleo para Barba - Cedarwood', 'Hidratação e perfume amadeirado', 45.00, 30, 1),
(1, 4, 'Bálsamo para Barba', 'Hidratação e modelagem', 42.00, 35, 1),
(1, 4, 'Shampoo para Barba', 'Limpeza profunda', 30.00, 40, 1),
(1, 4, 'Condicionador para Barba', 'Maciez e hidratação', 32.00, 38, 1),

-- Acessórios
(1, 5, 'Pente de Madeira Premium', 'Pente artesanal de madeira nobre', 55.00, 25, 1),
(1, 5, 'Escova de Barba', 'Escova com cerdas naturais', 48.00, 20, 1),
(1, 5, 'Necessaire Masculina', 'Kit organizador premium', 95.00, 15, 1),
(1, 5, 'Toalha de Rosto Premium', 'Toalha 100% algodão', 35.00, 30, 1);

-- =====================================================
-- VERIFICAÇÕES
-- =====================================================

-- Verificar categorias criadas
SELECT 'Categorias criadas:' as Info;
SELECT id, nome, ativo FROM categorias WHERE unidade_id = 1;

-- Verificar produtos criados
SELECT 'Produtos criados:' as Info;
SELECT p.id, c.nome as categoria, p.nome, p.preco, p.estoque 
FROM produtos p 
LEFT JOIN categorias c ON p.categoria_id = c.id 
WHERE p.unidade_id = 1 
ORDER BY c.nome, p.nome;

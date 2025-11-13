-- ================ TABELA DE AGENDAMENTOS DE CLIENTES ================
CREATE TABLE IF NOT EXISTS agendamentos_clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    unidade_id INT NOT NULL,
    cliente_id INT NOT NULL,
    funcionario_id INT NOT NULL,
    servico_id INT NOT NULL,
    data_agendamento DATE NOT NULL,
    horario_inicio TIME NOT NULL,
    horario_fim TIME NOT NULL,
    valor_total DECIMAL(10,2) NOT NULL,
    duracao_minutos INT NOT NULL,
    status ENUM('PENDENTE', 'CONFIRMADO', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO') DEFAULT 'PENDENTE',
    metodo_pagamento ENUM('PIX', 'CARTAO', 'DINHEIRO') NOT NULL,
    pagamento_confirmado BOOLEAN DEFAULT FALSE,
    observacoes TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (unidade_id) REFERENCES unidades(id_unidade) ON DELETE CASCADE,
    FOREIGN KEY (cliente_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (funcionario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (servico_id) REFERENCES servicos(id) ON DELETE CASCADE,
    
    INDEX idx_unidade_data (unidade_id, data_agendamento),
    INDEX idx_funcionario_data (funcionario_id, data_agendamento),
    INDEX idx_cliente (cliente_id),
    INDEX idx_status (status),
    
    -- Garantir que não haja conflito de horário para o mesmo funcionário
    UNIQUE KEY unique_funcionario_horario (funcionario_id, data_agendamento, horario_inicio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================ DADOS DE TESTE ================
-- Inserir alguns agendamentos de exemplo (funcionario_id 4 e 5 da tabela usuarios)
INSERT INTO agendamentos_clientes 
(unidade_id, cliente_id, funcionario_id, servico_id, data_agendamento, horario_inicio, horario_fim, valor_total, duracao_minutos, status, metodo_pagamento, pagamento_confirmado)
VALUES
-- Agendamentos para hoje
(1, 2, 4, 1, CURDATE(), '09:00:00', '09:25:00', 25.00, 25, 'CONFIRMADO', 'PIX', TRUE),
(1, 3, 4, 2, CURDATE(), '10:00:00', '11:15:00', 85.00, 75, 'CONFIRMADO', 'CARTAO', TRUE),
(1, 2, 5, 3, CURDATE(), '10:00:00', '11:00:00', 55.00, 60, 'CONFIRMADO', 'PIX', TRUE),

-- Agendamentos para amanhã
(1, 3, 4, 1, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '14:00:00', '14:25:00', 25.00, 25, 'PENDENTE', 'PIX', FALSE),
(1, 2, 5, 4, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '15:00:00', '15:40:00', 45.00, 40, 'PENDENTE', 'CARTAO', FALSE);

-- ================ VERIFICAÇÃO ================
SELECT 'Tabela agendamentos_clientes criada com sucesso!' as status;
SELECT * FROM agendamentos_clientes;

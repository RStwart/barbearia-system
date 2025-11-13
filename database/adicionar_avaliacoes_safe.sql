-- ============================================
-- MIGRAÇÃO: Adicionar Sistema de Avaliações
-- ============================================
-- Como executar:
-- mysql -u root -p barbearia_db < adicionar_avaliacoes_safe.sql

USE barbearia_db;

-- Tentar adicionar coluna avaliacao (ignorar erro se já existir)
SET @sql = 'ALTER TABLE agendamentos ADD COLUMN avaliacao INT DEFAULT NULL';
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Tentar adicionar coluna comentario_avaliacao (ignorar erro se já existir)
SET @sql = 'ALTER TABLE agendamentos ADD COLUMN comentario_avaliacao TEXT DEFAULT NULL';
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar estrutura final
DESCRIBE agendamentos;

SELECT 'Migracao concluida com sucesso!' AS Status;

-- Adicionar colunas de avaliação à tabela agendamentos
-- Execute este script para habilitar o sistema de avaliações

-- Verificar se as colunas já existem antes de adicionar
ALTER TABLE agendamentos 
ADD COLUMN avaliacao INT DEFAULT NULL;

ALTER TABLE agendamentos 
ADD COLUMN comentario_avaliacao TEXT DEFAULT NULL;

-- Comentários:
-- avaliacao: Nota de 1 a 5 estrelas dada pelo cliente
-- comentario_avaliacao: Comentário opcional do cliente sobre o serviço

-- Migration 001: Copa Mata-Mata
-- Adiciona suporte ao formato eliminatórias (copa_mata_mata)

ALTER TABLE partidas ADD COLUMN IF NOT EXISTS posicao_chave INTEGER;
ALTER TABLE partidas ADD COLUMN IF NOT EXISTS penaltis_mandante INTEGER;
ALTER TABLE partidas ADD COLUMN IF NOT EXISTS penaltis_visitante INTEGER;

ALTER TABLE campeonatos ADD COLUMN IF NOT EXISTS copa_config JSONB;

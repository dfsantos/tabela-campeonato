CREATE TABLE IF NOT EXISTS paises (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  codigo TEXT,
  bandeira TEXT
);

CREATE TABLE IF NOT EXISTS times (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  cidade TEXT,
  pais_id INTEGER REFERENCES paises(id)
);

CREATE TABLE IF NOT EXISTS campeonatos (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  temporada TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'planejado',
  formato TEXT NOT NULL DEFAULT 'liga',
  zonas JSONB,
  copa_config JSONB
);

CREATE TABLE IF NOT EXISTS participantes (
  campeonato_id INTEGER REFERENCES campeonatos(id) ON DELETE CASCADE,
  time_id INTEGER REFERENCES times(id) ON DELETE CASCADE,
  grupo INTEGER,
  PRIMARY KEY (campeonato_id, time_id)
);

CREATE TABLE IF NOT EXISTS partidas (
  id SERIAL PRIMARY KEY,
  campeonato_id INTEGER REFERENCES campeonatos(id) ON DELETE CASCADE,
  rodada INTEGER NOT NULL,
  mandante_id INTEGER REFERENCES times(id),
  visitante_id INTEGER REFERENCES times(id),
  data TEXT NOT NULL DEFAULT '',
  gols_mandante INTEGER,
  gols_visitante INTEGER,
  status TEXT NOT NULL DEFAULT 'agendada',
  posicao_chave INTEGER,
  penaltis_mandante INTEGER,
  penaltis_visitante INTEGER,
  grupo INTEGER
);

CREATE TABLE IF NOT EXISTS ligas (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL,
  logo TEXT,
  pais_id INTEGER REFERENCES paises(id)
);

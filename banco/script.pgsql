

-- => Abaixo irei excluir tabelas existentes para evitar conflitos
DROP TABLE IF EXISTS transacoes;
DROP TABLE IF EXISTS categorias;

-- => Abaixo irei criar Tabela de Categorias (com restrição de unicidade)
CREATE TABLE IF NOT EXISTS categorias (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- => Abaixo irei criar Tabela de Transações
CREATE TABLE IF NOT EXISTS transacoes (
    id SERIAL PRIMARY KEY,
    descricao VARCHAR(255) NOT NULL,
    valor NUMERIC(10, 2) NOT NULL,
    tipo VARCHAR(20) CHECK (tipo IN ('receita', 'despesa')) NOT NULL,
    categoria_id INTEGER REFERENCES categorias(id) ON DELETE CASCADE,
    data_transacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- => Abaixo irei inserir Categorias Únicas
INSERT INTO categorias (nome) VALUES 
    ('Renda'),
    ('Despesa')
ON CONFLICT (nome) DO NOTHING;  -- => Evita duplicação se o script for rodado novamente

-- => Abaixo inserirei dados de exemplo para Teste
INSERT INTO transacoes (descricao, valor, tipo, categoria_id)
VALUES
    ('Salário Mensal', 5000.00, 'receita', (SELECT id FROM categorias WHERE nome = 'Renda')),
    ('Investimento em Ações', 1200.00, 'receita', (SELECT id FROM categorias WHERE nome = 'Renda')),
    ('Aluguel', -1500.00, 'despesa', (SELECT id FROM categorias WHERE nome = 'Despesa')),
    ('Supermercado', -300.00, 'despesa', (SELECT id FROM categorias WHERE nome = 'Despesa')),
    ('Combustível', -200.00, 'despesa', (SELECT id FROM categorias WHERE nome = 'Despesa'));

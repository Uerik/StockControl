const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(
    path.join(__dirname, 'estoque.db')
);

db.serialize(() => {

    db.run(`PRAGMA foreign_keys = ON`);

    db.run(`
        CREATE TABLE IF NOT EXISTS categorias (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            descricao TEXT
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS mercadorias (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            descricao TEXT,
            preco REAL NOT NULL CHECK(preco >= 0),
            quantidade INTEGER NOT NULL CHECK(quantidade >= 0),
            estoque_minimo INTEGER NOT NULL DEFAULT 0,
            categoria_id INTEGER,
            FOREIGN KEY (categoria_id)
                REFERENCES categorias(id)
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS movimentacoes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            mercadoria_id INTEGER NOT NULL,
            tipo TEXT NOT NULL
                CHECK(tipo IN ('entrada', 'saida')),
            quantidade INTEGER NOT NULL CHECK(quantidade > 0),
            data TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (mercadoria_id)
                REFERENCES mercadorias(id)
        )
    `);

    db.run(`
        INSERT INTO categorias (nome, descricao)
        SELECT 'Geral', 'Categoria padrão'
        WHERE NOT EXISTS (
            SELECT 1 FROM categorias
        )
    `);
});

module.exports = db;
const express = require('express');
const router = express.Router();
const db = require('../database/database');

// READ - Listar mercadorias e filtrar
router.get('/', (req, res) => {

    const { nome, categoria, situacao } = req.query;

    let sql = `
        SELECT m.*, c.nome AS categoria
        FROM mercadorias m
        LEFT JOIN categorias c
        ON m.categoria_id = c.id
        WHERE 1=1
    `;

    const params = [];

    if (nome) {
        sql += ` AND m.nome LIKE ?`;
        params.push(`%${nome}%`);
    }

    if (categoria) {
        sql += ` AND m.categoria_id = ?`;
        params.push(categoria);
    }

    if (situacao === 'baixo') {
        sql += ` AND m.quantidade <= m.estoque_minimo`;
    }

    if (situacao === 'disponivel') {
        sql += ` AND m.quantidade > m.estoque_minimo`;
    }

    db.all(sql, params, (err, rows) => {
        if (err) {
            return res.status(500).json({
                erro: 'Erro ao consultar estoque.'
            });
        }

        res.json(rows);
    });
});

// CREATE - Cadastrar mercadoria
router.post('/', (req, res) => {

    const {
        nome,
        descricao,
        preco,
        quantidade,
        estoque_minimo,
        categoria_id
    } = req.body;

    if (
        typeof nome !== 'string' ||
        !nome.trim() ||
        !Number.isFinite(preco) ||
        preco < 0 ||
        !Number.isInteger(quantidade) ||
        quantidade < 0 ||
        !Number.isInteger(estoque_minimo) ||
        estoque_minimo < 0
    ) {
        return res.status(400).json({
            erro: 'Dados inválidos.'
        });
    }

    const sql = `
        INSERT INTO mercadorias
        (nome, descricao, preco, quantidade,
         estoque_minimo, categoria_id)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.run(sql, [
        nome.trim(),
        descricao || '',
        preco,
        quantidade,
        estoque_minimo,
        categoria_id || null
    ], function(err) {

        if (err) {
            return res.status(500).json({
                erro: 'Erro ao cadastrar mercadoria.'
            });
        }

        res.status(201).json({
            mensagem: 'Mercadoria cadastrada!',
            id: this.lastID
        });
    });
});

// UPDATE - Atualizar mercadoria
router.put('/:id', (req, res) => {

    const {
        nome,
        descricao,
        preco,
        quantidade,
        estoque_minimo,
        categoria_id
    } = req.body;

    if (
        !nome?.trim() ||
        !Number.isFinite(preco) ||
        preco < 0 ||
        !Number.isInteger(quantidade) ||
        quantidade < 0 ||
        !Number.isInteger(estoque_minimo) ||
        estoque_minimo < 0
    ) {
        return res.status(400).json({
            erro: 'Dados inválidos.'
        });
    }

    const sql = `
        UPDATE mercadorias
        SET nome = ?,
            descricao = ?,
            preco = ?,
            quantidade = ?,
            estoque_minimo = ?,
            categoria_id = ?
        WHERE id = ?
    `;

    db.run(sql, [
        nome.trim(),
        descricao || '',
        preco,
        quantidade,
        estoque_minimo,
        categoria_id || null,
        req.params.id
    ], function(err) {

        if (err) {
            return res.status(500).json({
                erro: 'Erro ao atualizar.'
            });
        }

        if (!this.changes) {
            return res.status(404).json({
                erro: 'Mercadoria não encontrada.'
            });
        }

        res.json({
            mensagem: 'Mercadoria atualizada!'
        });
    });
});

// DELETE - Excluir mercadoria
router.delete('/:id', (req, res) => {

    db.run(
        `DELETE FROM mercadorias WHERE id = ?`,
        [req.params.id],
        function(err) {

            if (err) {
                return res.status(500).json({
                    erro: 'Erro ao excluir.'
                });
            }

            if (!this.changes) {
                return res.status(404).json({
                    erro: 'Mercadoria não encontrada.'
                });
            }

            res.json({
                mensagem: 'Mercadoria excluída!'
            });
        }
    );
});

module.exports = router;
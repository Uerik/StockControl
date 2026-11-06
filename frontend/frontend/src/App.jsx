import { useEffect, useState } from 'react';

const API = 'http://localhost:3000/api/mercadorias';

function App() {

    const inicial = {
        nome: '',
        descricao: '',
        preco: '',
        quantidade: '',
        estoque_minimo: 0,
        categoria_id: ''
    };

    const [produtos, setProdutos] = useState([]);
    const [form, setForm] = useState(inicial);
    const [editando, setEditando] = useState(null);
    const [busca, setBusca] = useState('');
    const [situacao, setSituacao] = useState('');

    async function carregarProdutos() {

        const params = new URLSearchParams();

        if (busca) params.append('nome', busca);
        if (situacao) params.append('situacao', situacao);

        const resposta = await fetch(`${API}?${params}`);
        const dados = await resposta.json();

        setProdutos(dados);
    }

    useEffect(() => {
        carregarProdutos();
    }, [busca, situacao]);

    function alterarCampo(e) {

        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    }

    async function salvar(e) {

        e.preventDefault();

        const dados = {
            ...form,
            preco: Number(form.preco),
            quantidade: Number(form.quantidade),
            estoque_minimo: Number(form.estoque_minimo),
            categoria_id: form.categoria_id
                ? Number(form.categoria_id)
                : null
        };

        const url = editando
            ? `${API}/${editando}`
            : API;

        const resposta = await fetch(url, {
            method: editando ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            alert(resultado.erro);
            return;
        }

        alert(resultado.mensagem);

        setForm(inicial);
        setEditando(null);
        carregarProdutos();
    }

    function editar(produto) {

        setEditando(produto.id);

        setForm({
            nome: produto.nome,
            descricao: produto.descricao || '',
            preco: produto.preco,
            quantidade: produto.quantidade,
            estoque_minimo: produto.estoque_minimo,
            categoria_id: produto.categoria_id || ''
        });
    }

    async function excluir(id) {

        if (!confirm('Deseja excluir esta mercadoria?')) {
            return;
        }

        const resposta = await fetch(`${API}/${id}`, {
            method: 'DELETE'
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            alert(resultado.erro);
            return;
        }

        carregarProdutos();
    }

    const valorEstoque = produtos.reduce(
        (total, p) => total + p.preco * p.quantidade,
        0
    );

    return (
        <div className="container py-4">

            <h1 className="mb-2">
                StockControl
            </h1>

            <p className="text-muted">
                Sistema de controle de estoque
            </p>

            <div className="row mb-4">

                <div className="col-md-6 mb-2">
                    <div className="card p-3">
                        <h6>Total de mercadorias</h6>
                        <h2>{produtos.length}</h2>
                    </div>
                </div>

                <div className="col-md-6 mb-2">
                    <div className="card p-3">
                        <h6>Valor do estoque filtrado</h6>
                        <h2>
                            {valorEstoque.toLocaleString(
                                'pt-BR',
                                {
                                    style: 'currency',
                                    currency: 'BRL'
                                }
                            )}
                        </h2>
                    </div>
                </div>

            </div>

            <div className="card p-4 mb-4">

                <h4>
                    {editando
                        ? 'Editar mercadoria'
                        : 'Cadastrar mercadoria'}
                </h4>

                <form onSubmit={salvar}>

                    <input
                        className="form-control mb-2"
                        name="nome"
                        placeholder="Nome da mercadoria"
                        value={form.nome}
                        onChange={alterarCampo}
                        required
                    />

                    <textarea
                        className="form-control mb-2"
                        name="descricao"
                        placeholder="Descrição"
                        value={form.descricao}
                        onChange={alterarCampo}
                    />

                    <div className="row">

                        <div className="col-md-4">
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                className="form-control mb-2"
                                name="preco"
                                placeholder="Preço"
                                value={form.preco}
                                onChange={alterarCampo}
                                required
                            />
                        </div>

                        <div className="col-md-4">
                            <input
                                type="number"
                                min="0"
                                step="1"
                                className="form-control mb-2"
                                name="quantidade"
                                placeholder="Quantidade"
                                value={form.quantidade}
                                onChange={alterarCampo}
                                required
                            />
                        </div>

                        <div className="col-md-4">
                            <input
                                type="number"
                                min="0"
                                step="1"
                                className="form-control mb-2"
                                name="estoque_minimo"
                                placeholder="Estoque mínimo"
                                value={form.estoque_minimo}
                                onChange={alterarCampo}
                                required
                            />
                        </div>

                    </div>

                    <button className="btn btn-primary">
                        {editando ? 'Atualizar' : 'Salvar'}
                    </button>

                    {editando && (
                        <button
                            type="button"
                            className="btn btn-secondary ms-2"
                            onClick={() => {
                                setForm(inicial);
                                setEditando(null);
                            }}
                        >
                            Cancelar
                        </button>
                    )}

                </form>

            </div>

            <div className="card p-4">

                <h4>Estoque de mercadorias</h4>

                <input
                    className="form-control mb-2"
                    placeholder="Pesquisar mercadoria..."
                    value={busca}
                    onChange={e => setBusca(e.target.value)}
                />

                <select
                    className="form-select mb-3"
                    value={situacao}
                    onChange={e => setSituacao(e.target.value)}
                >
                    <option value="">Todas as mercadorias</option>
                    <option value="baixo">Estoque baixo</option>
                    <option value="disponivel">Disponível</option>
                </select>

                <div className="table-responsive">

                    <table className="table table-striped">

                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Preço</th>
                                <th>Quantidade</th>
                                <th>Situação</th>
                                <th>Ações</th>
                            </tr>
                        </thead>

                        <tbody>

                            {produtos.map(p => (

                                <tr key={p.id}>

                                    <td>{p.nome}</td>

                                    <td>
                                        R$ {p.preco.toFixed(2)}
                                    </td>

                                    <td>{p.quantidade}</td>

                                    <td>
                                        {p.quantidade <= p.estoque_minimo
                                            ? 'Estoque baixo'
                                            : 'Disponível'}
                                    </td>

                                    <td>
                                        <button
                                            className="btn btn-warning btn-sm me-2"
                                            onClick={() => editar(p)}
                                        >
                                            Editar
                                        </button>

                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => excluir(p.id)}
                                        >
                                            Excluir
                                        </button>
                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>

            </div>

        </div>
    );
}

export default App;
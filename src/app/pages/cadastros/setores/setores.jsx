import React, { useState, useEffect } from 'react';
import NavBar from '../../../components/menu.jsx';
import api from '../../../config/api.js';
import Loading from '../../../components/loading/loading.js';
import CryptoJS from 'crypto-js';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';
import './../../css/estilo.css';

function Setores() {
    const [setores, setSetores] = useState([]);
    const [controle, setControle] = useState(0);
    const [movimentacao, setMovimentacao] = useState('C');
    const [idEdit, setIdEdit] = useState(null);

    function encryptData(data) {
        return CryptoJS.AES.encrypt(data.toString(), 'Alysson-2025-IACBURITAMA').toString();
    }

    function decryptData(encryptedData) {
        if (!encryptedData) return '';
        const bytes = CryptoJS.AES.decrypt(encryptedData.toString(), 'Alysson-2025-IACBURITAMA');
        return bytes.toString(CryptoJS.enc.Utf8);
    }

    useEffect(() => {
        const fetchSetores = async () => {
            Loading.show("Aguarde....");
            try {
                const res = await api.get('/setores');
                if (res.data.SUCCESS && res.data.DATA.length > 0) {
                    setSetores(res.data.DATA);
                } else {
                    setSetores([]);
                }
            } catch (error) {
                toastr.error(error.message || error, "Erro ao buscar setores");
            } finally {
                Loading.hide();
            }
        };
        fetchSetores();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [controle]);

    function LimparCampos() {
        document.getElementById('inputNomeSetor').value = '';
        document.getElementById('inputDescricaoSetor').value = '';
        setIdEdit(null);
    }

    function Inserir() {
        const nome = document.getElementById('inputNomeSetor').value;
        const descricao = document.getElementById('inputDescricaoSetor').value;
        if (!nome) return toastr.warning('O nome do setor é obrigatório', 'Atenção');

        Loading.show('Aguarde...');
        api.post('/setores', { NOME: nome, DESCRICAO: descricao })
            .then((res) => {
                Loading.hide();
                if (res.data.SUCCESS) {
                    toastr.success("Setor cadastrado com sucesso", "Sucesso");
                    window.$('#modalCadastro').modal('hide');
                    setControle(c => c + 1);
                    LimparCampos();
                } else {
                    toastr.error(res.data.MESSAGE, "Atenção");
                }
            })
            .catch(() => { Loading.hide(); toastr.error("Erro ao cadastrar setor"); });
    }

    function Alterar() {
        const nome = document.getElementById('inputNomeSetor').value;
        const descricao = document.getElementById('inputDescricaoSetor').value;
        if (!nome) return toastr.warning('O nome do setor é obrigatório', 'Atenção');

        Loading.show('Aguarde...');
        api.put(`/setores/${decryptData(sessionStorage.getItem('id_setor_edit'))}`, { NOME: nome, DESCRICAO: descricao })
            .then((res) => {
                Loading.hide();
                if (res.data.SUCCESS) {
                    toastr.success("Setor alterado com sucesso", "Sucesso");
                    window.$('#modalCadastro').modal('hide');
                    setControle(c => c + 1);
                    LimparCampos();
                } else {
                    toastr.error(res.data.MESSAGE, "Atenção");
                }
            })
            .catch(() => { Loading.hide(); toastr.error("Erro ao alterar setor"); });
    }

    function Deletar(id) {
        if (!window.confirm("Deseja excluir este setor?")) return;
        Loading.show('Aguarde...');
        api.delete(`/setores/${id}`)
            .then((res) => {
                Loading.hide();
                if (res.data.SUCCESS) {
                    toastr.success("Setor excluído com sucesso", "Sucesso");
                    setControle(c => c + 1);
                } else {
                    toastr.error(res.data.MESSAGE, "Atenção");
                }
            })
            .catch(() => { Loading.hide(); toastr.error("Erro ao excluir setor"); });
    }

    function SalvarCadastro() {
        if (movimentacao === 'C') {
            Inserir();
        } else {
            Alterar();
        }
    }

    const conteudoHtml = (
        <div className='body'>
            <div className={`pt-2 mt-2`}>
                <div className='text-center'>
                    <h3 className='tituloD mb-1'>Setores de Atendimento</h3>
                </div>
                <div className="row mt-4">
                    <div className='col-md-9 mt-1'>
                        {/* Espaço reservado para futura busca */}
                    </div>
                    <div className='col-md-3 mt-1'>
                        <button
                            className="btn btn-secondary float-end w-100"
                            onClick={() => {
                                setMovimentacao('C');
                                LimparCampos();
                                window.$('#modalCadastro').modal('show');
                            }}
                            type="button">
                            Novo Setor
                        </button>
                    </div>
                </div>
                <div className="row mt-3">
                    <div className='col-md-12'>
                        <table className="table table-responsive table-sm table-striped w-100">
                            <thead>
                                <tr className="tabela">
                                    <th className='codigo' scope="col">Código</th>
                                    <th scope="col">Nome do Setor</th>
                                    <th scope="col">Descrição</th>
                                    <th className='fim_Grid editar' scope="col"></th>
                                </tr>
                            </thead>
                            <tbody className='text-center'>
                                {setores.length > 0 ? (
                                    setores.map((s) => (
                                        <tr key={s.ID_SETOR}>
                                            <td>{s.ID_SETOR}</td>
                                            <td>{s.NOME}</td>
                                            <td>{s.DESCRICAO || '-'}</td>
                                            <td
                                                className='text-center'
                                                onClick={() => {
                                                    document.getElementById('inputNomeSetor').value = s.NOME;
                                                    document.getElementById('inputDescricaoSetor').value = s.DESCRICAO || '';
                                                    sessionStorage.setItem('id_setor_edit', encryptData(s.ID_SETOR));
                                                    setMovimentacao('A');
                                                    window.$('#modalCadastro').modal('show');
                                                }}>
                                                <img src="../../img/editar.png" alt="editar" width="25" className="fas mouse fa-edit icone-acao" />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="text-center">Nenhum setor cadastrado</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal Cadastro */}
            <div className="modal fade modal-md" id="modalCadastro" data-bs-backdrop="false" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="false">
                <div className='opaco'>
                    <div className='modal-dialog'>
                        <div className="modal-content">
                            <div className="modal-header">
                                <div className='row'>
                                    <h5 className="modal-title col-md-12 tituloC" id="TituloModalSetor">
                                        {movimentacao === 'C' ? 'Novo Setor' : 'Editar Setor'}
                                    </h5>
                                </div>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <form className='container'>
                                    <div className="row">
                                        <div className="col-md-12 p-1">
                                            <b className="labelDescC">Nome do Setor</b>
                                            <div className="input-group">
                                                <input
                                                    type="text"
                                                    id='inputNomeSetor'
                                                    className="form-control form-control-sm"
                                                    placeholder="Ex: Financeiro, Suporte..."
                                                    aria-label="Nome do Setor" />
                                            </div>
                                        </div>
                                        <div className="col-md-12 p-1">
                                            <b className="labelDescC">Descrição</b>
                                            <div className="input-group">
                                                <textarea
                                                    id='inputDescricaoSetor'
                                                    className="form-control form-control-sm"
                                                    aria-label="Descrição"
                                                    rows="3"
                                                    placeholder="Breve descrição do setor (opcional)">
                                                </textarea>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div className="modal-footer">
                                <button onClick={() => { LimparCampos(); window.$('#modalCadastro').modal('hide'); }} type="button" className="btn btn-danger">Cancelar</button>
                                <button onClick={() => SalvarCadastro()} type="button" className="btn btn-success">Salvar</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );

    return (
        <NavBar conteudo={conteudoHtml} />
    );
}

export default Setores;

import React, { useState, useEffect } from 'react';
import NavBar from '../../../components/menu.jsx';
import api from '../../../config/api.js';
import Loading from '../../../components/loading/loading.js';
import CryptoJS from 'crypto-js';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';
import md5 from 'md5';
import './../../css/estilo.css';

function Usuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [setores, setSetores] = useState([]);
    const [controle, setControle] = useState(0);
    const [movimentacao, setMovimentacao] = useState('C');
    const [permissoes, setPermissoes] = useState([]);

    const availablePermissions = [
        { key: 'HOME', label: 'Início (Gráficos)' },
        { key: 'ATENDIMENTO', label: 'Atendimento WhatsApp' },
        { key: 'PESSOAS', label: 'Membros/Visitantes' },
        { key: 'EVENTOS', label: 'Eventos' },
        { key: 'MENSAGENS', label: 'Modelos de Mensagem' },
        { key: 'RELATORIOS', label: 'Relatórios' },
        { key: 'USUARIOS', label: 'Gestão de Usuários' },
        { key: 'SETORES', label: 'Gestão de Setores' },
    ];

    function encryptData(data) {
        return CryptoJS.AES.encrypt(data.toString(), 'Alysson-2025-IACBURITAMA').toString();
    }

    function decryptData(encryptedData) {
        if (!encryptedData) return '';
        const bytes = CryptoJS.AES.decrypt(encryptedData.toString(), 'Alysson-2025-IACBURITAMA');
        return bytes.toString(CryptoJS.enc.Utf8);
    }

    useEffect(() => {
        const fetchData = async () => {
            Loading.show("Aguarde....");
            try {
                const [resUsers, resSectors] = await Promise.all([
                    api.get('/usuarios/lista'),
                    api.get('/setores')
                ]);
                if (resUsers.data.SUCCESS) setUsuarios(resUsers.data.DATA || []);
                else setUsuarios([]);
                if (resSectors.data.SUCCESS) setSetores(resSectors.data.DATA || []);
            } catch (error) {
                toastr.error(error.message || error, "Erro ao buscar dados");
            } finally {
                Loading.hide();
            }
        };
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [controle]);

    function LimparCampos() {
        document.getElementById('inputNome').value = '';
        document.getElementById('inputUsuario').value = '';
        document.getElementById('inputSenha').value = '';
        document.getElementById('inputSetor').value = '';
        setPermissoes([]);
        sessionStorage.removeItem('id_usuario_edit');
    }

    function togglePermissao(key) {
        setPermissoes(prev =>
            prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key]
        );
    }

    function Inserir() {
        const nome = document.getElementById('inputNome').value;
        const usuario = document.getElementById('inputUsuario').value;
        const senha = document.getElementById('inputSenha').value;
        const id_setor = document.getElementById('inputSetor').value;

        if (!nome || !usuario || !senha) return toastr.warning('Nome, Usuário e Senha são obrigatórios', 'Atenção');

        Loading.show('Aguarde...');
        api.post('/usuarios', {
            NOME: nome,
            USUARIO: usuario,
            SENHA: md5(senha),
            PERMISSOES: JSON.stringify(permissoes),
            ID_SETOR: id_setor || null
        }).then((res) => {
            Loading.hide();
            if (res.data.SUCCESS) {
                toastr.success("Usuário cadastrado com sucesso", "Sucesso");
                window.$('#modalCadastro').modal('hide');
                setControle(c => c + 1);
                LimparCampos();
            } else {
                toastr.error(res.data.MESSAGE, "Atenção");
            }
        }).catch(() => { Loading.hide(); toastr.error("Erro ao cadastrar usuário"); });
    }

    function Alterar() {
        const nome = document.getElementById('inputNome').value;
        const usuario = document.getElementById('inputUsuario').value;
        const senha = document.getElementById('inputSenha').value;
        const id_setor = document.getElementById('inputSetor').value;
        const idEdit = decryptData(sessionStorage.getItem('id_usuario_edit'));

        if (!nome || !usuario) return toastr.warning('Nome e Usuário são obrigatórios', 'Atenção');

        Loading.show('Aguarde...');
        api.put(`/usuarios/${idEdit}`, {
            NOME: nome,
            USUARIO: usuario,
            SENHA: senha ? md5(senha) : null,
            PERMISSOES: JSON.stringify(permissoes),
            ID_SETOR: id_setor || null
        }).then((res) => {
            Loading.hide();
            if (res.data.SUCCESS) {
                toastr.success("Usuário alterado com sucesso", "Sucesso");
                window.$('#modalCadastro').modal('hide');
                setControle(c => c + 1);
                LimparCampos();
            } else {
                toastr.error(res.data.MESSAGE, "Atenção");
            }
        }).catch(() => { Loading.hide(); toastr.error("Erro ao alterar usuário"); });
    }

    function Deletar(id) {
        if (!window.confirm("Deseja excluir este usuário?")) return;
        Loading.show('Aguarde...');
        api.delete(`/usuarios/${id}`)
            .then((res) => {
                Loading.hide();
                if (res.data.SUCCESS) {
                    toastr.success("Usuário excluído com sucesso", "Sucesso");
                    setControle(c => c + 1);
                } else {
                    toastr.error(res.data.MESSAGE, "Atenção");
                }
            })
            .catch(() => { Loading.hide(); toastr.error("Erro ao excluir usuário"); });
    }

    function SalvarCadastro() {
        if (movimentacao === 'C') Inserir();
        else Alterar();
    }

    function getNomeSetor(id_setor) {
        const s = setores.find(s => s.ID_SETOR === id_setor);
        return s ? s.NOME : '-';
    }

    const conteudoHtml = (
        <div className='body'>
            <div className={`pt-2 mt-2`}>
                <div className='text-center'>
                    <h3 className='tituloD mb-1'>Gestão de Usuários</h3>
                </div>
                <div className="row mt-4">
                    <div className='col-md-9 mt-1'>
                        {/* Espaço reservado */}
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
                            Novo Usuário
                        </button>
                    </div>
                </div>
                <div className="row mt-3">
                    <div className='col-md-12'>
                        <table className="table table-responsive table-sm table-striped w-100">
                            <thead>
                                <tr className="tabela">
                                    <th className='codigo' scope="col">Código</th>
                                    <th scope="col">Nome</th>
                                    <th scope="col">Usuário (Login)</th>
                                    <th scope="col">Setor</th>
                                    <th className='editar' scope="col"></th>
                                </tr>
                            </thead>
                            <tbody className='text-center'>
                                {usuarios.length > 0 ? (
                                    usuarios.map((u) => (
                                        <tr key={u.ID}>
                                            <td>{u.ID}</td>
                                            <td>{u.NOME}</td>
                                            <td>{u.USUARIO}</td>
                                            <td>{getNomeSetor(u.ID_SETOR)}</td>
                                            <td
                                                className='text-center'
                                                onClick={() => {
                                                    document.getElementById('inputNome').value = u.NOME;
                                                    document.getElementById('inputUsuario').value = u.USUARIO;
                                                    document.getElementById('inputSenha').value = '';
                                                    document.getElementById('inputSetor').value = u.ID_SETOR || '';
                                                    try {
                                                        setPermissoes(JSON.parse(u.PERMISSOES || '[]'));
                                                    } catch { setPermissoes([]); }
                                                    sessionStorage.setItem('id_usuario_edit', encryptData(u.ID));
                                                    setMovimentacao('A');
                                                    window.$('#modalCadastro').modal('show');
                                                }}>
                                                <img src="../../img/editar.png" alt="editar" width="25" className="fas mouse fa-edit icone-acao" />
                                            </td>

                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center">Nenhum usuário cadastrado</td>
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
                    <div className='modal-dialog modal-lg'>
                        <div className="modal-content">
                            <div className="modal-header">
                                <div className='row'>
                                    <h5 className="modal-title col-md-12 tituloC" id="TituloModalUsuario">
                                        {movimentacao === 'C' ? 'Novo Usuário' : 'Editar Usuário'}
                                    </h5>
                                </div>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <form className='container'>
                                    <div className="row">
                                        <div className="col-md-6 p-1">
                                            <b className="labelDescC">Nome Completo</b>
                                            <div className="input-group">
                                                <input type="text" id='inputNome' className="form-control form-control-sm" aria-label="Nome" />
                                            </div>
                                        </div>
                                        <div className="col-md-6 p-1">
                                            <b className="labelDescC">Usuário (Login)</b>
                                            <div className="input-group">
                                                <input type="text" id='inputUsuario' className="form-control form-control-sm" aria-label="Usuário" autoComplete="off" />
                                            </div>
                                        </div>
                                        <div className="col-md-6 p-1">
                                            <b className="labelDescC">Senha {movimentacao === 'A' && <small className="text-muted">(deixe vazio para não alterar)</small>}</b>
                                            <div className="input-group">
                                                <input type="password" id='inputSenha' className="form-control form-control-sm" aria-label="Senha" autoComplete="new-password" />
                                            </div>
                                        </div>
                                        <div className="col-md-6 p-1">
                                            <b className="labelDescC">Setor Principal</b>
                                            <div className="input-group">
                                                <select id='inputSetor' className="form-control form-control-sm">
                                                    <option value="">Nenhum</option>
                                                    {setores.map(s => <option key={s.ID_SETOR} value={s.ID_SETOR}>{s.NOME}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <hr />
                                    <b className="labelDescC">Permissões de Acesso</b>
                                    <div className="row mt-2">
                                        {availablePermissions.map(p => (
                                            <div className="col-md-6 col-6 p-1" key={p.key}>
                                                <div className="form-check">
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        checked={permissoes.includes(p.key)}
                                                        onChange={() => togglePermissao(p.key)}
                                                        id={`perm_${p.key}`}
                                                    />
                                                    <label className="form-check-label labelDescC" htmlFor={`perm_${p.key}`}>
                                                        {p.label}
                                                    </label>
                                                </div>
                                            </div>
                                        ))}
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

export default Usuarios;

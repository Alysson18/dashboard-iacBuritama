import React, { useState, useEffect, useContext } from 'react';
import NavBar from '../../../components/menu.jsx';
import api from '../../../config/api.js';
import Loading from '../../../components/loading/loading.js';
import CryptoJS from 'crypto-js';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';
import { AuthContext } from '../../../Context/auth.jsx';
import './../../css/estilo.css';

// Tela restrita a usuários SISTEMA e ADMIN (ver SistemaRoute em src/app.jsx). Cadastro/edição
// das igrejas (tenants) do sistema multi-igreja — incluindo os dados de acesso ao roteador
// Mikrotik de cada uma — é exclusivo do Sistema; ADMIN só vê a(s) sua(s) igreja(s) e só pode
// gerenciar quem tem acesso a elas (modal "Usuários da Igreja"), nunca criar/editar/desativar.
function Igrejas() {
    const [igrejas, setIgrejas] = useState([]);
    const [controle, setControle] = useState(0);
    const [movimentacao, setMovimentacao] = useState('C');
    const [logoPreview, setLogoPreview] = useState('');
    const [ativoEdit, setAtivoEdit] = useState(true);
    const { igrejaAtual, setIgrejaAtual, tipoUsuario } = useContext(AuthContext);
    const ehSistema = tipoUsuario === 'SISTEMA';

    // Modal "Usuários da igreja": Sistema mexe em qualquer igreja, Administrador só na(s) sua(s)
    // (o backend também garante isso — ver requireSistemaOuAdminDaIgreja no server.ts).
    const [igrejaUsuarios, setIgrejaUsuarios] = useState(null);
    const [usuariosDaIgreja, setUsuariosDaIgreja] = useState([]);
    const [todosUsuarios, setTodosUsuarios] = useState([]);
    const [usuarioParaAdicionar, setUsuarioParaAdicionar] = useState('');
    const [tornarAdminIgreja, setTornarAdminIgreja] = useState(false);

    function encryptData(data) {
        return CryptoJS.AES.encrypt(data.toString(), 'Alysson-2025-IACBURITAMA').toString();
    }

    function decryptData(encryptedData) {
        if (!encryptedData) return '';
        const bytes = CryptoJS.AES.decrypt(encryptedData.toString(), 'Alysson-2025-IACBURITAMA');
        return bytes.toString(CryptoJS.enc.Utf8);
    }

    useEffect(() => {
        const fetchIgrejas = async () => {
            Loading.show("Aguarde....");
            try {
                const res = await api.get('/igrejas');
                if (res.data.SUCCESS) {
                    setIgrejas(res.data.DATA || []);
                } else {
                    setIgrejas([]);
                }
            } catch (error) {
                toastr.error(error.message || error, "Erro ao buscar igrejas");
            } finally {
                Loading.hide();
            }
        };
        fetchIgrejas();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [controle]);

    function LimparCampos() {
        document.getElementById('inputNomeIgreja').value = '';
        document.getElementById('inputLogoUrl').value = '';
        document.getElementById('inputCnpj').value = '';
        document.getElementById('inputEndereco').value = '';
        document.getElementById('inputTelefone').value = '';
        document.getElementById('inputHostApi').value = '';
        document.getElementById('inputUserApi').value = '';
        document.getElementById('inputPassApi').value = '';
        document.getElementById('inputPortaApi').value = '';
        setLogoPreview('');
        setAtivoEdit(true);
        sessionStorage.removeItem('id_igreja_edit');
    }

    function montarBody() {
        return {
            NOME: document.getElementById('inputNomeIgreja').value,
            LOGO_URL: document.getElementById('inputLogoUrl').value,
            CNPJ: document.getElementById('inputCnpj').value,
            ENDERECO: document.getElementById('inputEndereco').value,
            TELEFONE: document.getElementById('inputTelefone').value,
            ATIVO: ativoEdit,
            HOST_API: document.getElementById('inputHostApi').value,
            USER_API: document.getElementById('inputUserApi').value,
            PASS_API: document.getElementById('inputPassApi').value,
            PORTA_API: document.getElementById('inputPortaApi').value || null
        };
    }

    function Inserir() {
        const body = montarBody();
        if (!body.NOME) return toastr.warning('O nome da igreja é obrigatório', 'Atenção');

        Loading.show('Aguarde...');
        api.post('/igrejas', body)
            .then((res) => {
                Loading.hide();
                if (res.data.SUCCESS) {
                    toastr.success("Igreja cadastrada com sucesso", "Sucesso");
                    window.$('#modalCadastro').modal('hide');
                    setControle(c => c + 1);
                    LimparCampos();
                } else {
                    toastr.error(res.data.MESSAGE, "Atenção");
                }
            })
            .catch(() => { Loading.hide(); toastr.error("Erro ao cadastrar igreja"); });
    }

    function Alterar() {
        const body = montarBody();
        const idEdit = decryptData(sessionStorage.getItem('id_igreja_edit'));
        if (!body.NOME) return toastr.warning('O nome da igreja é obrigatório', 'Atenção');

        Loading.show('Aguarde...');
        api.put(`/igrejas/${idEdit}`, body)
            .then((res) => {
                Loading.hide();
                if (res.data.SUCCESS) {
                    toastr.success("Igreja alterada com sucesso", "Sucesso");

                    // Se a igreja editada é a que está selecionada agora, atualiza o cache da
                    // logo (usado na tela de login) na hora, sem precisar deslogar e logar de
                    // novo pra ver a mudança refletida.
                    if (igrejaAtual && String(igrejaAtual.ID_IGREJA) === String(idEdit)) {
                        setIgrejaAtual({ ...igrejaAtual, NOME: body.NOME, LOGO_URL: body.LOGO_URL });
                        if (body.LOGO_URL) {
                            localStorage.setItem('igreja_logo_url', body.LOGO_URL);
                        } else {
                            localStorage.removeItem('igreja_logo_url');
                        }
                    }

                    window.$('#modalCadastro').modal('hide');
                    setControle(c => c + 1);
                    LimparCampos();
                } else {
                    toastr.error(res.data.MESSAGE, "Atenção");
                }
            })
            .catch(() => { Loading.hide(); toastr.error("Erro ao alterar igreja"); });
    }

    function Deletar(id) {
        if (!window.confirm("Deseja desativar esta igreja? Usuários vinculados a ela perderão o acesso.")) return;
        Loading.show('Aguarde...');
        api.delete(`/igrejas/${id}`)
            .then((res) => {
                Loading.hide();
                if (res.data.SUCCESS) {
                    toastr.success("Igreja desativada com sucesso", "Sucesso");
                    setControle(c => c + 1);
                } else {
                    toastr.error(res.data.MESSAGE, "Atenção");
                }
            })
            .catch(() => { Loading.hide(); toastr.error("Erro ao desativar igreja"); });
    }

    function SalvarCadastro() {
        if (movimentacao === 'C') Inserir();
        else Alterar();
    }

    function AbrirEdicao(igreja) {
        document.getElementById('inputNomeIgreja').value = igreja.NOME || '';
        document.getElementById('inputLogoUrl').value = igreja.LOGO_URL || '';
        document.getElementById('inputCnpj').value = igreja.CNPJ || '';
        document.getElementById('inputEndereco').value = igreja.ENDERECO || '';
        document.getElementById('inputTelefone').value = igreja.TELEFONE || '';
        document.getElementById('inputHostApi').value = igreja.HOST_API || '';
        document.getElementById('inputUserApi').value = igreja.USER_API || '';
        document.getElementById('inputPassApi').value = igreja.PASS_API || '';
        document.getElementById('inputPortaApi').value = igreja.PORTA_API || '';
        setLogoPreview(igreja.LOGO_URL || '');
        setAtivoEdit(igreja.ATIVO === undefined ? true : !!igreja.ATIVO);
        sessionStorage.setItem('id_igreja_edit', encryptData(igreja.ID_IGREJA));
        setMovimentacao('A');
        window.$('#modalCadastro').modal('show');
    }

    async function AbrirUsuarios(igreja) {
        setIgrejaUsuarios(igreja);
        setUsuarioParaAdicionar('');
        setTornarAdminIgreja(false);
        window.$('#modalUsuariosIgreja').modal('show');
        await CarregarUsuariosDaIgreja(igreja.ID_IGREJA);
        if (todosUsuarios.length === 0) {
            try {
                const res = await api.get('/usuarios/lista');
                if (res.data.SUCCESS) setTodosUsuarios(res.data.DATA || []);
            } catch (error) {
                toastr.error("Erro ao buscar usuários", "Atenção");
            }
        }
    }

    async function CarregarUsuariosDaIgreja(idIgreja) {
        Loading.show('Aguarde...');
        try {
            const res = await api.get(`/igrejas/${idIgreja}/usuarios`);
            setUsuariosDaIgreja(res.data.SUCCESS ? (res.data.DATA || []) : []);
        } catch (error) {
            toastr.error("Erro ao buscar usuários da igreja", "Atenção");
        } finally {
            Loading.hide();
        }
    }

    function AdicionarUsuarioNaIgreja() {
        if (!usuarioParaAdicionar) return toastr.warning('Selecione um usuário', 'Atenção');
        Loading.show('Aguarde...');
        api.post(`/usuarios/${usuarioParaAdicionar}/igrejas`, {
            ID_IGREJA: igrejaUsuarios.ID_IGREJA,
            IS_ADMIN_IGREJA: ehSistema ? tornarAdminIgreja : false
        })
            .then((res) => {
                Loading.hide();
                if (res.data.SUCCESS) {
                    toastr.success("Usuário adicionado à igreja", "Sucesso");
                    setUsuarioParaAdicionar('');
                    setTornarAdminIgreja(false);
                    CarregarUsuariosDaIgreja(igrejaUsuarios.ID_IGREJA);
                } else {
                    toastr.error(res.data.MESSAGE, "Atenção");
                }
            })
            .catch(() => { Loading.hide(); toastr.error("Erro ao adicionar usuário"); });
    }

    function RemoverUsuarioDaIgreja(idUsuario) {
        if (!window.confirm("Remover o acesso deste usuário a esta igreja?")) return;
        Loading.show('Aguarde...');
        api.delete(`/usuarios/${idUsuario}/igrejas/${igrejaUsuarios.ID_IGREJA}`)
            .then((res) => {
                Loading.hide();
                if (res.data.SUCCESS) {
                    toastr.success("Acesso removido", "Sucesso");
                    CarregarUsuariosDaIgreja(igrejaUsuarios.ID_IGREJA);
                } else {
                    toastr.error(res.data.MESSAGE, "Atenção");
                }
            })
            .catch(() => { Loading.hide(); toastr.error("Erro ao remover acesso"); });
    }

    // Usuários que ainda não têm acesso a essa igreja, pra oferecer no seletor de "adicionar".
    const usuariosDisponiveisParaAdicionar = todosUsuarios.filter(
        u => !usuariosDaIgreja.some(ud => String(ud.ID) === String(u.ID))
    );

    const conteudoHtml = (
        <div className='body'>
            <div className={`pt-2 mt-2`}>
                <div className='text-center'>
                    <h3 className='tituloD mb-1'>Gestão de Igrejas</h3>
                </div>
                {ehSistema && (
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
                                Nova Igreja
                            </button>
                        </div>
                    </div>
                )}
                <div className="row mt-3">
                    <div className='col-md-12'>
                        <table className="table table-responsive table-sm table-striped w-100">
                            <thead>
                                <tr className="tabela">
                                    <th className='codigo' scope="col">Código</th>
                                    <th className='nome' scope="col">Nome</th>
                                    <th scope="col">CNPJ</th>
                                    <th className='telefone' scope="col">Telefone</th>
                                    <th className='situacao' scope="col">Status</th>
                                    <th scope="col"></th>
                                    {ehSistema && <th className='delete' scope="col"></th>}
                                    {ehSistema && <th className='editar' scope="col"></th>}
                                </tr>
                            </thead>
                            <tbody className='text-center'>
                                {igrejas.length > 0 ? (
                                    igrejas.map((ig) => (
                                        <tr key={ig.ID_IGREJA}>
                                            <td>{ig.ID_IGREJA}</td>
                                            <td>{ig.NOME}</td>
                                            <td>{ig.CNPJ || '-'}</td>
                                            <td>{ig.TELEFONE || '-'}</td>
                                            <td>
                                                <span className={`badge ${ig.ATIVO ? 'bg-success' : 'bg-secondary'}`}>
                                                    {ig.ATIVO ? 'Ativa' : 'Inativa'}
                                                </span>
                                            </td>
                                            <td className='text-center' onClick={() => AbrirUsuarios(ig)} title="Usuários com acesso">
                                                <i className="bi bi-people-fill mouse icone-acao" style={{ fontSize: '20px' }}></i>
                                            </td>
                                            {ehSistema && (
                                                <td className='text-center' onClick={() => Deletar(ig.ID_IGREJA)}>
                                                    <img src="../../img/delete.png" alt="desativar" width="20" className="fas mouse fa-trash icone-acao" />
                                                </td>
                                            )}
                                            {ehSistema && (
                                                <td className='text-center' onClick={() => AbrirEdicao(ig)}>
                                                    <img src="../../img/editar.png" alt="editar" width="25" className="fas mouse fa-edit icone-acao" />
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="text-center">Nenhuma igreja cadastrada</td>
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
                                    <h5 className="modal-title col-md-12 tituloC" id="TituloModalIgreja">
                                        {movimentacao === 'C' ? 'Nova Igreja' : 'Editar Igreja'}
                                    </h5>
                                </div>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <form className='container'>
                                    <div className="row">
                                        <div className="col-md-8 p-1">
                                            <b className="labelDescC">Nome</b>
                                            <div className="input-group">
                                                <input type="text" id='inputNomeIgreja' className="form-control form-control-sm" aria-label="Nome" />
                                            </div>
                                        </div>
                                        <div className="col-md-4 p-1 d-flex align-items-end">
                                            <div className="form-check">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    checked={ativoEdit}
                                                    onChange={(e) => setAtivoEdit(e.target.checked)}
                                                    id="inputAtivo"
                                                />
                                                <label className="form-check-label labelDescC" htmlFor="inputAtivo">
                                                    Ativa
                                                </label>
                                            </div>
                                        </div>
                                        <div className="col-md-8 p-1">
                                            <b className="labelDescC">URL da Logo</b>
                                            <div className="input-group">
                                                <input
                                                    type="url"
                                                    id='inputLogoUrl'
                                                    className="form-control form-control-sm"
                                                    aria-label="URL da Logo"
                                                    placeholder="https://..."
                                                    onChange={(e) => setLogoPreview(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-4 p-1 text-center">
                                            <b className="labelDescC d-block">Preview</b>
                                            {logoPreview
                                                ? <img src={logoPreview} alt="Preview da logo" style={{ maxWidth: '100%', maxHeight: 60 }} onError={(e) => { e.target.style.display = 'none'; }} onLoad={(e) => { e.target.style.display = 'inline-block'; }} />
                                                : <small className="text-muted">Sem logo definida</small>}
                                        </div>
                                        <div className="col-md-6 p-1">
                                            <b className="labelDescC">CNPJ</b>
                                            <div className="input-group">
                                                <input type="text" id='inputCnpj' className="form-control form-control-sm" aria-label="CNPJ" />
                                            </div>
                                        </div>
                                        <div className="col-md-6 p-1">
                                            <b className="labelDescC">Telefone</b>
                                            <div className="input-group">
                                                <input type="text" id='inputTelefone' className="form-control form-control-sm" aria-label="Telefone" />
                                            </div>
                                        </div>
                                        <div className="col-md-12 p-1">
                                            <b className="labelDescC">Endereço</b>
                                            <div className="input-group">
                                                <input type="text" id='inputEndereco' className="form-control form-control-sm" aria-label="Endereço" />
                                            </div>
                                        </div>
                                    </div>

                                    <hr />
                                    <b className="labelDescC">Configuração do Roteador (Mikrotik)</b>
                                    <div className="row mt-2">
                                        <div className="col-md-6 p-1">
                                            <b className="labelDescC">Host</b>
                                            <div className="input-group">
                                                <input type="text" id='inputHostApi' className="form-control form-control-sm" aria-label="Host da API" placeholder="Ex: 192.168.1.1" />
                                            </div>
                                        </div>
                                        <div className="col-md-6 p-1">
                                            <b className="labelDescC">Porta</b>
                                            <div className="input-group">
                                                <input type="number" id='inputPortaApi' className="form-control form-control-sm" aria-label="Porta da API" placeholder="Ex: 8728" />
                                            </div>
                                        </div>
                                        <div className="col-md-6 p-1">
                                            <b className="labelDescC">Usuário</b>
                                            <div className="input-group">
                                                <input type="text" id='inputUserApi' className="form-control form-control-sm" aria-label="Usuário da API" autoComplete="off" />
                                            </div>
                                        </div>
                                        <div className="col-md-6 p-1">
                                            <b className="labelDescC">Senha</b>
                                            <div className="input-group">
                                                <input type="password" id='inputPassApi' className="form-control form-control-sm" aria-label="Senha da API" autoComplete="new-password" />
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

            {/* Modal Usuários da Igreja: quem tem acesso a essa igreja e quem pode ser adicionado.
                Sistema gerencia qualquer igreja; Administrador só a(s) sua(s) (reforçado no backend). */}
            <div className="modal fade modal-md" id="modalUsuariosIgreja" data-bs-backdrop="false" data-bs-keyboard="false" tabIndex="-1" aria-hidden="false">
                <div className='opaco'>
                    <div className='modal-dialog modal-lg'>
                        <div className="modal-content">
                            <div className="modal-header">
                                <div className='row'>
                                    <h5 className="modal-title col-md-12 tituloC">
                                        Usuários com acesso — {igrejaUsuarios ? igrejaUsuarios.NOME : ''}
                                    </h5>
                                </div>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <table className="table table-sm table-striped w-100">
                                    <thead>
                                        <tr className="tabela">
                                            <th scope="col">Nome</th>
                                            <th scope="col">Login</th>
                                            <th scope="col">Papel</th>
                                            <th scope="col"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {usuariosDaIgreja.length > 0 ? usuariosDaIgreja.map((u) => (
                                            <tr key={u.ID}>
                                                <td>{u.NOME}</td>
                                                <td>{u.USUARIO}</td>
                                                <td>{u.IS_ADMIN_IGREJA ? 'Administrador' : 'Usuário'}</td>
                                                <td className='text-center'>
                                                    <i className="bi bi-x-circle-fill mouse icone-acao text-danger" style={{ fontSize: '18px' }} onClick={() => RemoverUsuarioDaIgreja(u.ID)} title="Remover acesso"></i>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan="4" className="text-center">Nenhum usuário com acesso ainda</td></tr>
                                        )}
                                    </tbody>
                                </table>

                                <hr />
                                <b className="labelDescC">Adicionar usuário</b>
                                <div className="row mt-2 align-items-end">
                                    <div className={ehSistema ? "col-md-6 p-1" : "col-md-8 p-1"}>
                                        <select
                                            className="form-control form-control-sm"
                                            value={usuarioParaAdicionar}
                                            onChange={(e) => setUsuarioParaAdicionar(e.target.value)}
                                        >
                                            <option value="">Selecione um usuário...</option>
                                            {usuariosDisponiveisParaAdicionar.map(u => (
                                                <option key={u.ID} value={u.ID}>{u.NOME} ({u.USUARIO})</option>
                                            ))}
                                        </select>
                                    </div>
                                    {ehSistema && (
                                        <div className="col-md-3 p-1">
                                            <div className="form-check">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    checked={tornarAdminIgreja}
                                                    onChange={(e) => setTornarAdminIgreja(e.target.checked)}
                                                    id="inputTornarAdmin"
                                                />
                                                <label className="form-check-label labelDescC" htmlFor="inputTornarAdmin">
                                                    Administrador desta igreja
                                                </label>
                                            </div>
                                        </div>
                                    )}
                                    <div className={ehSistema ? "col-md-3 p-1" : "col-md-4 p-1"}>
                                        <button onClick={AdicionarUsuarioNaIgreja} type="button" className="btn btn-success w-100">Adicionar</button>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button data-bs-dismiss="modal" type="button" className="btn btn-secondary">Fechar</button>
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

export default Igrejas;

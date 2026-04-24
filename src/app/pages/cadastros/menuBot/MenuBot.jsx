import React, { useState, useEffect } from 'react';
import NavBar from '../../../components/menu.jsx';
import api from '../../../config/api.js';
import Loading from '../../../components/loading/loading.js';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';

const MenuBot = () => {
    const [menus, setMenus] = useState([]);
    const [controle, setControle] = useState(0);
    const [formData, setFormData] = useState({
        ID: null, PARENT_ID: null, SLUG: '', TITULO: '', DESCRICAO: '', RESPOSTA_TEXTO: '', TIPO: 'RESPOSTA'
    });

    useEffect(() => {
        const fetchData = async () => {
            Loading.show("Aguarde....");
            try {
                const res = await api.get('/menu-dinamico/lista');
                if (res.data.SUCCESS) {
                    setMenus(res.data.DATA || []);
                } else if (Array.isArray(res.data)) {
                    setMenus(res.data);
                } else {
                    setMenus([]);
                }
            } catch (error) {
                toastr.error(error.message || error, "Erro ao carregar menus");
            } finally {
                Loading.hide();
            }
        };
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [controle]);

    const loadMenus = async () => {
        setControle(c => c + 1);
    };

    const openModal = (item = null) => {
        if (item) {
            setFormData(item);
        } else {
            setFormData({ ID: null, PARENT_ID: null, SLUG: '', TITULO: '', DESCRICAO: '', RESPOSTA_TEXTO: '', TIPO: 'RESPOSTA' });
        }
        window.$('#modalMenuBot').modal('show');
    };

    async function handleSave(event) {

        if (!formData.TITULO || !formData.SLUG) {
            toastr.warning("Título e Slug são obrigatórios", "Atenção");
            return;
        }

        Loading.show("Salvando...");
        try {
            if (formData.ID) {
                await api.put(`/menu-dinamico/${formData.ID}`, formData);
                toastr.success("Menu atualizado com sucesso!");
            } else {
                await api.post('/menu-dinamico', formData);
                toastr.success("Menu cadastrado com sucesso!");
            }
            window.$('#modalMenuBot').modal('hide');
            setControle(prev => prev + 1);
        } catch (e) {
            toastr.error("Erro ao salvar: " + e.message);
        } finally {
            Loading.hide();
        }
    };

    const deleteItem = async (id) => {
        if (window.confirm("Deseja realmente excluir este item?")) {
            Loading.show("Excluindo...");
            try {
                await api.delete(`/menu-dinamico/${id}`);
                toastr.success("Item excluído!");
                setControle(prev => prev + 1);
            } catch (e) {
                toastr.error("Erro ao excluir");
            } finally {
                Loading.hide();
            }
        }
    };

    function getNomeParent(parentId) {
        const pai = menus.find(m => m.ID === parentId);
        return pai ? pai.TITULO : '-';
    }

    const conteudoHtml = (
        <div className="body">
            <div className="pt-2 mt-2">
                <div className="text-center">
                    <h3 className="tituloD mb-1">Gerenciador de Menu do WhatsApp</h3>
                </div>

                <div className="row mt-4 mb-3">
                    <div className="col-md-9 mt-1"></div>
                    <div className="col-md-3 mt-1">
                        <button className="btn btn-secondary float-end w-100" onClick={() => openModal()}>
                            <i className="bi bi-plus-circle me-2"></i>Novo Item
                        </button>
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-12">
                        <table className="table table-responsive table-sm table-striped table-hover w-100">
                            <thead>
                                <tr className="tabela">
                                    <th scope='col' className='codigo'>Código</th>
                                    <th scope='col' className='nome'>Título (WhatsApp)</th>
                                    <th scope='col'>Tipo</th>
                                    <th scope='col'>Hierarquia</th>
                                    <th className='delete' scope="col"></th>
                                    <th className='editar' scope="col"></th>
                                </tr>
                            </thead>
                            <tbody className="text-center">
                                {menus.length > 0 ? (menus.map(item => (
                                    <tr key={item.ID}>
                                        <td className="codigo">{item.ID}</td>
                                        <td className="text-start">
                                            {item.TITULO}
                                            <small className="text-muted">{item.DESCRICAO}</small>
                                        </td>
                                        <td>
                                            <span className={`badge ${item.TIPO === 'SUBMENU' ? 'bg-info' : 'bg-success'}`}>
                                                {item.TIPO}
                                            </span>
                                        </td>
                                        <td>
                                            {item.PARENT_ID ?
                                                <span className="badge bg-secondary">{getNomeParent(item.PARENT_ID)}</span> :
                                                <span className="badge bg-dark">Raiz</span>
                                            }
                                        </td>
                                        <td className="text-end"><img src="../../img/delete.png" alt="Excluir" width="22"
                                            className="fas mouse fa-edit icone-acao"
                                            onClick={() => deleteItem(item.ID)} />
                                        </td>
                                        <td>
                                            <img src="../../img/editar.png" alt="Editar" width="22"
                                                className="fas mouse fa-edit icone-acao"
                                                onClick={() => openModal(item)} />
                                        </td>

                                    </tr>
                                ))) : (
                                    <tr>
                                        <td colSpan="6" className="text-center">Nenhum menu cadastrado</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal de Cadastro/Edição */}
            <div className="modal fade" id="modalMenuBot" tabIndex="-1" aria-hidden="true" data-bs-backdrop="false">
                <div className="modal-dialog modal-lg">
                    <div className="modal-content shadow-lg">
                        <div className="modal-header bg-light">
                            <h5 className="modal-title tituloC">{formData.ID ? 'Editar' : 'Novo'} Item de Menu</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div className="container-fluid">
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <b className="labelDescC">Título da Opção (Max 24)</b>
                                        <input className="form-control form-control-sm" maxLength={24}
                                            value={formData.TITULO}
                                            onChange={e => setFormData({ ...formData, TITULO: e.target.value })}
                                            placeholder="Ex: Horários de Culto" />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <b className="labelDescC">Identificador Único (Slug)</b>
                                        <input className="form-control form-control-sm"
                                            value={formData.SLUG}
                                            onChange={e => setFormData({ ...formData, SLUG: e.target.value })}
                                            placeholder="Ex: horarios_culto" />
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <b className="labelDescC">Descrição curta (WhatsApp)</b>
                                    <input className="form-control form-control-sm" maxLength={72}
                                        value={formData.DESCRICAO}
                                        onChange={e => setFormData({ ...formData, DESCRICAO: e.target.value })}
                                        placeholder="Aparece abaixo do título no menu" />
                                </div>

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <b className="labelDescC">Tipo de Ação</b>
                                        <select className="form-select form-select-sm select"
                                            value={formData.TIPO}
                                            onChange={e => setFormData({ ...formData, TIPO: e.target.value })}>
                                            <option value="RESPOSTA">Enviar Texto Final</option>
                                            <option value="SUBMENU">Abrir outro Menu</option>
                                        </select>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <b className="labelDescC">Pertence ao Menu (Pai)</b>
                                        <select className="form-select form-select-sm select"
                                            value={formData.PARENT_ID || ''}
                                            onChange={e => setFormData({ ...formData, PARENT_ID: e.target.value ? parseInt(e.target.value) : null })}>
                                            <option value="">-- Menu Principal --</option>
                                            {menus.filter(m => m.TIPO === 'SUBMENU' && m.ID !== formData.ID).map(m => (
                                                <option key={m.ID} value={m.ID}>{m.TITULO}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {formData.TIPO === 'RESPOSTA' && (
                                    <div className="mb-3">
                                        <b className="labelDescC">Resposta do Bot</b>
                                        <textarea className="form-control" rows={4}
                                            value={formData.RESPOSTA_TEXTO}
                                            onChange={e => setFormData({ ...formData, RESPOSTA_TEXTO: e.target.value })}
                                            placeholder="Digite o texto que o bot enviará..." />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="modal-footer bg-light">
                            <button type="button" className="btn btn-danger" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" className="btn btn-success" onClick={() => handleSave()}>Salvar Alterações</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return <NavBar conteudo={conteudoHtml} />;
};

export default MenuBot;
import React, { useState, useEffect } from 'react';
import NavBar from '../../../components/menu.jsx';
import api from '../../../config/api.js';
import Loading from '../../../components/loading/loading.js';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';

const COR_PADRAO = '#6c757d';

const LinksPortal = () => {
    const [links, setLinks] = useState([]);
    const [controle, setControle] = useState(0);
    const [formData, setFormData] = useState({
        ID: null, TITULO: '', URL: '', COR: COR_PADRAO, ORDEM: 0, ATIVO: true
    });

    useEffect(() => {
        const fetchData = async () => {
            Loading.show("Aguarde....");
            try {
                const res = await api.get('/links/lista');
                if (res.data.SUCCESS) {
                    setLinks(res.data.DATA || []);
                } else {
                    setLinks([]);
                }
            } catch (error) {
                toastr.error(error.message || error, "Erro ao carregar links");
            } finally {
                Loading.hide();
            }
        };
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [controle]);

    const openModal = (item = null) => {
        if (item) {
            setFormData({ ...item, COR: item.COR || COR_PADRAO });
        } else {
            setFormData({ ID: null, TITULO: '', URL: '', COR: COR_PADRAO, ORDEM: links.length, ATIVO: true });
        }
        window.$('#modalLinkPortal').modal('show');
    };

    const handleSave = async () => {
        if (!formData.TITULO || !formData.URL) {
            toastr.warning("Título e URL são obrigatórios", "Atenção");
            return;
        }

        const payload = { ...formData, COR: formData.COR || COR_PADRAO };

        Loading.show("Salvando...");
        try {
            if (formData.ID) {
                await api.put(`/links/${formData.ID}`, payload);
                toastr.success("Link atualizado com sucesso!");
            } else {
                await api.post('/links', payload);
                toastr.success("Link cadastrado com sucesso!");
            }
            window.$('#modalLinkPortal').modal('hide');
            setControle(prev => prev + 1);
        } catch (e) {
            toastr.error("Erro ao salvar: " + e.message);
        } finally {
            Loading.hide();
        }
    };

    const deleteItem = async (id) => {
        if (window.confirm("Deseja realmente excluir este link?")) {
            Loading.show("Excluindo...");
            try {
                await api.delete(`/links/${id}`);
                toastr.success("Link excluído!");
                setControle(prev => prev + 1);
            } catch (e) {
                toastr.error("Erro ao excluir");
            } finally {
                Loading.hide();
            }
        }
    };

    const conteudoHtml = (
        <div className="body">
            <div className="pt-2 mt-2">
                <div className="text-center">
                    <h3 className="tituloD mb-1">Links do Portal Wi-Fi</h3>
                    <p className="text-muted">Botões exibidos na página de links após o visitante conectar no wifi. O botão "Palavra Profética" é fixo e sempre aparece em primeiro lugar.</p>
                </div>

                <div className="row mt-4 mb-3">
                    <div className="col-md-9 mt-1"></div>
                    <div className="col-md-3 mt-1">
                        <button className="btn btn-secondary float-end w-100" onClick={() => openModal()}>
                            <i className="bi bi-plus-circle me-2"></i>Novo Link
                        </button>
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-12">
                        <table className="table table-responsive table-sm table-striped table-hover w-100">
                            <thead>
                                <tr className="tabela">
                                    <th className='codigo' scope='col'>Ordem</th>
                                    <th scope='col' className='nome'>Título</th>
                                    <th scope='col'>URL</th>
                                    <th scope='col' className="text-center">Cor</th>
                                    <th scope='col' className="text-center">Ativo</th>
                                    <th className='delete' scope="col"></th>
                                    <th className='editar' scope="col"></th>
                                </tr>
                            </thead>
                            <tbody className="text-center">
                                {links.length > 0 ? (links.map(item => (
                                    <tr key={item.ID} className={!item.ATIVO ? 'opacity-50' : ''}>
                                        <td>{item.ORDEM}</td>
                                        <td className="text-start">{item.TITULO}</td>
                                        <td className="text-start">
                                            <small className="text-muted">{item.URL}</small>
                                        </td>
                                        <td>
                                            {item.COR ? (
                                                <span className="badge" style={{ backgroundColor: item.COR }}>&nbsp;&nbsp;&nbsp;</span>
                                            ) : (
                                                <span className="badge bg-secondary">Padrão</span>
                                            )}
                                        </td>
                                        <td>
                                            <span className={`badge ${item.ATIVO ? 'bg-success' : 'bg-secondary'}`}>
                                                {item.ATIVO ? 'Ativo' : 'Inativo'}
                                            </span>
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
                                        <td colSpan="7" className="text-center">Nenhum link cadastrado</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal de Cadastro/Edição */}
            <div className="modal fade" id="modalLinkPortal" tabIndex="-1" aria-hidden="true" data-bs-backdrop="false">
                <div className="modal-dialog modal-lg">
                    <div className="modal-content shadow-lg">
                        <div className="modal-header bg-light">
                            <h5 className="modal-title tituloC">{formData.ID ? 'Editar' : 'Novo'} Link</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div className="container-fluid">
                                <div className="row">
                                    <div className="col-md-8 mb-3">
                                        <b className="labelDescC">Título do Botão</b>
                                        <input className="form-control form-control-sm" maxLength={60}
                                            value={formData.TITULO}
                                            onChange={e => setFormData({ ...formData, TITULO: e.target.value })}
                                            placeholder="Ex: Instagram" />
                                    </div>
                                    <div className="col-md-4 mb-3">
                                        <b className="labelDescC">Ordem</b>
                                        <input type="number" className="form-control form-control-sm"
                                            value={formData.ORDEM}
                                            onChange={e => setFormData({ ...formData, ORDEM: parseInt(e.target.value) || 0 })} />
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <b className="labelDescC">URL de Destino</b>
                                    <input className="form-control form-control-sm"
                                        value={formData.URL}
                                        onChange={e => setFormData({ ...formData, URL: e.target.value })}
                                        placeholder="https://instagram.com/suaigreja" />
                                </div>

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <b className="labelDescC">Cor do Botão</b>
                                        <input type="color" className="form-control form-control-sm form-control-color w-100"
                                            value={formData.COR || '#6c757d'}
                                            onChange={e => setFormData({ ...formData, COR: e.target.value })} />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <b className="labelDescC">Situação</b>
                                        <select className="form-select form-select-sm select" id="linkAtivo"
                                            value={(formData.ATIVO === 1 || formData.ATIVO === true) ? '1' : '0'}
                                            onChange={e => setFormData({ ...formData, ATIVO: e.target.value === '1' })}>
                                            <option value="1">Ativo</option>
                                            <option value="0">Inativo</option>
                                        </select>
                                    </div>
                                </div>
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

export default LinksPortal;

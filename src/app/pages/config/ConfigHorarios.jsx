import React, { useState, useEffect } from 'react';
import NavBar from '../../components/menu.jsx';
import api from '../../config/api.js';
import Loading from '../../components/loading/loading.js';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';
import '../css/estilo.css';

const ConfigHorarios = () => {
    const [horarios, setHorarios] = useState([]);
    const [controle, setControle] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            Loading.show("Aguarde....");
            try {
                const res = await api.get('/config/horarios');
                if (res.data.SUCCESS) {
                    setHorarios(res.data.DATA || []);
                } else {
                    setHorarios([]);
                }
            } catch (error) {
                toastr.error(error.message || error, "Erro ao carregar horários");
            } finally {
                Loading.hide();
            }
        };
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [controle]);

    const handleSave = async (item) => {
        Loading.show("Salvando configurações...");
        try {
            const res = await api.put(`/config/horarios/${item.ID}`, {
                HORA_INICIO: item.HORA_INICIO,
                HORA_FIM: item.HORA_FIM,
                ATIVO: item.ATIVO
            });

            if (res.data.SUCCESS) {
                toastr.success(`Horário de ${item.NOME_DIA} atualizado com sucesso!`);
                setControle(prev => prev + 1);
            } else {
                toastr.error(res.data.MESSAGE || "Erro ao salvar");
            }
        } catch (error) {
            toastr.error("Erro na requisição: " + error.message);
        } finally {
            Loading.hide();
        }
    };

    const updateLocalState = (id, field, value) => {
        setHorarios(prev => prev.map(h => h.ID === id ? { ...h, [field]: value } : h));
    };

    const conteudoHtml = (
        <div className="body">
            <div className="pt-2 mt-2">
                <div className="text-center">
                    <h3 className="tituloD mb-1">Horários de Atendimento (Bot)</h3>
                    <p className="text-muted">Defina os períodos em que o atendimento humano está disponível.</p>
                </div>

                <div className="row mt-4">
                    <div className="col-md-12">
                        <table className="table table-responsive table-sm table-striped table-hover w-100">
                            <thead>
                                <tr className="tabela">
                                    <th className='inicio-grid' scope="col">Dia da Semana</th>
                                    <th scope="col" className="text-center">Abertura</th>
                                    <th scope="col" className="text-center">Fechamento</th>
                                    <th scope="col" className="text-center">Ativo</th>
                                    <th className='fim-grid' scope="col">Ação</th>
                                </tr>
                            </thead>
                            <tbody className="text-center">
                                {horarios.length > 0 ? (horarios.map(item => (
                                    <tr key={item.ID} className={!item.ATIVO ? 'opacity-50' : ''}>
                                        <td className="text-start align-middle">
                                            <strong>{item.NOME_DIA}</strong>
                                        </td>
                                        <td>
                                            <input type="time" className="form-control form-control-sm d-inline-block w-auto"
                                                value={item.HORA_INICIO}
                                                onChange={(e) => updateLocalState(item.ID, 'HORA_INICIO', e.target.value)} />
                                        </td>
                                        <td>
                                            <input type="time" className="form-control form-control-sm d-inline-block w-auto"
                                                value={item.HORA_FIM}
                                                onChange={(e) => updateLocalState(item.ID, 'HORA_FIM', e.target.value)} />
                                        </td>
                                        <td className="align-middle">
                                            <div className="form-check form-switch d-inline-block">
                                                <input className="form-check-input" type="checkbox"
                                                    checked={item.ATIVO === 1 || item.ATIVO === true}
                                                    onChange={(e) => updateLocalState(item.ID, 'ATIVO', e.target.checked ? 1 : 0)} />
                                            </div>
                                        </td>
                                        <td className="align-middle">
                                            <button className="btn btn-sm btn-success" onClick={() => handleSave(item)}>
                                                <i className="bi bi-save me-1"></i> Salvar
                                            </button>
                                        </td>
                                    </tr>
                                ))) : (
                                    <tr>
                                        <td colSpan="5" className="text-center">Nenhum horário configurado</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        <div className="alert alert-info mt-3 shadow-sm">
                            <i className="bi bi-info-circle-fill me-2"></i>
                            Fora dos horários marcados como <strong>Ativo</strong>, o bot informará o expediente ao usuário e encerrará a sessão sem abrir tickets.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return <NavBar conteudo={conteudoHtml} />;
};

export default ConfigHorarios;
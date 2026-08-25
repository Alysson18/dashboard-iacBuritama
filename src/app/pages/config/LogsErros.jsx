import React, { useState, useEffect } from 'react';
import NavBar from '../../components/menu.jsx';
import api from '../../config/api.js';
import Loading from '../../components/loading/loading.js';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';

const TIPO_LABEL = {
    WHATSAPP_ENTREGA_FALHOU: 'Entrega de mensagem falhou',
    WHATSAPP_CHECKIN_FALHOU: 'Mensagem de check-in falhou',
    WHATSAPP_ANIVERSARIO_FALHOU: 'Mensagem de aniversário falhou',
};

const LogsErros = () => {
    const [logs, setLogs] = useState([]);
    const [detalheAberto, setDetalheAberto] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            Loading.show("Aguarde....");
            try {
                const res = await api.get('/logs/erros');
                if (res.data.SUCCESS) {
                    setLogs(res.data.DATA || []);
                } else {
                    toastr.error(res.data.MESSAGE || 'Erro ao buscar logs.');
                }
            } catch (error) {
                toastr.error(error.message || error, "Erro na comunicação com o servidor");
            } finally {
                Loading.hide();
            }
        };
        fetchData();
    }, []);

    const conteudoHtml = (
        <div className="body">
            <div className="pt-2 mt-2">
                <div className="text-center">
                    <h3 className="tituloD mb-1">Logs do Sistema</h3>
                    <p className="text-muted">Últimas falhas críticas de envio de WhatsApp (check-in, aniversário, entregas reportadas pela Meta).</p>
                </div>

                <div className="row mt-3">
                    <div className="col-md-12">
                        <table className="table table-responsive table-sm table-striped w-100">
                            <thead>
                                <tr className="tabela">
                                    <th scope="col">Data/Hora</th>
                                    <th scope="col">Tipo</th>
                                    <th scope="col">Mensagem</th>
                                    <th scope="col"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.length > 0 ? (
                                    logs.map((log) => (
                                        <React.Fragment key={log.ID}>
                                            <tr>
                                                <td style={{ whiteSpace: 'nowrap' }}>{new Date(log.DATA_HORA).toLocaleString('pt-BR')}</td>
                                                <td><span className="badge bg-danger">{TIPO_LABEL[log.TIPO] || log.TIPO}</span></td>
                                                <td>{log.MENSAGEM}</td>
                                                <td className="text-center">
                                                    {log.DETALHES && (
                                                        <button className="btn btn-sm btn-outline-secondary"
                                                            onClick={() => setDetalheAberto(detalheAberto === log.ID ? null : log.ID)}>
                                                            {detalheAberto === log.ID ? 'Ocultar' : 'Detalhes'}
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                            {detalheAberto === log.ID && (
                                                <tr>
                                                    <td colSpan="4">
                                                        <pre className="bg-light p-2 rounded" style={{ fontSize: '11px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                                                            {log.DETALHES}
                                                        </pre>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="text-center">Nenhum erro registrado — tudo funcionando normalmente.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );

    return <NavBar conteudo={conteudoHtml} />;
};

export default LogsErros;

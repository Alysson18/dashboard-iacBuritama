import React, { useState, useEffect } from 'react';
import NavBar from '../../components/menu.jsx';
import api from '../../config/api.js';
import Loading from '../../components/loading/loading.js';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';

const DIAS_SEMANA = [
    { valor: 0, rotulo: 'Dom' },
    { valor: 1, rotulo: 'Seg' },
    { valor: 2, rotulo: 'Ter' },
    { valor: 3, rotulo: 'Qua' },
    { valor: 4, rotulo: 'Qui' },
    { valor: 5, rotulo: 'Sex' },
    { valor: 6, rotulo: 'Sáb' },
];
const TODOS_OS_DIAS = DIAS_SEMANA.map(d => d.valor);

const ConfigMensagens = () => {
    const [config, setConfig] = useState({ ENVIAR_MSG_CHECKIN: false, ENVIAR_MSG_ANIVERSARIO: false, TEMPLATE_ANIVERSARIO: '', DIAS_SEMANA_MSG_CHECKIN: TODOS_OS_DIAS });
    const [templates, setTemplates] = useState([]);
    const [controle, setControle] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            Loading.show("Aguarde....");
            try {
                const res = await api.get('/config/mensagens');
                if (res.data.SUCCESS) {
                    const diasSalvos = res.data.DATA?.DIAS_SEMANA_MSG_CHECKIN;
                    setConfig({
                        ENVIAR_MSG_CHECKIN: !!res.data.DATA?.ENVIAR_MSG_CHECKIN,
                        ENVIAR_MSG_ANIVERSARIO: !!res.data.DATA?.ENVIAR_MSG_ANIVERSARIO,
                        TEMPLATE_ANIVERSARIO: res.data.DATA?.TEMPLATE_ANIVERSARIO || '',
                        DIAS_SEMANA_MSG_CHECKIN: diasSalvos
                            ? diasSalvos.split(',').filter(d => d !== '').map(d => parseInt(d, 10))
                            : TODOS_OS_DIAS,
                    });
                }
            } catch (error) {
                toastr.error(error.message || error, "Erro ao carregar configurações");
            } finally {
                Loading.hide();
            }
        };
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [controle]);

    function alternarDiaSemana(dia) {
        setConfig((atual) => {
            const jaSelecionado = atual.DIAS_SEMANA_MSG_CHECKIN.includes(dia);
            const novosDias = jaSelecionado
                ? atual.DIAS_SEMANA_MSG_CHECKIN.filter(d => d !== dia)
                : [...atual.DIAS_SEMANA_MSG_CHECKIN, dia].sort();
            return { ...atual, DIAS_SEMANA_MSG_CHECKIN: novosDias };
        });
    }

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const res = await api.get('/templates/lista?nome=&page=1&pageSize=100');
                if (res.data.DATA) {
                    setTemplates(res.data.DATA.filter(t => t.SITUACAO === 'APPROVED'));
                }
            } catch (error) {
                toastr.error(error.message || error, "Erro ao buscar templates");
            }
        };
        fetchTemplates();
    }, []);

    const handleSave = async () => {
        if (config.ENVIAR_MSG_CHECKIN && config.DIAS_SEMANA_MSG_CHECKIN.length === 0) {
            toastr.warning("Selecione ao menos um dia da semana pra mensagem de boas-vindas (ou desligue o envio). Mensagens de evento continuam disparando normalmente.", "Atenção");
            return;
        }

        Loading.show("Salvando configurações...");
        try {
            const res = await api.put('/config/mensagens', {
                ...config,
                DIAS_SEMANA_MSG_CHECKIN: config.DIAS_SEMANA_MSG_CHECKIN.join(','),
            });
            if (res.data.SUCCESS) {
                toastr.success("Configurações atualizadas com sucesso!");
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

    const conteudoHtml = (
        <div className="body">
            <div className="pt-2 mt-2">
                <div className="text-center">
                    <h3 className="tituloD mb-1">Configurações Gerais</h3>
                    <p className="text-muted">Ligue ou desligue os disparos automáticos de mensagem pelo WhatsApp.</p>
                </div>

                <div className="row mt-4 justify-content-center">
                    <div className="col-md-8">
                        <div className="card shadow-sm p-3 mb-3">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <b className="d-block">Mensagem de Boas-vindas no Check-in</b>
                                    <small className="text-muted">Envia uma mensagem de template pelo WhatsApp assim que a pessoa faz check-in na rede Wi-Fi.</small>
                                </div>
                                <div className="form-check form-switch ms-3">
                                    <input className="form-check-input" type="checkbox" role="switch"
                                        style={{ width: '3em', height: '1.5em' }}
                                        checked={config.ENVIAR_MSG_CHECKIN}
                                        onChange={(e) => setConfig({ ...config, ENVIAR_MSG_CHECKIN: e.target.checked })} />
                                </div>
                            </div>
                            <div className="mt-3 pt-3 border-top">
                                <b className="labelDescC d-block mb-2">Dias da semana em que pode enviar</b>
                                <div className="d-flex flex-wrap gap-2">
                                    {DIAS_SEMANA.map((dia) => (
                                        <React.Fragment key={dia.valor}>
                                            <input type="checkbox" className="btn-check" id={`diaSemana${dia.valor}`}
                                                autoComplete="off" disabled={!config.ENVIAR_MSG_CHECKIN}
                                                checked={config.DIAS_SEMANA_MSG_CHECKIN.includes(dia.valor)}
                                                onChange={() => alternarDiaSemana(dia.valor)} />
                                            <label className="btn btn-outline-primary btn-sm" htmlFor={`diaSemana${dia.valor}`}>
                                                {dia.rotulo}
                                            </label>
                                        </React.Fragment>
                                    ))}
                                </div>
                                <small className="text-muted d-block mt-2">
                                    Vale só pra essa mensagem genérica. Se tiver um evento cadastrado pro dia, a mensagem do evento é enviada sempre, independente dos dias marcados aqui.
                                </small>
                            </div>
                        </div>

                        <div className="card shadow-sm p-3 mb-3">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <b className="d-block">Mensagem de Aniversário</b>
                                    <small className="text-muted">Todo dia às 07:30, envia uma mensagem de parabéns pra quem faz aniversário na data.</small>
                                </div>
                                <div className="form-check form-switch ms-3">
                                    <input className="form-check-input" type="checkbox" role="switch"
                                        style={{ width: '3em', height: '1.5em' }}
                                        checked={config.ENVIAR_MSG_ANIVERSARIO}
                                        onChange={(e) => setConfig({ ...config, ENVIAR_MSG_ANIVERSARIO: e.target.checked })} />
                                </div>
                            </div>
                            <div className="mt-3 pt-3 border-top">
                                <b className="labelDescC d-block mb-1">Template usado no envio</b>
                                <select className="form-select form-select-sm select"
                                    disabled={!config.ENVIAR_MSG_ANIVERSARIO}
                                    value={config.TEMPLATE_ANIVERSARIO}
                                    onChange={(e) => setConfig({ ...config, TEMPLATE_ANIVERSARIO: e.target.value })}>
                                    <option value="">-- Selecione um template --</option>
                                    {templates.map(t => (
                                        <option key={t.ID_TEMPLATE} value={t.NOME_MODELO}>
                                            {t.DESCRICAO || t.NOME_MODELO}
                                        </option>
                                    ))}
                                </select>
                                <small className="text-muted">Precisa ser um template aprovado na Meta, com uma única variável de texto (o nome da pessoa).</small>
                            </div>
                        </div>

                        <div className="text-end">
                            <button className="btn btn-success" onClick={() => handleSave()}>
                                <i className="bi bi-save me-1"></i> Salvar Configurações
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return <NavBar conteudo={conteudoHtml} />;
};

export default ConfigMensagens;

import React, { useState, useEffect } from 'react';
import NavBar from '../../../components/menu.jsx';
import api from '../../../config/api.js';
import Loading from '../../../components/loading/loading.js';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';

const ROTULO_TIPO_PESSOA = { S: 'Membros', N: 'Visitantes', T: 'Todos' };
const BADGE_STATUS = {
    PENDENTE: 'bg-warning text-dark',
    ENVIADO: 'bg-success',
    ERRO: 'bg-danger',
    CANCELADO: 'bg-secondary',
};

function MensagensAgendamento() {
    const [agendamentos, setAgendamentos] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [busca, setBusca] = useState('');
    const [controle, setControle] = useState(0);

    const [descricao, setDescricao] = useState('');
    const [tipoPessoa, setTipoPessoa] = useState('');
    const [idadeMinima, setIdadeMinima] = useState('');
    const [idadeMaxima, setIdadeMaxima] = useState('');
    const [templateSelecionado, setTemplateSelecionado] = useState('');
    const [data, setData] = useState('');
    const [hora, setHora] = useState('');

    useEffect(() => {
        const fetchAgendamentos = async () => {
            Loading.show('Aguarde....');
            try {
                const res = await api.get('/agendamentos');
                if (res.data.SUCCESS) {
                    setAgendamentos(res.data.DATA || []);
                } else {
                    toastr.error(res.data.MESSAGE || 'Erro ao buscar agendamentos.');
                }
            } catch (error) {
                toastr.error('Erro na comunicação com o servidor.');
            } finally {
                Loading.hide();
            }
        };
        fetchAgendamentos();
    }, [controle]);

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const res = await api.get('/templates/listaMeta');
                if (res.data && res.data.DATA) {
                    setTemplates(res.data.DATA);
                }
            } catch (error) {
                toastr.error('Erro ao carregar templates da Meta', 'Erro');
            }
        };
        fetchTemplates();
    }, []);

    function LimparCampos() {
        setDescricao('');
        setTipoPessoa('');
        setIdadeMinima('');
        setIdadeMaxima('');
        setTemplateSelecionado('');
        setData('');
        setHora('');
    }

    function AbrirNovo() {
        LimparCampos();
        window.$('#modalAgendamento').modal('show');
    }

    function Salvar() {
        if (!tipoPessoa || !templateSelecionado || !data || !hora) {
            toastr.warning('Preencha o público, a mensagem, a data e o horário.', 'Atenção');
            return;
        }
        if (idadeMinima && idadeMaxima && Number(idadeMinima) > Number(idadeMaxima)) {
            toastr.warning('A idade mínima não pode ser maior que a máxima.', 'Atenção');
            return;
        }

        Loading.show('Agendando...');
        api.post('/agendamentos', {
            DESCRICAO: descricao || null,
            TIPO_PESSOA: tipoPessoa,
            IDADE_MINIMA: idadeMinima || null,
            IDADE_MAXIMA: idadeMaxima || null,
            NOME_MODELO: templateSelecionado,
            DATA: data,
            HORA: hora,
        }).then(function (AxiosResponse) {
            Loading.hide();
            if (AxiosResponse.data.SUCCESS === true) {
                toastr.success('Disparo agendado com sucesso!', 'Sucesso');
                window.$('#modalAgendamento').modal('hide');
                LimparCampos();
                setControle(controle + 1);
            } else {
                toastr.error(AxiosResponse.data.MESSAGE, 'Atenção');
            }
        }).catch(function (error) {
            Loading.hide();
            toastr.error(error.message || error, 'Erro ao agendar disparo!');
        });
    }

    function Cancelar(idAgendamento) {
        Loading.show('Cancelando...');
        api.delete(`/agendamentos/${idAgendamento}`).then(function (AxiosResponse) {
            Loading.hide();
            if (AxiosResponse.data.SUCCESS === true) {
                toastr.success('Agendamento cancelado.', 'Sucesso');
                setControle(controle + 1);
            } else {
                toastr.error(AxiosResponse.data.MESSAGE, 'Atenção');
            }
        }).catch(function (error) {
            Loading.hide();
            toastr.error(error.message || error, 'Erro ao cancelar agendamento!');
        });
    }

    function descreverFaixaEtaria(item) {
        if (item.IDADE_MINIMA && item.IDADE_MAXIMA) return `${item.IDADE_MINIMA} a ${item.IDADE_MAXIMA} anos`;
        if (item.IDADE_MINIMA) return `A partir de ${item.IDADE_MINIMA} anos`;
        if (item.IDADE_MAXIMA) return `Até ${item.IDADE_MAXIMA} anos`;
        return 'Todas as idades';
    }

    const agendamentosFiltrados = agendamentos.filter((item) => {
        if (!busca) return true;
        const alvo = `${item.DESCRICAO || ''} ${item.NOME_MODELO || ''}`.toLowerCase();
        return alvo.includes(busca.toLowerCase());
    });

    const conteudoHtml = (
        <div className='body'>
            <div className={`pt-2 mt-2`}>
                <div className='text-center'>
                    <h3 className='tituloD mb-1'>Agendamento de Disparos</h3>
                </div>
                <div className="row mt-4">
                    <div className='col-md-9 mt-1'>
                        <div className="input-group">
                            <input type="text" onChange={(e) => setBusca(e.target.value)}
                                className="form-control" placeholder="Buscar agendamento..." />
                        </div>
                    </div>
                    <div className='col-md-3 mt-1'>
                        <button className="btn btn-secondary float-end w-100" type="button"
                            onClick={() => AbrirNovo()}>Novo Agendamento</button>
                    </div>
                </div>
                <div className="row mt-3">
                    <div className='col-md-12'>
                        <table className="table table-responsive table-sm table-striped w-100">
                            <thead>
                                <tr className="tabela">
                                    <th scope="col">Código</th>
                                    <th scope="col">Descrição</th>
                                    <th scope="col">Mensagem</th>
                                    <th scope="col">Data/Hora Agendada</th>
                                    <th scope="col">Público</th>
                                    <th scope="col">Faixa Etária</th>
                                    <th scope="col">Status</th>
                                    <th scope="col">Ações</th>
                                </tr>
                            </thead>
                            <tbody className='text-center'>
                                {agendamentosFiltrados.length > 0 ? (
                                    agendamentosFiltrados.map((item) => (
                                        <tr key={item.ID_AGENDAMENTO}>
                                            <td>{item.ID_AGENDAMENTO}</td>
                                            <td>{item.DESCRICAO || '-'}</td>
                                            <td>{item.NOME_MODELO}</td>
                                            <td>{item.DATA_HORA_FORMATADA}</td>
                                            <td>{ROTULO_TIPO_PESSOA[item.TIPO_PESSOA] || item.TIPO_PESSOA}</td>
                                            <td>{descreverFaixaEtaria(item)}</td>
                                            <td>
                                                <span className={`badge ${BADGE_STATUS[item.STATUS] || 'bg-secondary'}`}>
                                                    {item.STATUS}
                                                </span>
                                                {item.STATUS !== 'PENDENTE' && item.TOTAL_DESTINATARIOS != null && (
                                                    <div className="small text-muted mt-1">
                                                        {item.TOTAL_ENVIADOS ?? 0}/{item.TOTAL_DESTINATARIOS} enviada(s)
                                                    </div>
                                                )}
                                            </td>
                                            <td>
                                                {item.STATUS === 'PENDENTE' ? (
                                                    <button className="btn btn-outline-danger btn-sm"
                                                        onClick={() => Cancelar(item.ID_AGENDAMENTO)}>Cancelar</button>
                                                ) : '-'}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="text-center">Nenhum agendamento encontrado</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal Novo Agendamento */}
            <div className="modal fade modal-md" id="modalAgendamento" data-bs-backdrop="false" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="modalAgendamentoLabel" aria-hidden="false">
                <div className='opaco'>
                    <div className='modal-dialog'>
                        <div className="modal-content">
                            <div className="modal-header">
                                <div className='row'>
                                    <h5 className="modal-title col-md-12 tituloC" id="modalAgendamentoLabel">Novo Agendamento de Disparo</h5>
                                </div>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <form className='container'>
                                    <div className="row">
                                        <div className="col-md-12 p-1">
                                            <b className="labelDescC">Descrição (opcional)</b>
                                            <input type="text" className="form-control form-control-sm"
                                                value={descricao} onChange={(e) => setDescricao(e.target.value)}
                                                placeholder="Ex: Convite culto de jovens" />
                                        </div>

                                        <div className="col-md-12 p-1">
                                            <b className="labelDescC">Público (tipo de pessoa)</b>
                                            <select className="form-select form-select-sm select"
                                                value={tipoPessoa} onChange={(e) => setTipoPessoa(e.target.value)}>
                                                <option value="">Selecione...</option>
                                                <option value="T">Todos</option>
                                                <option value="S">Apenas Membros</option>
                                                <option value="N">Apenas Visitantes</option>
                                            </select>
                                        </div>

                                        <div className="col-md-6 p-1">
                                            <b className="labelDescC">Idade mínima (opcional)</b>
                                            <input type="number" min="0" className="form-control form-control-sm"
                                                value={idadeMinima} onChange={(e) => setIdadeMinima(e.target.value)} />
                                        </div>
                                        <div className="col-md-6 p-1">
                                            <b className="labelDescC">Idade máxima (opcional)</b>
                                            <input type="number" min="0" className="form-control form-control-sm"
                                                value={idadeMaxima} onChange={(e) => setIdadeMaxima(e.target.value)} />
                                        </div>

                                        <div className="col-md-12 p-1">
                                            <b className="labelDescC">Template de Mensagem</b>
                                            <select className="form-select form-select-sm select"
                                                value={templateSelecionado} onChange={(e) => setTemplateSelecionado(e.target.value)}>
                                                <option value="">Selecione a mensagem...</option>
                                                {templates.map((tpl) => (
                                                    <option key={tpl.id} value={tpl.name}>{tpl.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="col-md-6 p-1">
                                            <b className="labelDescC">Data do Disparo</b>
                                            <input type="date" className="form-control form-control-sm"
                                                value={data} onChange={(e) => setData(e.target.value)} />
                                        </div>
                                        <div className="col-md-6 p-1">
                                            <b className="labelDescC">Horário do Disparo</b>
                                            <input type="time" className="form-control form-control-sm"
                                                value={hora} onChange={(e) => setHora(e.target.value)} />
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div className="modal-footer">
                                <button onClick={() => { LimparCampos(); window.$('#modalAgendamento').modal('hide'); }}
                                    type="button" className="btn btn-danger">Cancelar</button>
                                <button onClick={() => Salvar()} type="button" className="btn btn-success">Agendar</button>
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

export default MensagensAgendamento;

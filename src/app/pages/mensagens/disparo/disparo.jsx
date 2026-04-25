import React, { useState, useEffect } from 'react';
import NavBar from '../../../components/menu.jsx';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';
import api from '../../../config/api.js';
import Loading from '../../../components/loading/loading.js';


function MensagensDisparo() {
    const [templates, setTemplates] = useState([]);
    const [membro, setMembro] = useState('');
    const [templateSelecionado, setTemplateSelecionado] = useState('');
    const [controle, setControle] = useState(0);

    useEffect(() => {
        async function fetchTemplates() {
            Loading.show("Carregando templates...");
            try {
                const res = await api.get('/templates/listaMeta');
                if (res.data && res.data.DATA) {
                    setTemplates(res.data.DATA);
                }
            } catch (error) {
                toastr.error("Erro ao carregar templates da Meta", "Erro");
            } finally {
                Loading.hide();
            }
        }
        fetchTemplates();
    }, [controle]);

    function EnviarMensagem() {
        if (!membro || !templateSelecionado) {
            return toastr.warning("Selecione os destinatários e a mensagem.", "Atenção");
        }

        Loading.show('Iniciando disparos...')
        api.post(`/template/enviarMensagem`, {
            MEMBRO: membro,
            NOME_MODELO: templateSelecionado,
        }).then(function (AxiosResponse) {
            Loading.hide();
            if (AxiosResponse.data.SUCCESS === true) {
                toastr.success(AxiosResponse.data.MESSAGE || "Disparos concluídos!", "Sucesso");
            }
            else {
                toastr.error(AxiosResponse.data.MESSAGE, "Atenção");
            }

        }).catch(function (error) {
            Loading.hide();
            toastr.error(error.message || error, "Erro ao processar disparos!");
        });
    }

    const conteudoHtml = (
        <div className='body'>
            <div className={`pt-2 mt-2`}>
                <div className='text-center'>
                    <h3 className='tituloD mb-1'>Disparo de Mensagens WhatsApp</h3>
                </div>
                <div className="row mt-4">
                    <div className='col-md-5 mt-1'>
                        <b className="labelDescC">Destinatários</b>
                        <select
                            className="form-select form-select-sm select"
                            id='inputMembro'
                            value={membro}
                            onChange={(e) => setMembro(e.target.value)}
                        >
                            <option value="">Selecione...</option>
                            <option value="S">Todos os Membros</option>
                            <option value="N">Apenas Visitantes</option>
                        </select>
                    </div>
                    <div className='col-md-5 mt-1'>
                        <b className="labelDescC">Template de Mensagem</b>
                        <select
                            className="form-select form-select-sm select"
                            id='inputTemplate'
                            value={templateSelecionado}
                            onChange={(e) => setTemplateSelecionado(e.target.value)}
                        >
                            <option value="">Selecione a mensagem...</option>
                            {templates.map((tpl) => (
                                <option key={tpl.id} value={tpl.name}>{tpl.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className='col-md-2 mt-4'>
                        <button className="btn btn-secondary w-100" type="button" onClick={() => setControle(c => c + 1)}>
                            <i className="bi bi-arrow-clockwise me-1"></i>Atualizar
                        </button>
                    </div>
                </div>
                <div className="row mt-4">
                    <div className='col-md-12 text-center'>
                        <button onClick={() => EnviarMensagem()} className="btn btn-success btn-lg w-50" type="button">
                            <i className="bi bi-whatsapp me-2"></i>Disparar Mensagens Agora
                        </button>
                        <div className="alert alert-warning mt-4 mx-auto w-75 shadow-sm">
                            <i className="bi bi-exclamation-triangle-fill me-2"></i>
                            <b>Atenção:</b> O disparo em massa pode levar alguns minutos. Não feche esta tela até a conclusão do processo.
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

export default MensagensDisparo;

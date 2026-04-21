import React, { useState, useEffect } from 'react';
import NavBar from '../../../components/menu.jsx';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';
import api from '../../../config/api.js';
import Loading from '../../../components/loading/loading.js';


function MensagensDisparo() {

    const [templates, setTemplates] = useState([]);

    useEffect(() => {
        async function fetchTemplates() {
            try {
                const res = await api.get('/templates/listaMeta');
                if (res.data && res.data.DATA) {
                    setTemplates(res.data.DATA);
                }
            } catch (error) {
                console.error("Erro ao carregar templates", error);
            }
        }
        fetchTemplates();
    }, []);

    function EnviarMensagem() {
        Loading.show('Aguarde...')
        api.post(`/template/enviarMensagem`, {
            MEMBRO: document.getElementById('inputMembro').value,
            NOME_MODELO: document.getElementById('inputTemplate').value,
        }).then(function (AxiosResponse) {
            Loading.hide();
            if (AxiosResponse.data.SUCCESS === true) {
                toastr.success(AxiosResponse.data.MESSAGE, "Sucesso");
            }
            else {
                toastr.error(AxiosResponse.data.MESSAGE, "Atenção");
            }

        }).catch(function (error) {
            Loading.hide();
            toastr.error(error, "Erro ao cadastrar dados!")
        });
    }

    const conteudoHtml = (
        <div className='body'>
            <div className={`pt-2 mt-2`}>
                <div className='text-center'>
                    <h3 className='tituloD mb-1'>Disparo de Mensagens WhatsApp</h3>
                </div>
                <div className="row mt-4">
                    <div className='col-md-6 mt-1'>
                        <b className="labelDescC">Selecione a Lista de Destinatários</b>
                        <select className="form-select form-select-sm select" id='inputMembro'>
                            <option value="">Selecione...</option>
                            <option value="S">Todos os Membros</option>
                            <option value="N">Apenas Visitantes</option>
                        </select>
                    </div>
                    <div className='col-md-6 mt-1'>
                        <b className="labelDescC">Selecione a Mensagem</b>
                        <select className="form-select form-select-sm select" id='inputTemplate'>
                            <option value="">Selecione a mensagem já cadastrada...</option>
                            {templates.map((tpl) => (
                                <option key={tpl.id} value={tpl.name}>{tpl.nome}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="row mt-4">
                    <div className='col-md-12 text-center'>
                        <button onClick={() => EnviarMensagem()} className="btn btn-success btn-lg w-50" type="button">
                            Disparar Mensagens Agora
                        </button>
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

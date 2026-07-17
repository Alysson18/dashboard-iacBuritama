import React, { useState, useEffect, useRef, useCallback } from 'react';
import NavBar from '../../components/menu.jsx';
import api from '../../config/api.js';
import Loading from '../../components/loading/loading.js';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';
import '../css/estilo.css';

const META_APP_ID = process.env.REACT_APP_META_APP_ID;
const META_CONFIG_ID = process.env.REACT_APP_META_CONFIG_ID;
const FB_SDK_VERSION = 'v22.0';

// Carrega o SDK JS da Meta uma única vez (usado pelo botão de Embedded Signup)
let fbSdkPromise = null;
function carregarFacebookSdk() {
    if (fbSdkPromise) return fbSdkPromise;

    fbSdkPromise = new Promise((resolve) => {
        if (window.FB) {
            resolve(window.FB);
            return;
        }

        window.fbAsyncInit = function () {
            window.FB.init({
                appId: META_APP_ID,
                autoLogAppEvents: true,
                xfbml: false,
                version: FB_SDK_VERSION
            });
            resolve(window.FB);
        };

        const script = document.createElement('script');
        script.src = 'https://connect.facebook.net/pt_BR/sdk.js';
        script.async = true;
        script.defer = true;
        script.crossOrigin = 'anonymous';
        document.body.appendChild(script);
    });

    return fbSdkPromise;
}

const ConfigWhatsApp = () => {
    const [status, setStatus] = useState(null);
    const [conectando, setConectando] = useState(false);
    const [controle, setControle] = useState(0);
    const signupDataRef = useRef({});

    const carregarStatus = useCallback(async () => {
        Loading.show('Aguarde....');
        try {
            const res = await api.get('/whatsapp/config');
            if (res.data.SUCCESS) {
                setStatus(res.data.DATA);
            }
        } catch (error) {
            toastr.error('Erro ao carregar status da integração WhatsApp.');
        } finally {
            Loading.hide();
        }
    }, []);

    useEffect(() => {
        carregarStatus();
    }, [carregarStatus, controle]);

    // Escuta o evento que a Meta dispara dentro do popup de Embedded Signup com os IDs do número conectado
    useEffect(() => {
        const handleMessage = (event) => {
            if (typeof event.origin !== 'string' || !event.origin.endsWith('facebook.com')) return;

            try {
                const data = JSON.parse(event.data);
                if (data.type === 'WA_EMBEDDED_SIGNUP' && data.event === 'FINISH') {
                    signupDataRef.current = {
                        phone_number_id: data.data?.phone_number_id,
                        waba_id: data.data?.waba_id,
                        business_id: data.data?.business_id
                    };
                }
            } catch (e) {
                // Mensagens que não são do Embedded Signup (não são JSON) são ignoradas
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    const finalizarConexao = async (code) => {
        const { phone_number_id, waba_id, business_id } = signupDataRef.current;

        if (!code || !phone_number_id || !waba_id) {
            toastr.error('Não foi possível concluir a conexão com a Meta. Tente novamente.');
            setConectando(false);
            return;
        }

        Loading.show('Conectando número do WhatsApp...');
        try {
            const res = await api.post('/whatsapp/connect', { code, phone_number_id, waba_id, business_id });
            if (res.data.SUCCESS) {
                toastr.success(res.data.MESSAGE || 'WhatsApp conectado com sucesso!');
                setControle(prev => prev + 1);
            } else {
                toastr.error(res.data.MESSAGE || 'Erro ao conectar o WhatsApp.');
            }
        } catch (error) {
            toastr.error(error.response?.data?.MESSAGE || 'Erro na comunicação com o servidor.');
        } finally {
            setConectando(false);
            Loading.hide();
        }
    };

    const conectarWhatsApp = async () => {
        if (!META_APP_ID || !META_CONFIG_ID) {
            toastr.warning('Integração ainda não configurada. Preencha REACT_APP_META_APP_ID e REACT_APP_META_CONFIG_ID no .env do Dashboard.', 'Atenção');
            return;
        }

        setConectando(true);
        signupDataRef.current = {};

        try {
            const FB = await carregarFacebookSdk();

            FB.login((response) => {
                if (response.authResponse && response.authResponse.code) {
                    finalizarConexao(response.authResponse.code);
                } else {
                    setConectando(false);
                    toastr.info('Conexão cancelada.');
                }
            }, {
                config_id: META_CONFIG_ID,
                response_type: 'code',
                override_default_response_type: true,
                extras: { version: 'v4' }
            });
        } catch (error) {
            setConectando(false);
            toastr.error('Não foi possível carregar o SDK da Meta. Verifique sua conexão e tente novamente.');
        }
    };

    const desconectarWhatsApp = async () => {
        if (!window.confirm('Deseja realmente desconectar o número do WhatsApp? O sistema voltará a usar a configuração padrão.')) return;

        Loading.show('Desconectando...');
        try {
            const res = await api.post('/whatsapp/disconnect');
            if (res.data.SUCCESS) {
                toastr.success('WhatsApp desconectado.');
                setControle(prev => prev + 1);
            } else {
                toastr.error(res.data.MESSAGE || 'Erro ao desconectar.');
            }
        } catch (error) {
            toastr.error('Erro na comunicação com o servidor.');
        } finally {
            Loading.hide();
        }
    };

    const conectado = status?.CONECTADO;

    const conteudoHtml = (
        <div className="body">
            <div className="pt-2 mt-2">
                <div className="text-center">
                    <h3 className="tituloD mb-1">Integração WhatsApp</h3>
                    <p className="text-muted">Conecte um número que já possui WhatsApp Business para o sistema enviar mensagens automaticamente.</p>
                </div>

                <div className="row mt-4 justify-content-center">
                    <div className="col-md-8">
                        <div className={`card shadow-sm ${conectado ? 'border-success' : ''}`}>
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h5 className="mb-0"><i className="bi bi-whatsapp me-2"></i>Status da Conexão</h5>
                                    <span className={`badge ${conectado ? 'bg-success' : 'bg-secondary'}`}>
                                        {conectado ? 'Conectado' : 'Não conectado'}
                                    </span>
                                </div>

                                {conectado ? (
                                    <>
                                        <p className="mb-1"><strong>Número:</strong> {status.DISPLAY_PHONE_NUMBER || '-'}</p>
                                        <p className="mb-1"><strong>Nome Verificado:</strong> {status.VERIFIED_NAME || '-'}</p>
                                        <p className="mb-3 text-muted">
                                            <small>Conectado em: {status.DATA_CONEXAO ? new Date(status.DATA_CONEXAO).toLocaleString('pt-BR') : '-'}</small>
                                        </p>
                                        <button className="btn btn-outline-success me-2" onClick={conectarWhatsApp} disabled={conectando}>
                                            <i className="bi bi-arrow-repeat me-1"></i> {conectando ? 'Conectando...' : 'Reconectar / Trocar número'}
                                        </button>
                                        <button className="btn btn-outline-danger" onClick={desconectarWhatsApp}>
                                            <i className="bi bi-x-circle me-1"></i> Desconectar
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-muted">Nenhum número conectado por essa integração. O sistema está usando a configuração padrão atual.</p>
                                        <button className="btn btn-success" onClick={conectarWhatsApp} disabled={conectando}>
                                            <i className="bi bi-whatsapp me-1"></i> {conectando ? 'Conectando...' : 'Conectar número do WhatsApp Business'}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="alert alert-info mt-3 shadow-sm">
                            <i className="bi bi-info-circle-fill me-2"></i>
                            Ao clicar em conectar, uma janela da Meta será aberta para você entrar com a conta do Facebook vinculada ao WhatsApp Business e selecionar (ou verificar) o número desejado. Depois de conectado, todas as mensagens automáticas do sistema passam a usar esse número.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return <NavBar conteudo={conteudoHtml} />;
};

export default ConfigWhatsApp;

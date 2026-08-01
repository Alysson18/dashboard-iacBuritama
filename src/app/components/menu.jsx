import React, { useEffect, useRef, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../config/api.js'
import './styles.css';
import Loading from '../components/loading/loading';
import CryptoJS from 'crypto-js';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';
import md5 from 'md5';
import PlanejamentoGastos from '../pages/relatorios/extratoMensalLista/extratoLista.jsx';
import { socket } from '../config/socket.js';
import { Redirect } from 'react-router-dom/cjs/react-router-dom.min.js';
import { AuthContext } from '../Context/auth.jsx';
import Logo from './Logo.jsx';


function Menu({ conteudo }) {
    const { tipoUsuario, igrejaAtual, igrejasDisponiveis, setIgrejaAtual, setIgrejasDisponiveis } = useContext(AuthContext);


    function encryptData(data) {
        return CryptoJS.AES.encrypt(data.toString(), 'Alysson-2025-IACBURITAMA').toString();
    }

    function decryptData(encryptedData) {
        if (!encryptedData) return "";
        const bytes = CryptoJS.AES.decrypt(encryptedData.toString(), 'Alysson-2025-IACBURITAMA');
        return bytes.toString(CryptoJS.enc.Utf8);
    }

    function hasPermission(key) {
        try {
            const raw = decryptData(sessionStorage.getItem('permissoes'));
            const perms = JSON.parse(raw || '[]');
            return perms.includes(key);
        } catch (e) {
            return false;
        }
    }

    function Logout() {
        socket.disconnect();
        sessionStorage.clear();
        localStorage.clear();
        window.location.href = '/';
    }


    function alterarSenha() {
        const novaSenha = document.getElementById("novaSenha").value;
        const confirmarSenha = document.getElementById("confirmarSenha").value;

        if (novaSenha !== '') {
            if (novaSenha !== confirmarSenha) {
                toastr.warning("As senhas não coincidem. Por favor, verifique.", 'Atenção');
                return;
            }
            else {
                Loading.show('Aguarde...')
                api.put('/senha', {
                    "ID_USUARIO": decryptData(sessionStorage.getItem('id_usuario')),
                    "SENHA": md5(novaSenha)
                }).then((Response) => {
                    // Fechar modal após salvar (simulado)
                    if (Response.data.SUCCESS) {
                        window.$('#alterarSenhaModal').modal('hide');
                        toastr.success("Senha alterada com sucesso!", "Sucesso.");
                        document.getElementById("novaSenha").value = '';
                        document.getElementById("confirmarSenha").value = '';
                    }
                    else {
                        toastr.error(Response.data.MESSAGE, "Erro");
                    }
                }).catch((error) => {
                    toastr.error(error, "Erro");
                }).finally(() => {
                    Loading.hide()
                })
            }
        } else {
            toastr.warning('Todos os campos devem ser prenchidos', "Erro ao cadastrar dados!");
        }


    }


    // Multi-igreja: busca as igrejas que o usuário logado pode acessar (o backend resolve pelo
    // token, não precisa mandar id_usuario). Mantém o AuthContext (e o cache em sessionStorage)
    // atualizado, mesmo se os dados já tiverem vindo populados do login.
    useEffect(() => {
        const fetchIgrejas = async () => {
            try {
                const res = await api.get('/minhas-igrejas');
                if (res.data.SUCCESS) {
                    const lista = res.data.DATA || [];
                    setIgrejasDisponiveis(lista);

                    // Se a igreja atual não estiver mais na lista (ou não tiver nenhuma selecionada ainda),
                    // seleciona a primeira disponível.
                    const aindaValida = igrejaAtual && lista.some(i => i.ID_IGREJA === igrejaAtual.ID_IGREJA);
                    if (!aindaValida && lista.length > 0) {
                        setIgrejaAtual(lista[0]);
                        if (lista[0].LOGO_URL) localStorage.setItem('igreja_logo_url', lista[0].LOGO_URL);
                    }
                }
            } catch (e) {
                // Falha silenciosa: mantém o que já estiver em cache (ex: backend ainda sem essa rota)
            }
        };
        fetchIgrejas();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function trocarIgreja(idIgreja) {
        const nova = igrejasDisponiveis.find(i => String(i.ID_IGREJA) === String(idIgreja));
        if (!nova) return;

        setIgrejaAtual(nova);
        if (nova.LOGO_URL) localStorage.setItem('igreja_logo_url', nova.LOGO_URL);

        // Se "Mantenha-me conectado" estiver ativo, mantém o localStorage sincronizado também
        if (localStorage.getItem('expiracao')) {
            localStorage.setItem('igreja_atual', encryptData(JSON.stringify(nova)));
        }

        // Recarrega a aplicação para garantir que todas as telas voltem a buscar dados
        // já filtrados pela nova igreja selecionada (mesmo padrão usado em outros sistemas
        // do Alysson para troca de empresa/contexto).
        window.location.reload();
    }


    // Global Notification effect
    useEffect(() => {
        // O socket é um singleton compartilhado por toda a sessão (importado do módulo
        // config/socket.js) — como o Menu remonta a cada troca de página (não há um layout
        // persistente), NÃO desconectamos no cleanup abaixo, só ao deslogar (ver Logout()).
        // Chamar connect() numa conexão já ativa/conectando é um no-op seguro do socket.io.
        if (!socket.connected) {
            socket.connect();
        }
        const audio = new Audio("https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg ");

        // Request notification permission
        const askPermission = async () => {
            if ("Notification" in window && Notification.permission === "default") {
                await Notification.requestPermission();
            }
        };
        askPermission();

        // Wake Lock to keep screen on (best effort for mobile background)
        let wakeLock = null;
        const requestWakeLock = async () => {
            try {
                if ('wakeLock' in navigator) {
                    wakeLock = await navigator.wakeLock.request('screen');
                }
            } catch (err) {
                console.error(`${err.name}, ${err.message}`);
            }
        };
        requestWakeLock();

        const decryptLocal = (encryptedData) => {
            if (!encryptedData) return "";
            const bytes = CryptoJS.AES.decrypt(encryptedData.toString(), 'Alysson-2025-IACBURITAMA');
            return bytes.toString(CryptoJS.enc.Utf8);
        };

        const isViewingThisTicket = (targetWaId) => {
            const urlParams = new URLSearchParams(window.location.search);
            const currentPath = window.location.pathname;
            const currentWaId = urlParams.get('wa_id');
            return currentPath.includes('/atendimento/chat') && currentWaId === targetWaId;
        };

        const showNotification = (title, body, payload) => {
            if ("Notification" in window && Notification.permission === "granted") {
                try {
                    const notification = new Notification(title, { body, icon: '/img/logoBranca.png' });
                    notification.onclick = () => {
                        window.focus();
                        const encryptedId = CryptoJS.AES.encrypt(payload.ID_TICKET.toString(), 'Alysson-2025-IACBURITAMA').toString();
                        sessionStorage.setItem('ticket', encryptedId);
                        window.location.href = `/app/atendimento/chat?wa_id=${payload.WA_ID || ''}&nome=${payload.NOME || 'Cliente'}`;
                    };
                } catch (e) {
                    toastr.info(body, title);
                }
            } else {
                toastr.info(body, title);
            }
        };

        const handleTicketNovo = (payload) => {
            if (payload.REMETENTE === 'CLIENTE') {
                audio.play().catch(e => console.log("Audio block", e));

                // Se já estiver na conversa, não mostra notificação visual
                if (isViewingThisTicket(payload.WA_ID)) return;

                const title = "🎫 Novo Ticket WhatsApp de: " + payload.NOME;
                const bodyMsg = payload.TEXTO ? (payload.TEXTO.length > 40 ? payload.TEXTO.substring(0, 40) + '...' : payload.TEXTO) : "Novo ticket aberto";
                showNotification(title, bodyMsg, payload);
            }
        };

        const handleConversaTicket = (payload) => {
            if (payload.REMETENTE === 'CLIENTE') {
                const myId = decryptLocal(sessionStorage.getItem('id_usuario'));
                // Notifica apenas se eu for o dono do ticket
                if (payload.ID_OPERADOR && String(payload.ID_OPERADOR) === String(myId)) {
                    audio.play().catch(e => console.log("Audio block", e));

                    // Se já estiver na conversa, não mostra notificação visual
                    if (isViewingThisTicket(payload.WA_ID)) return;

                    const title = "💬 Nova Mensagem de: " + payload.NOME;
                    const bodyMsg = payload.TEXTO ? (payload.TEXTO.length > 40 ? payload.TEXTO.substring(0, 40) + '...' : payload.TEXTO) : "Mensagem recebida";
                    showNotification(title, bodyMsg, payload);
                }
            }
        };



        socket.on('ticket_novo', handleTicketNovo);
        socket.on('conversa_ticket', handleConversaTicket);

        return () => {
            // Só remove os listeners deste componente — a conexão em si continua viva
            // pra próxima página não precisar reconectar do zero.
            socket.off('ticket_novo', handleTicketNovo);
            socket.off('conversa_ticket', handleConversaTicket);
            if (wakeLock !== null) {
                wakeLock.release().then(() => { wakeLock = null; });
            }
        };
    }, []);

    useEffect(() => {
        var trigger = window.$('.hamburger'),
            overlay = window.$('.overlay'),
            isClosed = false;

        function hamburger_cross() {
            if (isClosed) {
                overlay.hide();
                trigger.removeClass('is-open').addClass('is-closed');
                isClosed = false;
            } else {
                overlay.show();
                trigger.removeClass('is-closed').addClass('is-open');
                isClosed = true;
            }
        }

        trigger.click(hamburger_cross);

        window.$('[data-toggle="offcanvas"]').click(function () {
            window.$('#wrapper').toggleClass('toggled');
        });

        // Cleanup dos eventos ao desmontar o componente
        return () => {
            trigger.off('click', hamburger_cross);
            window.$('[data-toggle="offcanvas"]').off('click');
        };
    }, []);

    return (
        <div id="wrapper">
            <div className="overlay"></div>

            {/* Navbar */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark color fixed-top navTop">
                <div className="container-fluid">

                    <button type="button" className="btn btn-outline-light me-0" data-toggle="offcanvas">
                        <i class="bi bi-list"></i>
                    </button>

                    {/* Seletor de igreja: mesmo lugar/estilo do seletor de empresa no financeiro-abac
                        (navbar de cima, não na sidebar) — aparece sempre que houver ao menos 1 igreja */}
                    {igrejasDisponiveis && igrejasDisponiveis.length > 0 && (
                        <div className="navbar-brand ms-0">
                            <select
                                onChange={(e) => trocarIgreja(e.target.value)}
                                value={igrejaAtual ? igrejaAtual.ID_IGREJA : ''}
                                className="form-select w-100 entidades"
                                aria-label="Igreja selecionada"
                                id="select_igreja"
                            >
                                {igrejasDisponiveis.map(ig => (
                                    <option className="text-black" key={ig.ID_IGREJA} value={ig.ID_IGREJA}>
                                        {ig.NOME}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="collapse navbar-collapse" id="navbarNav">
                    </div>
                </div>
            </nav >

            {/* Sidebar */}
            < nav className="navbar navbar-inverse fixed-top" id="sidebar-wrapper" role="navigation" >
                <ul className="nav sidebar-nav">
                    <div className="sidebar-header">
                        <div className="sidebar-brand">
                            <Logo className='mt-2' width='93%' alt='Logo' />
                        </div>
                    </div>
                    {hasPermission('HOME') && <li><Link className="nav-link home" to="/app/home">Home</Link></li>}
                    {(hasPermission('PESSOAS') || hasPermission('EVENTOS')) && (
                        <li className="dropdown">
                            <a href="#acessosRede" className="dropdown-toggle" data-toggle="dropdown">
                                Acessos a Rede <span className="caret"></span>
                            </a>
                            <ul className="dropdown-menu animated fadeInLeft" role="menu">
                                <div className="dropdown-header">Cadastros</div>
                                {hasPermission('PESSOAS') && <li><Link className="nav-link usuario" to="/app/cadastros/pessoas">Cadastro de Acesso</Link></li>}
                                {hasPermission('EVENTOS') && <li><Link className="nav-link evento" to="/app/cadastros/eventos">Cadastro de Eventos</Link></li>}
                                <div className="dropdown-header">Dados</div>
                                <li><Link className="nav-link grafico" to="/app/acessos/acesso-periodo">Acessos por Periodo</Link></li>
                                <li><Link className="nav-link grafico" to="/app/acessos/quantidade-acesso">Qtd. Acessos por Pessoas</Link></li>
                                <li><Link className="nav-link grafico" to="/app/dados/dashboard-acessos">Dashboard de Acessos</Link></li>
                                <li><Link className="nav-link grafico" to="/app/dados/membros-ausentes">Membros Ausentes</Link></li>
                                <li><Link className="nav-link grafico" to="/app/dados/acessos-por-evento">Acessos por Evento</Link></li>
                                <div className="dropdown-header">Sorteio</div>
                                <li><Link className="nav-link sorteio" to="/app/acessos/sorteio">Sortear</Link></li>
                            </ul>
                        </li>
                    )}
                    {hasPermission('MENSAGENS') && (
                        <li className="dropdown">
                            <a href="#mensagens" className="dropdown-toggle" data-toggle="dropdown">
                                Mensagens<span className="caret"></span>
                            </a>
                            <ul className="dropdown-menu animated fadeInLeft" role="menu">
                                <div className="dropdown-header">Cadastros</div>
                                <li><Link className="nav-link email" to="/app/mensagens/cadastro">Cadastrar Mensagens</Link></li>
                                <div className="dropdown-header">Disparo</div>
                                <li><Link className="nav-link whatsapp" to="/app/mensagens/disparo">Disparo WhatsApp</Link></li>
                                <li><Link className="nav-link email" to="/app/mensagens/agendamento">Agendar Disparo</Link></li>
                                {hasPermission('META_ANALYTICS') && (
                                    <>
                                        <div className="dropdown-header">Analytics</div>
                                        <li><Link className="nav-link grafico" to="/app/dados/meta-analytics">Estatísticas Meta</Link></li>
                                    </>
                                )}
                            </ul>
                        </li>
                    )}

                    {hasPermission('ATENDIMENTO') && (
                        <li className="dropdown">
                            <a href="#atendimento" className="dropdown-toggle whatsapp" data-toggle="dropdown">
                                Atendimento<span className="caret"></span>
                            </a>
                            <ul className="dropdown-menu animated fadeInLeft" role="menu">
                                <div className="dropdown-header">Atendimento</div>
                                <li><Link className="nav-link whatsapp" to="/app/atendimento/tickets">WhatsApp</Link></li>
                                <li><Link className="nav-link grafico" to="/app/atendimento/metricas">Métricas de Atendimento</Link></li>
                            </ul>
                        </li>
                    )}

                    <li className="dropdown">
                        <a href="#services" className="dropdown-toggle" data-toggle="dropdown">
                            Configurações <span className="caret"></span>
                        </a>
                        <ul className="dropdown-menu animated fadeInLeft" role="menu">
                            <div className="dropdown-header">Usuário</div>
                            <li><Link className="nav-link key" data-bs-toggle="modal" data-bs-target="#alterarSenhaModal">Alterar Senha</Link></li>
                            {(hasPermission('USUARIOS') || hasPermission('SETORES')) && <div className="dropdown-header">Administração</div>}
                            {hasPermission('USUARIOS') && <li><Link className="nav-link usuario" to="/app/cadastros/usuarios">Gestão de Usuários</Link></li>}
                            {/* Checagem de tipoUsuario aqui é só UX (esconder o link); a barreira real fica no backend (SistemaRoute só redireciona, e a API confere de novo). */}
                            {tipoUsuario === 'SISTEMA' && <li><Link className="nav-link setor" to="/app/cadastros/igrejas">Gestão de Igrejas</Link></li>}
                            {hasPermission('SETORES') && <li><Link className="nav-link setor" to="/app/cadastros/setores">Gestão de Setores</Link></li>}
                            {hasPermission('MENUBOT') && <li><Link className="nav-link robot" to="/app/cadastros/menu-bot">Menu do WhatsApp</Link></li>}
                            {hasPermission('LINKS_PORTAL') && <li><Link className="nav-link wifi" to="/app/cadastros/links">Links do Portal Wi-Fi</Link></li>}
                            {hasPermission('HORARIOS') && <li><Link className="nav-link horarios" to="/app/configuracoes/horarios">Horários de Atendimento</Link></li>}
                            {hasPermission('WHATSAPP_CONFIG') && <li><Link className="nav-link whatsapp" to="/app/configuracoes/whatsapp">Integração WhatsApp</Link></li>}
                        </ul>
                    </li>
                    <li className='mb-5'><Link className="nav-link logout" to="/" onClick={() => Logout()}>Logout</Link></li>
                </ul>
            </nav >

            {/* Content */}
            < div id="page-content-wrapper" >
                {/* <button type="button" className="hamburger animated fadeInLeft is-closed" data-toggle="offcanvas">
                    <span className="hamb-top"></span>
                    <span className="hamb-middle"></span>
                    <span className="hamb-bottom"></span>
                </button> */}
                < div className="container-fluid" >
                    <div className="row">
                        {conteudo}
                    </div>
                </div >
            </div >





            {/*Estrutura do Modal*/}
            <div class="modal fade" id="alterarSenhaModal" tabindex="-1" aria-labelledby="alterarSenhaModalLabel" aria-hidden="true" ata-bs-backdrop="false" data-bs-keyboard="false">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="alterarSenhaModalLabel">Alterar Senha</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
                        </div>
                        <div class="modal-body">
                            <form id="alterarSenhaForm">
                                <div class="mb-1">
                                    <b className="labelDescC">Nova Senha</b>
                                    <input type="password" class="form-control" id="novaSenha"
                                        laceholder="Digite a nova senha" required />
                                </div>
                                <div class="mb-2">
                                    <b className="labelDescC">Confirme a Nova Senha</b>
                                    <input type="password" class="form-control" id="confirmarSenha"
                                        placeholder="Confirme a nova senha" required />
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-primary" onClick={() => alterarSenha()}>Salvar</button>
                        </div>
                    </div>
                </div>
            </div>

        </div >
    );
}

export default Menu;

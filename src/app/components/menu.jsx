import React, { useEffect, useState, useRef } from 'react';
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


function Menu({ conteudo }) {
    const [empresas, setEmpresas] = useState([])


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
        sessionStorage.clear();
        localStorage.clear();

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


    // useState(() => {
    //     Loading.show('Aguarde...')
    //     const fetchGetList = async () => {
    //         const res = await api.get("/usuario/empresas?id_usuario=" + decryptData(sessionStorage.getItem("id_usuario")));
    //         setEmpresas(res.data.DATA)
    //         Loading.hide();
    //     }
    //     fetchGetList();
    //     // eslint-disable-next-line
    // }, '')


    // Global Notification effect
    useEffect(() => {
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
                    const notification = new Notification(title, { body, icon: '/img/logoHorizontalBranca.png' });
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

                    <div className="collapse navbar-collapse" id="navbarNav">
                    </div>
                </div>
            </nav >

            {/* Sidebar */}
            < nav className="navbar navbar-inverse fixed-top" id="sidebar-wrapper" role="navigation" >
                <ul className="nav sidebar-nav">
                    <div className="sidebar-header">
                        <div className="sidebar-brand">
                            <img className='mt-2' src='../../../img/logoHorizontalBranca.png' width='93%' />
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
                            {hasPermission('SETORES') && <li><Link className="nav-link setor" to="/app/cadastros/setores">Gestão de Setores</Link></li>}
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

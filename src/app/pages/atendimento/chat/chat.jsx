import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import NavBar from '../../../components/menu.jsx';
import api from '../../../config/api.js';
import Loading from '../../../components/loading/loading.js';
import { io } from "socket.io-client";
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';
import './chat.css';
import CryptoJS from 'crypto-js';

import { socket } from '../../../config/socket.js';

function TicketChat() {
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const wa_id = query.get('wa_id') || "";
    const nome = query.get('nome') || "Cliente";
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [ticketInfo, setTicketInfo] = useState(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const messagesEndRef = useRef(null);
    const emojis = ["😀", "😃", "😄", "😁", "😅", "😂", "🤣", "😊", "😇", "🙂", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩", "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣", "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬", "🤯", "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓", "🤗", "🤔", "🤭", "🤫", "🤥", "😶", "😐", "😑", "😬", "🙄", "😯", "😦", "😧", "😮", "😲", "🥱", "😴", "🤤", "😪", "😵", "🤐", "🥴", "🤢", "🤮", "🤧", "😷", "🤒", "🤕", "🤑", "🤠", "😈", "👿", "👹", "👺", "🤡", "💩", "👻", "💀", "☠️", "👽", "👾", "🤖", "🎃", "😺", "😸", "😻", "😼", "😽", "🙀", "😿", "😾", "👋", "🤚", "🖐", "✋", "🖖", "👌", "🤏", "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉", "👆", "🖕", "👇", "☝️", "👍", "👎", "✊", "👊", "🤛", "🤜", "👏", "🙌", "👐", "🤲", "🤝", "🙏", "✍️", "💅", "🤳", "💪", "🦾", "🦵", "🦿", "🦶", "👣", "👂", "🦻", "👃", "🧠", "🦷", "🦴", "👀", "👁", "👅", "👄", "💋", "🩸", "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟"];

    const [replyingTo, setReplyingTo] = useState(null);
    const [setores, setSetores] = useState([]);
    const [operadores, setOperadores] = useState([]);
    const [transferTarget, setTransferTarget] = useState({ id_setor: '', id_operador: '' });

    const decryptData = (encryptedData) => {
        if (!encryptedData) return "";
        const bytes = CryptoJS.AES.decrypt(encryptedData.toString(), 'Alysson-2025-IACBURITAMA');
        return bytes.toString(CryptoJS.enc.Utf8);
    };



    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchTicketDetail = async () => {
        try {
            const res = await api.get(`/tickets/${decryptData(sessionStorage.getItem('ticket'))}`);
            setTicketInfo(res.data);
        } catch (e) {
            console.error("Erro ao buscar ticket", e);
        }
    };

    const fetchData = async () => {
        Loading.show("Carregando...");
        try {
            const [resMsg, resSetores, resOps] = await Promise.all([
                api.get(`/tickets/${decryptData(sessionStorage.getItem('ticket'))}/mensagens`),
                api.get('/setores'),
                api.get('/usuarios/lista')
            ]);

            if (Array.isArray(resMsg.data)) setMessages(resMsg.data);
            else if (resMsg.data && Array.isArray(resMsg.data.DATA)) setMessages(resMsg.data.DATA);

            if (resSetores.data.SUCCESS) setSetores(resSetores.data.DATA);
            if (resOps.data.SUCCESS) setOperadores(resOps.data.DATA);
        } catch (error) {
            toastr.error("Erro ao obter dados");
        } finally {
            Loading.hide();
        }
    };

    useEffect(() => {
        fetchTicketDetail();
        fetchData();

        const handleNovaMensagem = (payload) => {
            if (String(payload.ID_TICKET) === String(decryptData(sessionStorage.getItem('ticket')))) {
                setMessages(prev => [...prev, payload]);
                fetchTicketDetail(); // Atualiza o status/operador caso tenha mudado
            }
        };

        const handleTransferNotification = (data) => {
            const myId = decryptData(sessionStorage.getItem('id_usuario'));
            if (String(data.ID_TICKET) === String(decryptData(sessionStorage.getItem('ticket')))) {
                fetchTicketDetail();
                toastr.info("Este atendimento foi transferido/atualizado.");
            } else if (String(data.ID_OPERADOR) === String(myId)) {
                toastr.success("Um novo ticket foi transferido para você!");
            }
        };

        socket.on('ticket_novo', handleNovaMensagem);
        socket.on('conversa_ticket', handleNovaMensagem);
        socket.on('ticket_transferido', handleTransferNotification);

        return () => {
            socket.off('ticket_novo', handleNovaMensagem);
            socket.off('conversa_ticket', handleNovaMensagem);
            socket.off('ticket_transferido', handleTransferNotification);
        };
    }, [decryptData(sessionStorage.getItem('ticket'))]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const isWindowExpired = () => {
        const lastClientMsg = [...messages].reverse().find(m => m.REMETENTE === 'CLIENTE');
        if (!lastClientMsg) return false;
        const diff = new Date() - new Date(lastClientMsg.DATA_ENVIO);
        return diff > 24 * 60 * 60 * 1000;
    };

    const expired = isWindowExpired();

    const handleCapture = async () => {
        Loading.show("Capturando...");
        try {
            const myId = decryptData(sessionStorage.getItem('id_usuario'));
            const res = await api.put(`/tickets/${decryptData(sessionStorage.getItem('ticket'))}/status`, {
                STATUS: 'EM_ANDAMENTO',
                WA_ID: wa_id,
                ID_OPERADOR: myId
            });
            if (res.data.SUCCESS) {
                toastr.success("Você capturou este atendimento!");
                fetchTicketDetail();
            }
        } catch (e) {
            toastr.error("Erro ao capturar");
        } finally {
            Loading.hide();
        }
    };

    const handleCloseTicket = async () => {
        if (!window.confirm("Deseja realmente encerrar este atendimento? O cliente receberá aviso de encerramento.")) return;
        Loading.show("Encerrando...");
        try {
            const res = await api.put(`/tickets/${decryptData(sessionStorage.getItem('ticket'))}/status`, {
                STATUS: 'FECHADO',
                WA_ID: wa_id
            });
            if (res.data.SUCCESS) {
                toastr.success("Atendimento encerrado com sucesso.");
                window.location.href = '/app/atendimento/tickets';
            } else {
                toastr.error(res.data.MESSAGE, "Erro ao encerrar");
            }
        } catch (e) {
            toastr.error("Erro na requisição de encerramento");
        } finally {
            Loading.hide();
        }
    };


    const handleTransfer = async () => {
        if (!transferTarget.id_setor && !transferTarget.id_operador) {
            return toastr.warning("Selecione pelo menos um destino.");
        }
        Loading.show("Transferindo...");
        try {
            const res = await api.put(`/tickets/${decryptData(sessionStorage.getItem('ticket'))}/transferir`, {
                ID_OPERADOR: transferTarget.id_operador || null,
                ID_SETOR: transferTarget.id_setor || null,
                STATUS: transferTarget.id_operador ? 'EM_ANDAMENTO' : 'ABERTO'
            });
            if (res.data.SUCCESS) {
                toastr.success("Transferência realizada!");
                window.location.href = '/app/atendimento/tickets';
            }
        } catch (e) {
            toastr.error("Erro ao transferir");
        } finally {
            Loading.hide();
        }
    };

    const scrollToMessage = (wamid) => {
        if (!wamid) return;
        const element = document.getElementById(`msg-${wamid}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.classList.add('highlight-target');
            setTimeout(() => {
                element.classList.remove('highlight-target');
            }, 2000);
        } else {
            toastr.info("Mensagem original não encontrada no histórico visível.");
        }
    };

    const handleSendMessage = async (e) => {
        e?.preventDefault();
        if (!newMessage.trim() || expired) return;

        const operName = decryptData(sessionStorage.getItem('nome_usuario')) + ':' || "Atendente";
        const tempMsg = newMessage;
        const formattedMsg = `*${operName}*\n${tempMsg}`;

        const payload = {
            WA_ID: wa_id,
            TEXTO: formattedMsg,
            ID_OPERADOR: decryptData(sessionStorage.getItem('id_usuario')),
            ID_REPLY: replyingTo ? replyingTo.WAMID : null, // IMPORTANTE: WAMID para o WhatsApp reconhecer
            TEXTO_REPLY: replyingTo ? replyingTo.TEXTO : null
        };

        setNewMessage("");
        setReplyingTo(null);

        Loading.show("Enviando...");
        try {
            const res = await api.post(`/tickets/${decryptData(sessionStorage.getItem('ticket'))}/mensagens`, {
                ...payload,
                TEXTO: replyingTo ? formattedMsg : formattedMsg // Mantendo clareza
            });
            if (res.data.SUCCESS) {
                const wamid_gerado = res.data.WHATSAPP?.messages?.[0]?.id || null;
                setMessages(prev => [...prev, {
                    ID_TICKET: decryptData(sessionStorage.getItem('ticket')),
                    REMETENTE: 'OPERADOR',
                    DATA_ENVIO: new Date().toISOString(),
                    TEXTO: formattedMsg,
                    WAMID: wamid_gerado,
                    WAMID_REPLY: payload.ID_REPLY,
                    TEXTO_REPLY: payload.TEXTO_REPLY
                }]);
                scrollToBottom();
            } else {
                toastr.error(res.data.MESSAGE || "Erro na Janela 24h");
            }
        } catch (error) {
            toastr.error("Erro ao enviar");
        } finally {
            Loading.hide();
        }
    };

    const addEmoji = (emoji) => {
        setNewMessage(prev => prev + emoji);
        setShowEmojiPicker(false);
    };

    const formatTime = (isoString) => {
        if (!isoString) return '';
        const d = new Date(isoString);
        const hours = d.getHours().toString().padStart(2, '0');
        const minutes = d.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    // Converte markdown do WhatsApp em elementos React
    const formatWhatsAppText = (text) => {
        if (!text) return null;
        // Divide por linha para manter quebras
        const lines = text.split('\n');
        return lines.map((line, lineIdx) => {
            const parts = [];
            // Regex para capturar *bold*, _italic_, ~strike~, `code`
            const regex = /(\*([^*]+)\*)|(\_([^_]+)\_)|(~([^~]+)~)|(`([^`]+)`)/g;
            let lastIndex = 0;
            let match;
            while ((match = regex.exec(line)) !== null) {
                // Texto antes do match
                if (match.index > lastIndex) {
                    parts.push(line.slice(lastIndex, match.index));
                }
                if (match[1]) parts.push(<strong key={match.index}>{match[2]}</strong>);
                else if (match[3]) parts.push(<em key={match.index}>{match[4]}</em>);
                else if (match[5]) parts.push(<s key={match.index}>{match[6]}</s>);
                else if (match[7]) parts.push(<code key={match.index} style={{ background: 'rgba(0,0,0,0.1)', borderRadius: '3px', padding: '0 3px', fontFamily: 'monospace' }}>{match[8]}</code>);
                lastIndex = regex.lastIndex;
            }
            // Texto restante
            if (lastIndex < line.length) parts.push(line.slice(lastIndex));
            return (
                <span key={lineIdx}>
                    {parts}
                    {lineIdx < lines.length - 1 && <br />}
                </span>
            );
        });
    };

    const conteudoHtml = (
        <div className='body'>
            <div className={`pt-2 mt-2 w-100`}>
                <div className='chat-header-custom'>
                    <div className='d-flex align-items-center'>
                        <Link to="/app/atendimento/tickets" className="btn-back-square me-3" title="Voltar para a Lista">
                            <i className="bi bi-arrow-left"></i>
                        </Link>
                        <div>
                            <h4 className='chat-title-main'>{nome || "Cliente"}</h4>
                            <div className="d-flex align-items-center gap-2 mt-1">
                                {ticketInfo?.NOME_SETOR && (
                                    <div className="sector-tag" title="Setor Responsável">
                                        <i className="bi bi-layers-fill"></i>
                                        <span>{ticketInfo.NOME_SETOR}</span>
                                    </div>
                                )}
                                {ticketInfo?.ID_OPERADOR ? (
                                    <div className="operator-status online">
                                        <div className="dot"></div>
                                        <span>{Number(ticketInfo.ID_OPERADOR) === Number(decryptData(sessionStorage.getItem('id_usuario'))) ? 'Sendo atendido por você' : `Atendido por: ${ticketInfo?.NOME_OPERADOR}`}</span>
                                    </div>
                                ) : (
                                    <div className="operator-status waiting">
                                        <div className="dot"></div>
                                        <span>Aguardando Captura</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className='d-flex align-items-center gap-2'>
                        <span className="wa-id-tag d-none d-md-flex align-items-center">
                            <i className="bi bi-whatsapp me-2"></i>
                            {wa_id}
                        </span>
                        {(ticketInfo?.STATUS !== 'FECHADO') && (
                            <button
                                onClick={() => window.$('#modalTransferencia').modal('show')}
                                className="btn-action-header primary"
                                title="Transferir Atendimento / Trocar Setor"
                            >
                                <i className="bi bi-arrow-left-right"></i>
                                <span className="ms-1">Transferir</span>
                            </button>
                        )}
                        {(!ticketInfo?.ID_OPERADOR && ticketInfo?.STATUS !== 'FECHADO') && (
                            <button onClick={handleCapture} className="btn-action-header success" title="Capturar Atendimento">
                                <i className="bi bi-hand-index-thumb"></i>
                                <span className="ms-1">Capturar</span>
                            </button>
                        )}
                        <button
                            onClick={handleCloseTicket}
                            className="btn-action-header danger"
                            disabled={ticketInfo?.STATUS === 'FECHADO'}
                            title="Encerrar Conversa"
                        >
                            <i className="bi bi-check-circle"></i>
                            <span className="ms-1">Encerrar</span>
                        </button>
                    </div>
                </div>

                <div className="chat-container">
                    <div className="chat-history">
                        {messages.length === 0 && <div className="text-center text-muted mt-3">Nenhuma mensagem trocada neste ticket.</div>}
                        {messages.map((msg, index) => {
                            const showDateSeparator = index === 0 ||
                                new Date(messages[index - 1].DATA_ENVIO).toLocaleDateString() !== new Date(msg.DATA_ENVIO).toLocaleDateString();

                            const isOperador = msg.REMETENTE === 'OPERADOR';
                            let displayName = '';
                            let displayText = msg.TEXTO;

                            if (isOperador && msg.TEXTO && msg.TEXTO.startsWith('*')) {
                                const parts = msg.TEXTO.split('\n');
                                if (parts.length > 1) {
                                    displayName = parts[0].replace(/\*/g, '');
                                    displayText = parts.slice(1).join('\n');
                                }
                            }

                            return (
                                <React.Fragment key={index}>
                                    {showDateSeparator && (
                                        <div className="date-separator">
                                            <span>{new Date(msg.DATA_ENVIO).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                                        </div>
                                    )}
                                    <div 
                                        id={`msg-${msg.WAMID}`}
                                        className={`chat-bubble ${msg.REMETENTE === 'CLIENTE' ? 'cliente' : 'operador'}`}
                                        onDoubleClick={() => { 
                                            setReplyingTo(msg);
                                            setTimeout(() => document.getElementById('chat-input-field')?.focus(), 100);
                                        }}>

                                        <div className="bubble-reply-btn" onClick={() => { 
                                            setReplyingTo(msg);
                                            setTimeout(() => document.getElementById('chat-input-field')?.focus(), 100);
                                        }}>
                                            <i className="fa fa-reply"></i>
                                        </div>

                                        {msg.TEXTO_REPLY && (
                                            <div className="reply-content-in-bubble" onClick={(e) => { e.stopPropagation(); scrollToMessage(msg.WAMID_REPLY); }}>
                                                <small>{formatWhatsAppText(msg.TEXTO_REPLY)}</small>
                                            </div>
                                        )}

                                        {displayName && <div className="chat-operator-name text-primary mb-1" style={{ fontSize: '0.75rem' }}>{displayName}</div>}
                                        <div className="chat-text">
                                            {formatWhatsAppText(displayText)}
                                        </div>
                                        <span className="chat-time">
                                            {formatTime(msg.DATA_ENVIO)}
                                        </span>
                                    </div>
                                </React.Fragment>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {replyingTo && (
                        <div className="reply-preview-container">
                            <div className="reply-preview-data">
                                <strong>Respondendo:</strong>
                                <p>{replyingTo.TEXTO.length > 60 ? replyingTo.TEXTO.substring(0, 60) + '...' : replyingTo.TEXTO}</p>
                            </div>
                            <button className="btn-close-reply" onClick={() => setReplyingTo(null)}>&times;</button>
                        </div>
                    )}

                    <form className="chat-input-container" onSubmit={handleSendMessage}>
                        <div className="emoji-toggle" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>😀</div>
                        {showEmojiPicker && (
                            <div className="emoji-picker-custom">
                                {emojis.map((emoji, idx) => (
                                    <span key={idx} onClick={() => addEmoji(emoji)}>{emoji}</span>
                                ))}
                            </div>
                        )}
                        <input
                            id="chat-input-field"
                            type="text"
                            placeholder={!ticketInfo?.ID_OPERADOR ? "Capture o atendimento para digitar." : (expired ? "Janela de WhatsApp expirou (+24h)." : ticketInfo?.STATUS === 'FECHADO' ? "Atendimento encerrado." : (wa_id ? "Escreva uma mensagem..." : "WhatsApp ID não disponível."))}
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            disabled={!wa_id || expired || ticketInfo?.STATUS === 'FECHADO' || !ticketInfo?.ID_OPERADOR}
                        />
                        <button type="submit" className='send-button' disabled={!wa_id || !newMessage.trim() || expired || ticketInfo?.STATUS === 'FECHADO' || !ticketInfo?.ID_OPERADOR}>

                        </button>
                    </form>
                </div>
            </div>

            {/* Modal Transferencia */}
            <div className="modal fade modal-md" id="modalTransferencia" data-bs-backdrop="false" data-bs-keyboard="false" tabIndex="-1" aria-hidden="true">
                <div className='opaco'>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <div className='row'>
                                    <h5 className="modal-title col-md-12 tituloC">Transferir Atendimento</h5>
                                </div>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md-12 p-1">
                                        <b className="labelDescC">Setor de Destino</b>
                                        <div className="input-group">
                                            <select
                                                className="form-control form-control-sm"
                                                value={transferTarget.id_setor}
                                                onChange={e => setTransferTarget({ ...transferTarget, id_setor: e.target.value })}
                                            >
                                                <option value="">Selecione um Setor</option>
                                                {setores.map(s => <option key={s.ID_SETOR} value={s.ID_SETOR}>{s.NOME}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-md-12 p-1 mt-2">
                                        <b className="labelDescC">Operador (Opcional)</b>
                                        <div className="input-group">
                                            <select
                                                className="form-control form-control-sm"
                                                value={transferTarget.id_operador}
                                                onChange={e => setTransferTarget({ ...transferTarget, id_operador: e.target.value })}
                                            >
                                                <option value="">Aberto (Qualquer atendente)</option>
                                                {operadores.map(o => <option key={o.ID} value={o.ID}>{o.NOME}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-md-12 mt-3 text-center">
                                        <small style={{ fontSize: '0.75rem', color: '#555' }}>
                                            <i>Nota: Ao transferir para um atendente específico, o ticket ficará "Em Andamento". Caso escolha apenas o setor, ficará "Aberto".</i>
                                        </small>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button onClick={() => window.$('#modalTransferencia').modal('hide')} type="button" className="btn btn-danger">Cancelar</button>
                                <button type="button" className="btn btn-success" onClick={handleTransfer}>Transferir Agora</button>
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

export default TicketChat;

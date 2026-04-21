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
    const messagesEndRef = useRef(null);

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

    const fetchMessages = async () => {
        Loading.show("Carregando conversa...");
        try {
            const res = await api.get(`/tickets/${decryptData(sessionStorage.getItem('ticket'))}/mensagens`);
            // Pode vir como res.data.DATA dependendo de como padronizamos, mas pelo server.ts na linha 943 (ou 1014), chamamos "res.json(result)", que retorna direto o array:
            if (Array.isArray(res.data)) {
                setMessages(res.data);
            } else if (res.data && Array.isArray(res.data.DATA)) {
                setMessages(res.data.DATA);
            }
        } catch (error) {
            toastr.error("Erro ao obter mensagens", "Atenção");
        } finally {
            Loading.hide();
        }
    };

    useEffect(() => {
        fetchTicketDetail();
        fetchMessages();

        const handleNovaMensagem = (payload) => {
            if (String(payload.ID_TICKET) === String(decryptData(sessionStorage.getItem('ticket')))) {
                setMessages(prev => [...prev, payload]);
                fetchTicketDetail(); // Atualiza o status/operador caso tenha mudado
            }
        };

        socket.on('ticket_novo', handleNovaMensagem);
        socket.on('conversa_ticket', handleNovaMensagem);

        return () => {
            socket.off('ticket_novo', handleNovaMensagem);
            socket.off('conversa_ticket', handleNovaMensagem);
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


    const handleSendMessage = async (e) => {
        e?.preventDefault();
        if (!newMessage.trim() || expired) return;

        const operName = decryptData(sessionStorage.getItem('nome_usuario')) + ':' || "Atendente";
        const tempMsg = newMessage;
        const formattedMsg = `*${operName}*\n${tempMsg}`;

        setNewMessage("");

        Loading.show("Enviando...");
        try {
            const res = await api.post(`/tickets/${decryptData(sessionStorage.getItem('ticket'))}/mensagens`, {
                WA_ID: wa_id,
                TEXTO: formattedMsg,
                ID_OPERADOR: decryptData(sessionStorage.getItem('id_usuario'))
            });
            if (res.data.SUCCESS) {
                // Add no chat imediatamente
                setMessages(prev => [...prev, {
                    ID_TICKET: decryptData(sessionStorage.getItem('ticket')),
                    REMETENTE: 'OPERADOR',
                    DATA_ENVIO: new Date().toISOString(),
                    TEXTO: formattedMsg
                }]);
                scrollToBottom();
            } else {
                toastr.error(res.data.MESSAGE || "Não foi possível enviar a mensagem", "Erro na Janela 24h");
            }
        } catch (error) {
            toastr.error(error.response?.data?.MESSAGE || error.message, "Erro ao tentar enviar");
        } finally {
            Loading.hide();
        }
    };

    const formatTime = (isoString) => {
        if (!isoString) return '';
        const d = new Date(isoString);
        const hours = d.getHours().toString().padStart(2, '0');
        const minutes = d.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    const conteudoHtml = (
        <div className='body'>
            <div className={`pt-2 mt-2 w-100`}>
                <div className='d-flex align-items-center mb-3 justify-content-between'>
                    <div className='d-flex align-items-center'>
                        <Link to="/app/atendimento/tickets" className="btn btn-sm btn-outline-secondary me-3">
                            Voltar
                        </Link>
                        <div>
                            <h4 className='tituloD m-0'>Conversa com {nome}</h4>
                            {ticketInfo?.ID_OPERADOR ? (
                                <p className="text-success m-0 small">Atendido por: <b>{Number(ticketInfo.ID_OPERADOR) === Number(decryptData(sessionStorage.getItem('id_usuario'))) ? 'Você' : ticketInfo?.NOME_OPERADOR}</b></p>
                            ) : (
                                <p className="text-warning m-0 small">Aguardando Captura...</p>
                            )}
                        </div>
                    </div>
                    <div>
                        <span className="text-muted small me-3">ID: {wa_id}</span>
                        {(!ticketInfo?.ID_OPERADOR && ticketInfo?.STATUS !== 'FECHADO') && (
                            <button onClick={handleCapture} className="btn btn-sm btn-success me-2">Capturar Atendimento</button>
                        )}
                        <button onClick={handleCloseTicket} className="btn btn-sm btn-danger" disabled={ticketInfo?.STATUS === 'FECHADO'}>Encerrar</button>
                    </div>
                </div>

                <div className="chat-container">
                    <div className="chat-history">
                        {messages.length === 0 && <div className="text-center text-muted mt-3">Nenhuma mensagem trocada neste ticket.</div>}
                        {messages.map((msg, index) => {
                            const isOperador = msg.REMETENTE === 'OPERADOR';
                            let displayName = '';
                            let displayText = msg.TEXTO;

                            // Tenta extrair o nome da assinatura: *Nome:*\nTexto
                            if (isOperador && msg.TEXTO && msg.TEXTO.startsWith('*')) {
                                const parts = msg.TEXTO.split('\n');
                                if (parts.length > 1) {
                                    displayName = parts[0].replace(/\*/g, ''); // Remove os asteriscos
                                    displayText = parts.slice(1).join('\n'); // O resto da mensagem
                                }
                            }

                            return (
                                <div key={index} className={`chat-bubble ${msg.REMETENTE === 'CLIENTE' ? 'cliente' : 'operador'}`}>
                                    {displayName && <div className="chat-operator-name">{displayName}</div>}
                                    <span style={{ whiteSpace: 'pre-wrap' }}>{displayText}</span>
                                    <span className="chat-time">{formatTime(msg.DATA_ENVIO)}</span>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    <form className="chat-input-container" onSubmit={handleSendMessage}>
                        <input
                            type="text"
                            placeholder={!ticketInfo?.ID_OPERADOR ? "Capture o atendimento para digitar." : (expired ? "Janela de WhatsApp expirou (+24h)." : ticketInfo?.STATUS === 'FECHADO' ? "Atendimento encerrado." : (wa_id ? "Escreva uma mensagem..." : "WhatsApp ID não disponível."))}
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            disabled={!wa_id || expired || ticketInfo?.STATUS === 'FECHADO' || !ticketInfo?.ID_OPERADOR}
                        />
                        <button type="submit" disabled={!wa_id || !newMessage.trim() || expired || ticketInfo?.STATUS === 'FECHADO' || !ticketInfo?.ID_OPERADOR}>
                            Enviar
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );

    return (
        <NavBar conteudo={conteudoHtml} />
    );
}

export default TicketChat;

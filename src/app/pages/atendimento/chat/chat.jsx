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

    // --- Anexos (imagem/vídeo/documento) e gravação de áudio ---
    const [showAttachMenu, setShowAttachMenu] = useState(false);
    const [pendingFile, setPendingFile] = useState(null); // { file, previewUrl, tipo }
    const [sendingAttachment, setSendingAttachment] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingSeconds, setRecordingSeconds] = useState(0);
    const [audioLevels, setAudioLevels] = useState(Array(24).fill(4));
    const fileInputImagemRef = useRef(null);
    const fileInputDocumentoRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const recordingIntervalRef = useRef(null);
    const audioContextRef = useRef(null);
    const levelAnimationRef = useRef(null);
    const nivelMaximoRef = useRef(0);

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

    // Limpa o preview de anexo pendente (evita vazar memória do createObjectURL) e a
    // gravação em andamento se o operador sair da tela no meio do processo.
    useEffect(() => {
        return () => {
            if (pendingFile?.previewUrl) URL.revokeObjectURL(pendingFile.previewUrl);
            if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
            if (levelAnimationRef.current) cancelAnimationFrame(levelAnimationRef.current);
            if (audioContextRef.current) audioContextRef.current.close().catch(() => { });
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const isWindowExpired = () => {
        const lastClientMsg = [...messages].reverse().find(m => m.REMETENTE === 'CLIENTE');
        if (!lastClientMsg) return false;
        const diff = new Date() - new Date(lastClientMsg.DATA_ENVIO);
        return diff > 24 * 60 * 60 * 1000;
    };

    const expired = isWindowExpired();
    const inputBloqueado = !wa_id || expired || ticketInfo?.STATUS === 'FECHADO' || !ticketInfo?.ID_OPERADOR;

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

    // --- Anexos ---

    function classificarTipoArquivo(file) {
        if (file.type.startsWith('image/')) return 'IMAGE';
        if (file.type.startsWith('video/')) return 'VIDEO';
        if (file.type.startsWith('audio/')) return 'AUDIO';
        return 'DOCUMENT';
    }

    function handleFilePicked(e) {
        const file = e.target.files?.[0];
        e.target.value = ''; // permite escolher o mesmo arquivo de novo depois
        if (!file) return;

        if (file.size > 25 * 1024 * 1024) {
            toastr.warning('Arquivo maior que 25MB. Escolha um arquivo menor.', 'Atenção');
            return;
        }

        const tipo = classificarTipoArquivo(file);
        const previewUrl = (tipo === 'IMAGE' || tipo === 'VIDEO') ? URL.createObjectURL(file) : null;
        setPendingFile({ file, previewUrl, tipo });
        setShowAttachMenu(false);
    }

    function cancelPendingFile() {
        if (pendingFile?.previewUrl) URL.revokeObjectURL(pendingFile.previewUrl);
        setPendingFile(null);
    }

    async function enviarArquivo(file, legenda) {
        setSendingAttachment(true);
        try {
            const formData = new FormData();
            formData.append('arquivo', file);
            formData.append('WA_ID', wa_id);
            formData.append('LEGENDA', legenda || '');
            formData.append('ID_OPERADOR', decryptData(sessionStorage.getItem('id_usuario')));

            const res = await api.post(`/tickets/${decryptData(sessionStorage.getItem('ticket'))}/midia`, formData);

            if (res.data.SUCCESS) {
                setMessages(prev => [...prev, {
                    ID_TICKET: decryptData(sessionStorage.getItem('ticket')),
                    REMETENTE: 'OPERADOR',
                    DATA_ENVIO: new Date().toISOString(),
                    TEXTO: legenda || '',
                    WAMID: res.data.WHATSAPP?.messages?.[0]?.id || null,
                    TIPO_MENSAGEM: res.data.TIPO_MENSAGEM,
                    MEDIA_URL: res.data.MEDIA_URL,
                    MEDIA_NOME_ARQUIVO: res.data.MEDIA_NOME_ARQUIVO
                }]);
                scrollToBottom();
            } else {
                toastr.error(res.data.MESSAGE || 'Erro ao enviar arquivo');
            }
        } catch (error) {
            toastr.error(error.response?.data?.MESSAGE || 'Erro ao enviar arquivo');
        } finally {
            setSendingAttachment(false);
        }
    }

    async function handleSendPendingFile(e) {
        e?.preventDefault();
        if (!pendingFile || sendingAttachment) return;
        const legenda = newMessage.trim();
        const arquivo = pendingFile.file;
        cancelPendingFile();
        setNewMessage("");
        await enviarArquivo(arquivo, legenda);
    }

    // --- Gravação de áudio ---

    // Lê o volume do microfone em tempo real (Web Audio API) e alimenta as barrinhas do
    // indicador de gravação — é só feedback visual, não interfere na gravação em si (o
    // MediaRecorder grava a partir do mesmo stream, em paralelo).
    async function iniciarBarrasDeNivel(stream) {
        const AudioContextCls = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextCls) return;
        const audioContext = new AudioContextCls();
        // Depois de um "await" (getUserMedia), o navegador pode considerar que já saiu do
        // gesto do usuário e criar o AudioContext direto em "suspended" — sem o resume(), o
        // analyser nunca processa nada e as barras ficam retas mesmo com áudio real chegando.
        if (audioContext.state === 'suspended') {
            try { await audioContext.resume(); } catch (e) { /* segue mesmo assim */ }
        }
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.6;
        source.connect(analyser);
        audioContextRef.current = audioContext;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const atualizar = () => {
            analyser.getByteFrequencyData(dataArray);
            const media = dataArray.reduce((acc, v) => acc + v, 0) / dataArray.length;
            const nivel = Math.min(100, Math.max(6, (media / 255) * 100 * 2));
            if (nivel > nivelMaximoRef.current) nivelMaximoRef.current = nivel;
            setAudioLevels(prev => [...prev.slice(1), nivel]);
            levelAnimationRef.current = requestAnimationFrame(atualizar);
        };
        levelAnimationRef.current = requestAnimationFrame(atualizar);
    }

    function pararBarrasDeNivel() {
        if (levelAnimationRef.current) cancelAnimationFrame(levelAnimationRef.current);
        levelAnimationRef.current = null;
        if (audioContextRef.current) {
            audioContextRef.current.close().catch(() => { });
            audioContextRef.current = null;
        }
        setAudioLevels(Array(24).fill(4));
    }

    async function startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            // Chrome só grava em webm/opus; Firefox aceita ogg/opus direto. A Meta espera
            // preferencialmente ogg/opus pra nota de voz — usamos o melhor disponível.
            const mimeType = ['audio/ogg;codecs=opus', 'audio/webm;codecs=opus', 'audio/webm']
                .find(t => window.MediaRecorder && MediaRecorder.isTypeSupported(t)) || '';

            const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
            audioChunksRef.current = [];

            recorder.ondataavailable = (ev) => {
                if (ev.data.size > 0) audioChunksRef.current.push(ev.data);
            };

            recorder.start();
            mediaRecorderRef.current = recorder;
            setIsRecording(true);
            setRecordingSeconds(0);
            nivelMaximoRef.current = 0;
            recordingIntervalRef.current = setInterval(() => setRecordingSeconds(s => s + 1), 1000);
            iniciarBarrasDeNivel(stream);

            // Avisa cedo se o microfone parece mudo (nenhum nível relevante captado), em vez
            // de só descobrir depois de mandar pro WhatsApp e testar no celular.
            setTimeout(() => {
                if (mediaRecorderRef.current?.state === 'recording' && nivelMaximoRef.current < 10) {
                    toastr.warning('Não estamos captando som do microfone. Verifique se o microfone certo está selecionado (clique no cadeado ao lado do endereço > Configurações do site > Microfone) e se não está mudo no sistema.', 'Microfone parece mudo');
                }
            }, 2500);
        } catch (e) {
            toastr.error('Não foi possível acessar o microfone. Verifique a permissão do navegador.', 'Atenção');
        }
    }

    // Some as UI de "gravando" (timer/estado/barras) na hora — mas SÓ para as tracks do
    // microfone depois que o MediaRecorder confirmar (onstop) que já terminou de gravar. Parar
    // a track antes disso corta a gravação no meio da finalização e gera um arquivo mudo/corrompido.
    function encerrarUiDeGravacao() {
        clearInterval(recordingIntervalRef.current);
        pararBarrasDeNivel();
        setIsRecording(false);
        setRecordingSeconds(0);
    }

    function cancelRecording() {
        if (!mediaRecorderRef.current) return;
        const recorder = mediaRecorderRef.current;
        recorder.onstop = () => {
            recorder.stream.getTracks().forEach(t => t.stop());
        };
        recorder.stop();
        encerrarUiDeGravacao();
        audioChunksRef.current = [];
    }

    function finishAndSendRecording() {
        if (!mediaRecorderRef.current) return;
        const recorder = mediaRecorderRef.current;
        recorder.onstop = async () => {
            recorder.stream.getTracks().forEach(t => t.stop());
            const blob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
            const extensao = (recorder.mimeType || '').includes('ogg') ? 'ogg' : 'webm';
            const arquivoAudio = new File([blob], `audio-${Date.now()}.${extensao}`, { type: blob.type });
            await enviarArquivo(arquivoAudio, '');
        };
        recorder.stop();
        encerrarUiDeGravacao();
    }

    function formatRecordingTime(totalSeconds) {
        const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
        const s = (totalSeconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }

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

    // Renderiza o conteúdo da bolha conforme o tipo (texto ou mídia)
    const renderConteudoMensagem = (msg, displayText) => {
        const tipo = msg.TIPO_MENSAGEM || 'TEXTO';

        if (tipo === 'IMAGE') {
            return (
                <div className="chat-media">
                    {msg.MEDIA_URL
                        ? <img src={msg.MEDIA_URL} alt="Imagem enviada" className="chat-media-image" onClick={() => window.open(msg.MEDIA_URL, '_blank')} />
                        : <div className="chat-media-indisponivel"><i className="bi bi-image"></i> Imagem indisponível</div>}
                    {displayText && <div className="chat-text mt-1">{formatWhatsAppText(displayText)}</div>}
                </div>
            );
        }
        if (tipo === 'VIDEO') {
            return (
                <div className="chat-media">
                    {msg.MEDIA_URL
                        ? <video src={msg.MEDIA_URL} controls className="chat-media-video" />
                        : <div className="chat-media-indisponivel"><i className="bi bi-camera-video"></i> Vídeo indisponível</div>}
                    {displayText && <div className="chat-text mt-1">{formatWhatsAppText(displayText)}</div>}
                </div>
            );
        }
        if (tipo === 'AUDIO') {
            return msg.MEDIA_URL
                ? <audio src={msg.MEDIA_URL} controls className="chat-media-audio" />
                : <div className="chat-media-indisponivel"><i className="bi bi-mic"></i> Áudio indisponível</div>;
        }
        if (tipo === 'DOCUMENT') {
            return (
                <a
                    href={msg.MEDIA_URL || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className={`chat-media-document ${!msg.MEDIA_URL ? 'disabled' : ''}`}
                    onClick={(e) => { if (!msg.MEDIA_URL) e.preventDefault(); }}
                >
                    <i className="bi bi-file-earmark-pdf-fill"></i>
                    <span className="chat-media-document-nome">{msg.MEDIA_NOME_ARQUIVO || 'Documento'}</span>
                    <i className="bi bi-download ms-2"></i>
                </a>
            );
        }
        return <div className="chat-text">{formatWhatsAppText(displayText)}</div>;
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
                                        className={`chat-bubble ${msg.REMETENTE === 'CLIENTE' ? 'cliente' : 'operador'} ${msg.TIPO_MENSAGEM && msg.TIPO_MENSAGEM !== 'TEXTO' ? 'com-midia' : ''}`}
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
                                        {renderConteudoMensagem(msg, displayText)}
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

                    {pendingFile && (
                        <div className="attachment-preview-container">
                            {pendingFile.tipo === 'IMAGE' && <img src={pendingFile.previewUrl} alt="Pré-visualização" className="attachment-preview-thumb" />}
                            {pendingFile.tipo === 'VIDEO' && <video src={pendingFile.previewUrl} className="attachment-preview-thumb" muted />}
                            {(pendingFile.tipo === 'DOCUMENT' || pendingFile.tipo === 'AUDIO') && (
                                <div className="attachment-preview-icon"><i className="bi bi-file-earmark-fill"></i></div>
                            )}
                            <div className="attachment-preview-data">
                                <strong>Anexo selecionado</strong>
                                <p>{pendingFile.file.name}</p>
                            </div>
                            <button className="btn-close-reply" onClick={cancelPendingFile} disabled={sendingAttachment}>&times;</button>
                        </div>
                    )}

                    {isRecording && (
                        <div className="recording-bar">
                            <button type="button" className="recording-cancel" onClick={cancelRecording} title="Cancelar gravação">
                                <i className="bi bi-trash"></i>
                            </button>
                            <div className="recording-indicator">
                                <span className="recording-dot"></span>
                                <div className="recording-bars-wrap">
                                    {audioLevels.map((nivel, idx) => (
                                        <span key={idx} className="recording-bar-item" style={{ height: `${nivel}%` }}></span>
                                    ))}
                                </div>
                                <span className="recording-time">{formatRecordingTime(recordingSeconds)}</span>
                            </div>
                            <button type="button" className="recording-send" onClick={finishAndSendRecording} title="Enviar áudio" disabled={sendingAttachment}>
                                <i className="bi bi-send-fill"></i>
                            </button>
                        </div>
                    )}

                    {!isRecording && (
                        <form className="chat-input-container" onSubmit={pendingFile ? handleSendPendingFile : handleSendMessage}>
                            <div className="emoji-toggle" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>😀</div>
                            {showEmojiPicker && (
                                <div className="emoji-picker-custom">
                                    {emojis.map((emoji, idx) => (
                                        <span key={idx} onClick={() => addEmoji(emoji)}>{emoji}</span>
                                    ))}
                                </div>
                            )}

                            <div className="attach-wrapper">
                                <div className="attach-toggle" onClick={() => !inputBloqueado && setShowAttachMenu(!showAttachMenu)} title="Anexar">
                                    <i className="bi bi-paperclip"></i>
                                </div>
                                {showAttachMenu && (
                                    <div className="attach-menu">
                                        <div className="attach-menu-item" onClick={() => fileInputImagemRef.current?.click()}>
                                            <i className="bi bi-image-fill" style={{ color: '#7f66ff' }}></i>
                                            <span>Fotos e vídeos</span>
                                        </div>
                                        <div className="attach-menu-item" onClick={() => fileInputDocumentoRef.current?.click()}>
                                            <i className="bi bi-file-earmark-text-fill" style={{ color: '#5157ae' }}></i>
                                            <span>Documento</span>
                                        </div>
                                    </div>
                                )}
                                <input type="file" accept="image/*,video/*" ref={fileInputImagemRef} style={{ display: 'none' }} onChange={handleFilePicked} />
                                <input type="file" ref={fileInputDocumentoRef} style={{ display: 'none' }} onChange={handleFilePicked} />
                            </div>

                            <input
                                id="chat-input-field"
                                type="text"
                                placeholder={
                                    pendingFile ? "Adicione uma legenda (opcional)..." :
                                        (!ticketInfo?.ID_OPERADOR ? "Capture o atendimento para digitar." : (expired ? "Janela de WhatsApp expirou (+24h)." : ticketInfo?.STATUS === 'FECHADO' ? "Atendimento encerrado." : (wa_id ? "Escreva uma mensagem..." : "WhatsApp ID não disponível.")))
                                }
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                disabled={pendingFile ? sendingAttachment : inputBloqueado}
                            />

                            {(!pendingFile && !newMessage.trim()) ? (
                                <button type="button" className='mic-button' disabled={inputBloqueado} onClick={startRecording} title="Gravar áudio">
                                    <i className="bi bi-mic-fill"></i>
                                </button>
                            ) : (
                                <button type="submit" className='send-button' disabled={pendingFile ? sendingAttachment : (!wa_id || !newMessage.trim() || expired || ticketInfo?.STATUS === 'FECHADO' || !ticketInfo?.ID_OPERADOR)}>
                                </button>
                            )}
                        </form>
                    )}
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

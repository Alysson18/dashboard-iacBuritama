import React, { useState, useMemo, useCallback } from 'react';
import CryptoJS from 'crypto-js';


const AuthContext = React.createContext({});

function AuthProvider(propis) {

    function encryptData(data) {
        return CryptoJS.AES.encrypt(data.toString(), 'Alysson-2025-IACBURITAMA').toString();
    }

    function decryptData(encryptedData) {
        if (!encryptedData) return '';
        try {
            const bytes = CryptoJS.AES.decrypt(encryptedData.toString(), 'Alysson-2025-IACBURITAMA');
            return bytes.toString(CryptoJS.enc.Utf8);
        } catch (e) {
            return '';
        }
    }

    function decryptJSON(key, fallback) {
        try {
            const raw = decryptData(sessionStorage.getItem(key));
            return raw ? JSON.parse(raw) : fallback;
        } catch (e) {
            return fallback;
        }
    }

    let isLogado = sessionStorage.getItem("logado") === null ? '' : decryptData(sessionStorage.getItem("logado"));
    const [logado, setLogado] = useState(isLogado === "S" ? true : false);

    // Multi-igreja (multi-tenant): tipo do usuário logado e a igreja atualmente selecionada.
    const [tipoUsuario, setTipoUsuarioState] = useState(decryptData(sessionStorage.getItem('tipo_usuario')) || '');
    const [igrejaAtual, setIgrejaAtualState] = useState(decryptJSON('igreja_atual', null));
    const [igrejasDisponiveis, setIgrejasDisponiveisState] = useState(decryptJSON('igrejas_disponiveis', []));

    // Setters que já persistem em sessionStorage, seguindo o mesmo padrão AES usado no resto do app.
    // (Se "Mantenha-me conectado" estiver marcado, quem grava o espelho em localStorage é o login.jsx,
    // igual já acontece hoje com logado/nome_usuario/etc.)
    // useCallback: sem isso, essas funções eram recriadas (nova referência) a cada render
    // do AuthProvider, o que por si só já invalidaria o useMemo do value logo abaixo.
    const setTipoUsuario = useCallback((valor) => {
        setTipoUsuarioState(valor || '');
        sessionStorage.setItem('tipo_usuario', encryptData(valor || ''));
    }, []);

    const setIgrejaAtual = useCallback((igreja) => {
        setIgrejaAtualState(igreja || null);
        sessionStorage.setItem('igreja_atual', encryptData(JSON.stringify(igreja || null)));
    }, []);

    const setIgrejasDisponiveis = useCallback((lista) => {
        setIgrejasDisponiveisState(lista || []);
        sessionStorage.setItem('igrejas_disponiveis', encryptData(JSON.stringify(lista || [])));
    }, []);

    // Estabiliza o objeto do contexto: sem isso, um objeto NOVO era criado a cada render
    // do AuthProvider, fazendo todo consumidor (App, Menu, etc.) re-renderizar mesmo sem
    // nenhum valor ter realmente mudado — foi parte do que causava o loop de remontagem.
    const value = useMemo(() => ({
        logado, setLogado,
        tipoUsuario, setTipoUsuario,
        igrejaAtual, setIgrejaAtual,
        igrejasDisponiveis, setIgrejasDisponiveis
    }), [logado, tipoUsuario, igrejaAtual, igrejasDisponiveis, setTipoUsuario, setIgrejaAtual, setIgrejasDisponiveis]);

    return (
        <AuthContext.Provider value={value}>
            {propis.children}
        </AuthContext.Provider>
    )
}

export { AuthContext, AuthProvider };

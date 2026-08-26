import axios from 'axios';
import CryptoJS from 'crypto-js';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || "http://localhost:3005",
    //baseURL: "http://192.168.1.108:3005",
    timeout: 12000,
});

const decryptData = (encryptedData) => {
    if (!encryptedData) return "";
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedData.toString(), 'Alysson-2025-IACBURITAMA');
        return bytes.toString(CryptoJS.enc.Utf8);
    } catch (e) {
        return "";
    }
};

// Interceptor para adicionar o Token em cada requisição
api.interceptors.request.use(config => {
    const tokenEnc = sessionStorage.getItem('token') || localStorage.getItem('token');
    if (tokenEnc) {
        const token = decryptData(tokenEnc);
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

// Interceptor para informar a igreja selecionada (multi-igreja). O middleware
// resolveIgreja (checkin-api/server.ts) já sabe validar esse header contra as igrejas do
// usuário logado — só faltava alguém mandar. Sem isso, nenhuma rota que exija id_igreja
// funcionaria pra um Administrador/Usuário comum (só o Sistema passa sem esse header).
api.interceptors.request.use(config => {
    const igrejaAtualEnc = sessionStorage.getItem('igreja_atual') || localStorage.getItem('igreja_atual');
    if (igrejaAtualEnc) {
        try {
            const igreja = JSON.parse(decryptData(igrejaAtualEnc));
            if (igreja && igreja.ID_IGREJA) {
                config.headers['x-id-igreja'] = igreja.ID_IGREJA;
            }
        } catch (e) {
            // sessão sem igreja selecionada ainda (ex: usuário Sistema) — segue sem o header
        }
    }
    return config;
}, error => {
    return Promise.reject(error);
});

// Interceptor para capturar token inválido/expirado e deslogar.
// IMPORTANTE: só 401 (não autenticado — token ausente/expirado/inválido) força logout.
// 403 (autenticado, mas sem permissão pra ESSE recurso específico — ex: um Administrador
// sem igreja vinculada ainda batendo em /igrejas) NÃO desloga a aplicação inteira; quem
// chamou a rota trata o erro localmente (toast, tela vazia, etc). Antes qualquer 403 já
// derrubava a sessão e chutava pra tela de login, o que quebrava telas inteiras por causa
// de uma restrição pontual de uma única chamada.
api.interceptors.response.use(response => {
    return response;
}, error => {
    if (error.response && error.response.status === 401) {
        // Evita loop: só limpa/redireciona se ainda não estivermos na tela de login
        // e se de fato havia uma sessão pra derrubar.
        const jaNaLogin = window.location.pathname === '/';
        const tinhaSessao = sessionStorage.getItem('logado') || localStorage.getItem('logado');
        if (!jaNaLogin && tinhaSessao) {
            sessionStorage.clear();
            localStorage.clear();
            window.location.href = '/';
        }
    }
    return Promise.reject(error);
});

export default api


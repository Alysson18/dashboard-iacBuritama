import axios from 'axios';
import CryptoJS from 'crypto-js';

const api = axios.create({
    baseURL: "https://checkin-api.iacburitama.com.br",
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

// Interceptor para capturar 401 e deslogar (Token expirado)
api.interceptors.response.use(response => {
    return response;
}, error => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        // Token expirado, inválido ou não fornecido
        sessionStorage.clear();
        localStorage.clear();
        window.location.href = '/';
    }
    return Promise.reject(error);
});

export default api


import { io } from "socket.io-client";
import api from "./api.js";

const socketUrl = api.defaults.baseURL || 'http://localhost:3001';
export const socket = io(socketUrl, {
    autoConnect: false,
    reconnection: true,
    // Antes era Infinity com retry a cada 1s — se a conexão falhar (ex: backend local
    // fora do ar/instável), martelava o servidor indefinidamente. Limitado a um número
    // razoável de tentativas com backoff maior.
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
    reconnectionDelayMax: 10000,
    timeout: 20000,
});

import { io } from "socket.io-client";
import api from "./api.js";

const socketUrl = api.defaults.baseURL || 'http://localhost:3001';
export const socket = io(socketUrl, {
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
});

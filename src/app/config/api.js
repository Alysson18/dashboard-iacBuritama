import axios from 'axios';

const api = axios.create({

    //baseURL: "http://127.0.0.1:3001",
    baseURL: "https://checkin-api.iacburitama.com.br/api",
    timeout: 12000,
    auth: {
        username: 'Alysson',  //process.env.REACT_APP_USUARIO,
        password: '12345'//process.env.REACT_APP_SENHA
    },




});

export default api


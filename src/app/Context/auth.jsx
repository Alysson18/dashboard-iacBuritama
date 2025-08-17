import React, { useState } from 'react';
import CryptoJS from 'crypto-js';


const AuthContext = React.createContext({});

function AuthProvider(propis) {

    function decryptData(encryptedData) {
        const bytes = CryptoJS.AES.decrypt(encryptedData.toString(), 'Alysson-2025-IACBURITAMA');
        return bytes.toString(CryptoJS.enc.Utf8);
    }

    let isLogado = sessionStorage.getItem("logado") === null ? '' : decryptData(sessionStorage.getItem("logado"));
    const [logado, setLogado] = useState(isLogado === "S" ? true : false);

    return (
        <AuthContext.Provider value={{ logado, setLogado }}>
            {propis.children}
        </AuthContext.Provider>
    )
}

export { AuthContext, AuthProvider };
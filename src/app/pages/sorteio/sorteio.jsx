import React, { useState, useEffect, useContext } from 'react';
import api from '../../config/api.js'
import Loading from '../../components/loading/loading.js'
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';
import NavBar from '../../components/menu.jsx';



const SorteioComponent = () => {
    const [sorteado, setSorteado] = useState(null);
    const [error, setError] = useState(null);

    const realizarSorteio = async () => {
        setError(null);
        setSorteado(null)
        Loading.show('Sorteando....')
        try {
            const response = await api.get('/sorteio'); // Axios já retorna os dados diretamente
            const data = response.data;
            if (data.SUCCESS) {
                setSorteado(data.sorteado);
                Loading.hide();
            } else {
                setError(data.MESSAGE);
                Loading.hide();
            }
        } catch (err) {
            setError('Erro ao realizar o sorteio');
            Loading.hide();
        }
    };

    const conteudoHtml = <div className="container mt-4 text-center">
        <h2>Sorteio do Check-in</h2>
        <button onClick={realizarSorteio} className="btn btn-primary mt-3">Sortear</button>
        {sorteado && (
            <div className="mt-3 p-3 card">
                <h3>Vencedor: {sorteado.NOME}</h3>
                <p>Telefone: {sorteado.TELEFONE}</p>
            </div>
        )}
        {error && <p className="text-danger mt-2">{error}</p>}
    </div>

    return (<>
        <NavBar conteudo={conteudoHtml} />
    </>
    );

};

export default SorteioComponent;

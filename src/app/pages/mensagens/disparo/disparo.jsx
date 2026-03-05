import React from 'react';
import NavBar from '../../../components/menu.jsx';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';

function MensagensDisparo() {
    const conteudoHtml = (
        <div className='body'>
            <div className={`pt-2 mt-2`}>
                <div className='text-center'>
                    <h3 className='tituloD mb-1'>Disparo de Mensagens WhatsApp</h3>
                </div>
                <div className="row mt-4">
                    <div className='col-md-6 mt-1'>
                        <b className="labelDescC">Selecione a Lista de Destinatários</b>
                        <select className="form-select form-select-sm select">
                            <option value="">Selecione...</option>
                            <option value="todos">Todos os Membros</option>
                            <option value="visitantes">Apenas Visitantes</option>
                        </select>
                    </div>
                    <div className='col-md-6 mt-1'>
                        <b className="labelDescC">Selecione a Mensagem</b>
                        <select className="form-select form-select-sm select">
                            <option value="">Selecione a mensagem já cadastrada...</option>
                        </select>
                    </div>
                </div>
                <div className="row mt-4">
                    <div className='col-md-12 text-center'>
                        <button className="btn btn-success btn-lg w-50" type="button">
                            Disparar Mensagens Agora
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <NavBar conteudo={conteudoHtml} />
    );
}

export default MensagensDisparo;

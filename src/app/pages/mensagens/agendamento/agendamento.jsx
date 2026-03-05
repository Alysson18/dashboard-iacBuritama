import React from 'react';
import NavBar from '../../../components/menu.jsx';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';

function MensagensAgendamento() {
    const conteudoHtml = (
        <div className='body'>
            <div className={`pt-2 mt-2`}>
                <div className='text-center'>
                    <h3 className='tituloD mb-1'>Agendamento de Disparos</h3>
                </div>
                <div className="row mt-4">
                    <div className='col-md-9 mt-1'>
                        <div className="input-group">
                            <input type="text" className="form-control" placeholder="Buscar agendamento..." />
                            <button className="btn btn-outline-secondary" type="button">Consultar</button>
                        </div>
                    </div>
                    <div className='col-md-3 mt-1'>
                        <button className="btn btn-secondary float-end w-100" type="button">Novo Agendamento</button>
                    </div>
                </div>
                <div className="row mt-3">
                    <div className='col-md-12'>
                        <table className="table table-responsive table-sm table-striped w-100">
                            <thead>
                                <tr className="tabela">
                                    <th scope="col">Código</th>
                                    <th scope="col">Mensagem</th>
                                    <th scope="col">Data/Hora Agendada</th>
                                    <th scope="col">Público</th>
                                    <th scope="col">Status</th>
                                    <th scope="col">Ações</th>
                                </tr>
                            </thead>
                            <tbody className='text-center'>
                                <tr>
                                    <td colSpan="6" className="text-center">Nenhum agendamento encontrado</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <NavBar conteudo={conteudoHtml} />
    );
}

export default MensagensAgendamento;

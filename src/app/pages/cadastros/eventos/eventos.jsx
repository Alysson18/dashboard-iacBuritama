import React from 'react';
import NavBar from '../../../components/menu.jsx';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';

function Eventos() {
    const conteudoHtml = (
        <div className='body'>
            <div className={`pt-2 mt-2`}>
                <div className='text-center'>
                    <h3 className='tituloD mb-1'>Cadastro de Eventos</h3>
                </div>
                <div className="row mt-4">
                    <div className='col-md-9 mt-1'>
                        <div className="input-group">
                            <input type="text" className="form-control" placeholder="Buscar evento..." />
                            <button className="btn btn-outline-secondary" type="button">Consultar</button>
                        </div>
                    </div>
                    <div className='col-md-3 mt-1'>
                        <button className="btn btn-secondary float-end w-100" type="button">Novo Evento</button>
                    </div>
                </div>
                <div className="row mt-3">
                    <div className='col-md-12'>
                        <table className="table table-responsive table-sm table-striped w-100">
                            <thead>
                                <tr className="tabela">
                                    <th className='codigo' scope="col">Código</th>
                                    <th scope="col">Nome do Evento</th>
                                    <th scope="col">Data</th>
                                    <th scope="col">Hora</th>
                                    <th scope="col">Template</th>
                                    <th className='fim_Grid' scope="col">Ações</th>
                                </tr>
                            </thead>
                            <tbody className='text-center'>
                                <tr>
                                    <td colSpan="5" className="text-center">Nenhum evento cadastrado</td>
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

export default Eventos;

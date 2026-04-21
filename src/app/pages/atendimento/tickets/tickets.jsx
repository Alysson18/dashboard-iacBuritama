import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import NavBar from '../../../components/menu.jsx';
import api from '../../../config/api.js';
import Loading from '../../../components/loading/loading.js';
import ReactPaginate from "react-paginate";
import { socket } from '../../../config/socket.js';
import CryptoJS from 'crypto-js';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';
import './tickets.css';

function TicketsLista() {
    const [tickets, setTickets] = useState([]);
    const [statusFiltro, setStatusFiltro] = useState('T');
    const [pagina, setPagina] = useState(1);
    const [pageCount, setpageCount] = useState(1);
    const [controle, setControle] = useState(0);

    const formatDataStr = (str) => {
        if (!str) return '';
        const d = new Date(str);
        return d.toLocaleString('pt-BR');
    };

    function encryptData(data) {
        return CryptoJS.AES.encrypt(data.toString(), 'Alysson-2025-IACBURITAMA').toString();
    }

    const fetchGetList = async () => {
        Loading.show("Aguarde....");
        try {
            let url = `/tickets?status=${statusFiltro}&page=${pagina}&pageSize=6`;
            const res = await api.get(url);

            if (res.data.DATA && res.data.DATA.length > 0) {
                setTickets(res.data.DATA);
                setpageCount(Number(res.data.TOTAL_PAGES));
            } else {
                setTickets([]);
                setpageCount(1);
            }
        } catch (error) {
            toastr.error(error.message || error, "Erro ao buscar tickets");
        } finally {
            Loading.hide();
        }
    };

    useEffect(() => {
        fetchGetList();

        const handleNovoTicket = () => {
            setControle(c => c + 1);
        };

        socket.on('ticket_novo', handleNovoTicket);
        return () => {
            socket.off('ticket_novo', handleNovoTicket);
        };
    }, [pagina, controle, statusFiltro]);

    const handlePageClick = async (data) => {
        setPagina(data.selected + 1);
    };

    const conteudoHtml = (
        <div className='body'>
            <div className={`pt-2 mt-2`}>
                <div className='text-center'>
                    <h3 className='tituloD mb-1'>Fila de Atendimento</h3>
                </div>
                <div className="row mt-4">
                    <div className='col-md-3 mt-1 offset-md-9'>
                        <div className="input-group">
                            <select className="form-select" value={statusFiltro} onChange={(e) => setStatusFiltro(e.target.value)}>
                                <option value="T">Todos</option>
                                <option value="ABERTO">Aberto</option>
                                <option value="EM_ANDAMENTO">Em Andamento</option>
                                <option value="FECHADO">Fechado</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div className="row mt-3">
                    <div className='col-md-12'>
                        <table className="table table-responsive table-sm table-striped w-100">
                            <thead>
                                <tr className="tabela">
                                    <th className='codigo' scope="col">ID</th>
                                    <th className='nome' scope="col">Nome</th>
                                    <th className='nome d-none d-sm-table-cell' scope="col">WhatsApp</th>
                                    <th className='situacao' scope="col">Status</th>
                                    <th className='nome d-none d-md-table-cell' scope="col">Data Criação</th>
                                    <th className='nome' scope="col">Operador</th>
                                    <th className='editar ebtn text-center' scope="col">Ação</th>
                                </tr>
                            </thead>
                            <tbody className='text-center'>
                                {tickets?.length > 0 ? (
                                    tickets.map((t) => (
                                        <tr key={t.ID_TICKET}>
                                            <td>{t.ID_TICKET}</td>
                                            <td>{t.NOME}</td>
                                            <td className='d-none d-sm-table-cell'>{t.WA_ID}</td>
                                            <td>
                                                <span className={`badge bg-${t.STATUS === 'FECHADO' ? 'secondary' : (t.STATUS === 'ABERTO' ? 'success' : 'warning')}`}>
                                                    {t.STATUS}
                                                </span>
                                            </td>
                                            <td className='d-none d-md-table-cell'>{formatDataStr(t.DATA_CRIACAO)}</td>
                                            <td>{t.NOME_OPERADOR}</td>
                                            <td className='text-center'>
                                                <Link to={`/app/atendimento/chat/?wa_id=${t.WA_ID}&nome=${t.NOME}&status=${t.STATUS}`} onClick={() => sessionStorage.setItem('ticket', encryptData(t.ID_TICKET))} className="btn btn-sm btn-primary">
                                                    Abrir Conversa
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="text-center">Nenhum ticket encontrado</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <ReactPaginate
                        previousLabel={"<"}
                        nextLabel={">"}
                        breakLabel={"..."}
                        pageCount={pageCount}
                        marginPagesDisplayed={3}
                        pageRangeDisplayed={3}
                        onPageChange={handlePageClick}
                        containerClassName={"pagination justify-content-center"}
                        pageClassName={"page-item"}
                        pageLinkClassName={"page-link"}
                        previousClassName={"page-item"}
                        previousLinkClassName={"page-link"}
                        nextClassName={"page-item"}
                        nextLinkClassName={"page-link"}
                        breakClassName={"page-item"}
                        breakLinkClassName={"page-link"}
                        activeClassName={"active"}
                        disableInitialCallback={true}
                        style={{ outline: 'none' }}
                    />

                </div>
            </div>
        </div>
    );

    return (
        <NavBar conteudo={conteudoHtml} />
    );
}

export default TicketsLista;

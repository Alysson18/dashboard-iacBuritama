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
    const [setores, setSetores] = useState([]);
    const [operadores, setOperadores] = useState([]);
    const [statusFiltro, setStatusFiltro] = useState('T');
    const [setorFiltro, setSetorFiltro] = useState('');
    const [operadorFiltro, setOperadorFiltro] = useState('');
    const [nomeFiltro, setNomeFiltro] = useState('');
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
            if (setorFiltro) url += `&id_setor=${setorFiltro}`;
            if (operadorFiltro) url += `&id_operador=${operadorFiltro}`;
            if (nomeFiltro) url += `&nome=${nomeFiltro}`;

            const res = await api.get(url);

            if (res.data.DATA) {
                setTickets(res.data.DATA);
                setpageCount(Number(res.data.TOTAL_PAGES) || 1);
            } else {
                setTickets([]);
                setpageCount(1);
            }
        } catch (error) {
            toastr.error("Erro ao buscar tickets");
        } finally {
            Loading.hide();
        }
    };

    useEffect(() => {
        const fetchAux = async () => {
            try {
                const [resS, resO] = await Promise.all([api.get('/setores'), api.get('/usuarios/lista')]);
                if (resS.data.SUCCESS) setSetores(resS.data.DATA);
                if (resO.data.SUCCESS) setOperadores(resO.data.DATA);
            } catch (e) { console.error(e); }
        };
        fetchAux();
    }, []);

    useEffect(() => {
        fetchGetList();

        const handleNovoTicket = () => {
            setControle(c => c + 1);
        };

        socket.on('ticket_novo', handleNovoTicket);
        socket.on('ticket_transferido', handleNovoTicket);
        return () => {
            socket.off('ticket_novo', handleNovoTicket);
            socket.off('ticket_transferido', handleNovoTicket);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagina, controle, statusFiltro, setorFiltro, operadorFiltro, nomeFiltro]);

    const handlePageClick = async (data) => {
        setPagina(data.selected + 1);
    };

    const conteudoHtml = (
        <div className='body'>
            <div className={`pt-2 mt-2`}>
                <div className='text-center'>
                    <h3 className='tituloD mb-1'>Fila de Atendimento</h3>
                </div>

                <div className="card shadow-sm border-0 mb-4 p-3" style={{ borderRadius: '15px', background: '#fcfcfc' }}>
                    <div className="row align-items-end g-3 px-2">
                        <div className="col-12 mb-2 border-bottom pb-2 d-flex align-items-center">
                            <i className="bi bi-funnel-fill text-primary me-2"></i>
                            <h6 className="m-0 fw-bold text-dark">Filtros de Pesquisa</h6>
                        </div>
                        <div className='col-md-3'>
                            <label className="fw-bold mb-1 d-block" style={{ fontSize: '0.8rem', color: '#555' }}>Nome do Cliente</label>
                            <div className="input-group input-group-sm">
                                <span className="input-group-text bg-white border-end-0">
                                    <i className="bi bi-search text-muted"></i>
                                </span>
                                <input
                                    type="text"
                                    className="form-control border-start-0 ps-0"
                                    placeholder="Buscar..."
                                    value={nomeFiltro}
                                    onChange={(e) => { setNomeFiltro(e.target.value); setPagina(1); }}
                                />
                            </div>
                        </div>
                        <div className='col-md-3'>
                            <label className="fw-bold mb-1 d-block" style={{ fontSize: '0.8rem', color: '#555' }}>Departamento</label>
                            <select className="form-select form-select-sm" value={setorFiltro} onChange={(e) => { setSetorFiltro(e.target.value); setPagina(1); }}>
                                <option value="">Todos os Setores</option>
                                {setores.map(s => <option key={s.ID_SETOR} value={s.ID_SETOR}>{s.NOME}</option>)}
                            </select>
                        </div>
                        <div className='col-md-3'>
                            <label className="fw-bold mb-1 d-block" style={{ fontSize: '0.8rem', color: '#555' }}>Atendente</label>
                            <select className="form-select form-select-sm" value={operadorFiltro} onChange={(e) => { setOperadorFiltro(e.target.value); setPagina(1); }}>
                                <option value="">Todos os Atendentes</option>
                                {operadores.map(o => <option key={o.ID} value={o.ID}>{o.NOME}</option>)}
                            </select>
                        </div>
                        <div className='col-md-3'>
                            <label className="fw-bold mb-1 d-block" style={{ fontSize: '0.8rem', color: '#555' }}>Situação / Status</label>
                            <select className="form-select form-select-sm" value={statusFiltro} onChange={(e) => { setStatusFiltro(e.target.value); setPagina(1); }}>
                                <option value="T">Todas as Situações</option>
                                <option value="ABERTO">🔓 Aberto</option>
                                <option value="EM_ANDAMENTO">⏳ Em Andamento</option>
                                <option value="FECHADO">✅ Fechado</option>
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
                                    <th className='nome d-none d-md-table-cell' scope="col">Setor</th>
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
                                            <td className='d-none d-md-table-cell'>
                                                {t.NOME_SETOR ? <span className="badge bg-primary text-white">{t.NOME_SETOR.toUpperCase()}</span> : <span className="text-muted">-</span>}
                                            </td>
                                            <td className='d-none d-md-table-cell'>{formatDataStr(t.DATA_CRIACAO)}</td>
                                            <td>{t.NOME_OPERADOR || <span className="text-warning">Aguardando</span>}</td>
                                            <td className='text-center'>
                                                <Link to={`/app/atendimento/chat/?wa_id=${t.WA_ID}&nome=${t.NOME}&status=${t.STATUS}`} onClick={() => sessionStorage.setItem('ticket', encryptData(t.ID_TICKET))} className="btn btn-sm btn-primary">
                                                    Abrir
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="text-center">Nenhum ticket encontrado</td>
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

import React, { useState, useEffect } from 'react';
import NavBar from '../../../components/menu.jsx';
import api from '../../../config/api.js';
import Loading from '../../../components/loading/loading.js';
import CryptoJS from 'crypto-js';
import ReactPaginate from "react-paginate";
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';

function Eventos() {
    const [eventos, setEventos] = useState([]);
    const [pagina, setPagina] = useState(1);
    const [descricao, setDescricao] = useState('');
    const [pageCount, setpageCount] = useState(1);
    const [controle, setControle] = useState(0);

    function encryptData(data) {
        return CryptoJS.AES.encrypt(data.toString(), 'Alysson-2025-IACBURITAMA').toString();
    }

    function decryptData(encryptedData) {
        const bytes = CryptoJS.AES.decrypt(encryptedData.toString(), 'Alysson-2025-IACBURITAMA');
        return bytes.toString(CryptoJS.enc.Utf8);
    }

    useEffect(() => {
        const fetchGetList = async () => {
            Loading.show("Aguarde....");
            try {

                let url = `/eventos/lista?nome=${descricao}&page=${pagina}&pageSize=9`;

                const res = await api.get(url);
                if (res.data.DATA && res.data.DATA.length > 0) {
                    setEventos(res.data.DATA);
                    const total = Number(res.data.TOTALPAGES);
                    setpageCount(Math.ceil(total));
                }
                else {
                    setEventos([]);
                    setpageCount(1);
                    if (res.data.SUCCESS === false && res.data.MESSAGE) {
                        toastr.error(res.data.MESSAGE, 'Atenção');
                    }
                }
            } catch (error) {
                toastr.error(error.message || error, "Erro ao buscar lista de eventos");
            } finally {
                Loading.hide();
            }
        };

        fetchGetList();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagina, controle,])

    const handlePageClick = async (data) => {
        let currentPage = data.selected + 1;
        setPagina(currentPage)
    };

    function alterarDescricao(event) {
        setDescricao(event.target.value)
    }


    function Alterar() {
        if (document.getElementById('inputNomeEvento').value !== '' ||
            document.getElementById('inputDataEvento').value !== '' ||
            document.getElementById('inputHoraEvento').value !== '' ||
            document.getElementById('inputTemplate').value !== '') {
            Loading.show('Aguarde...')
            api.put(`/eventos`, {
                NOME_EVENTO: document.getElementById('inputNomeEvento').value,
                DATA_EVENTO: document.getElementById('inputDataEvento').value,
                HORA_EVENTO: document.getElementById('inputHoraEvento').value,
                TEMPLATE: document.getElementById('inputTemplate').value,
                ID_EVENTOS: decryptData(sessionStorage.getItem('id_eventos'))
            }).then(function (AxiosResponse) {
                Loading.hide();
                if (AxiosResponse.data.SUCCESS === true) {
                    toastr.success("Cadastro alterado com sucesso", "Sucesso");
                    window.$('#modalCadastro').modal('hide');
                    setControle(controle + 1);
                    LimparCampos();
                }
                else {
                    toastr.error(AxiosResponse.data.MESSAGE, "Atenção");
                }

            }).catch(function (error) {
                Loading.hide();
                toastr.error(error, "Erro ao cadastrar dados!")
            });
        } else {
            toastr.warning('Todos os campos devem ser prenchidos', "Erro ao cadastrar dados!");
        }

    }

    function Inserir() {
        if (document.getElementById('inputNomeEvento').value !== '' ||
            document.getElementById('inputDataEvento').value !== '' ||
            document.getElementById('inputHoraEvento').value !== '' ||
            document.getElementById('inputTemplate').value !== '') {
            Loading.show('Aguarde...')
            api.post(`/eventos`, {
                NOME_EVENTO: document.getElementById('inputNomeEvento').value,
                DATA_EVENTO: document.getElementById('inputDataEvento').value,
                HORA_EVENTO: document.getElementById('inputHoraEvento').value,
                TEMPLATE: document.getElementById('inputTemplate').value,
            }).then(function (AxiosResponse) {
                Loading.hide();
                if (AxiosResponse.data.SUCCESS === true) {
                    toastr.success("Cadastro realizado com sucesso", "Sucesso");
                    window.$('#modalCadastro').modal('hide');
                    setControle(controle + 1);
                    LimparCampos();
                }
                else {
                    toastr.error(AxiosResponse.data.MESSAGE, "Atenção");
                }

            }).catch(function (error) {
                Loading.hide();
                toastr.error(error, "Erro ao cadastrar dados!")
            });
        } else {
            toastr.warning('Todos os campos devem ser prenchidos', "Erro ao cadastrar dados!");
        }

    }

    function SalvarCadastro() {
        if (sessionStorage.getItem('Movimentacao') === 'C') {
            Inserir();
            sessionStorage.removeItem('Movimentacao')
        }
        else {
            Alterar();
            sessionStorage.removeItem('Movimentacao')
        }

    }

    function LimparCampos() {
        document.getElementById('inputNomeEvento').value = '';
        document.getElementById('inputDataEvento').value = '';
        document.getElementById('inputHoraEvento').value = '';
        document.getElementById('inputTemplate').value = '';
        sessionStorage.removeItem('id_eventos');
    }

    const type = (navigator.userAgent.match(/Android/i)
        || navigator.userAgent.match(/webOS/i)
        || navigator.userAgent.match(/iPhone/i)
        || navigator.userAgent.match(/iPad/i)
        || navigator.userAgent.match(/iPod/i)
        || navigator.userAgent.match(/BlackBerry/i)
        || navigator.userAgent.match(/Windows Phone/i) ? 'cardMobileHome' : 'cardWebHome');


    const conteudoHtml = (
        <div className='body'>
            <div className={`pt-2 mt-2`}>
                <div className='text-center'>
                    <h3 className='tituloD mb-1'>Cadastro de Eventos</h3>
                </div>
                <div className="row mt-4">
                    <div className='col-md-9 mt-1'>
                        <div className="input-group">
                            <input type="text" onChange={(e) => alterarDescricao(e)} className="form-control" placeholder="Buscar evento..." />
                            <button onClick={() => { setPagina(1); setControle(controle + 1); }}
                                className="btn btn-outline-secondary" type="button">Consultar</button>
                        </div>
                    </div>
                    <div className='col-md-3 mt-1'>
                        <button className="btn btn-secondary float-end w-100"
                            onClick={() => {
                                window.$('#modalCadastro').modal('show');
                                sessionStorage.setItem('Movimentacao', 'C');
                                LimparCampos();
                            }}
                            type="button" id="button-addon2">Novo Evento</button>
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
                                    <th className='fim_Grid editar' scope="col"></th>
                                </tr>
                            </thead>
                            <tbody className='text-center'>
                                {
                                    eventos?.length > 0 ? (
                                        eventos?.map((CC) => (
                                            <tr key={CC.ID_EVENTOS}>
                                                <td>{CC.ID_EVENTOS}</td>
                                                <td>{CC.NOME_EVENTO.length > 50 ? CC.NOME_EVENTO.slice(0, 50) + '...' : CC.NOME_EVENTO}</td>
                                                <td>{CC.DATA_EVENTO}</td>
                                                <td>{CC.HORA}</td>
                                                <td>{CC.TEMPLATE_WHATSAPP}</td>
                                                <td onClick={() => {
                                                    document.getElementById('inputNomeEvento').value = CC.NOME_EVENTO;
                                                    document.getElementById('inputDataEvento').value = CC.DATA_GRID;
                                                    document.getElementById('inputHoraEvento').value = CC.HORA;
                                                    document.getElementById('inputTemplate').value = CC.TEMPLATE_WHATSAPP;
                                                    sessionStorage.setItem('id_eventos', encryptData(CC.ID_EVENTOS))
                                                    window.$('#modalCadastro').modal('show');
                                                }} className='text-center'>
                                                    <img src="../../img/editar.png"
                                                        alt="edit" width="25"
                                                        className="fas mouse fa-edit icone-acao"></img>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="text-center">Nenhum evento encontrado</td>
                                        </tr>

                                    )
                                }
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


            {/* Modal Cadastro */}
            <div className="modal fade modal-md" id="modalCadastro" data-bs-backdrop="false" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="false">
                <div className='opaco'>
                    <div className='modal-dialog'>
                        <div className="modal-content">
                            <div className="modal-header">
                                <div className='row'>
                                    <h5 className="modal-title col-md-12 tituloC" id="TituloModalLongoExemplo">Cadastro de Eventos</h5>
                                </div>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <form className='container'>
                                    <div className="row">

                                        <div className="col-md-12 p-1">
                                            <b className="labelDescC">Nome do Evento</b>
                                            <div className="input-group">
                                                <input type="text"
                                                    id='inputNomeEvento'
                                                    className="form-control form-control-sm"
                                                    aria-label="Nome do Evento" />
                                            </div>
                                        </div>
                                        <div className="col-md-6 p-1">
                                            <b className="labelDescC">Data do Evento</b>
                                            <div className="input-group">
                                                <input type="date"
                                                    id='inputDataEvento'
                                                    className="form-control form-control-sm"
                                                    aria-label="Data do Evento" />
                                            </div>
                                        </div>
                                        <div className="col-md-6 p-1">
                                            <b className="labelDescC">Hora do Evento</b>
                                            <div className="input-group">
                                                <input type="time"
                                                    id='inputHoraEvento'
                                                    className="form-control form-control-sm"
                                                    aria-label="Hora do Evento" />
                                            </div>
                                        </div>

                                        <div className="col-md-12 p-1">
                                            <b className="labelDescC">Template</b>
                                            <div className="input-group">
                                                <input type="text"
                                                    id='inputTemplate'
                                                    className="form-control form-control-sm"
                                                    aria-label="Template" />
                                            </div>
                                        </div>

                                    </div>
                                </form>
                            </div>
                            <div className="modal-footer">
                                <button onClick={() => {
                                    LimparCampos();
                                    window.$('#modalCadastro').modal('hide')
                                }} type="button" className="btn btn-danger">Cancelar</button>
                                <button onClick={() => SalvarCadastro()} type="button" className="btn btn-success">Salvar</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div >


        </div >
    );

    return (
        <NavBar conteudo={conteudoHtml} />
    );
}

export default Eventos;

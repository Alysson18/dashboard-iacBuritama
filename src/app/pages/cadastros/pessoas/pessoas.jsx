import React, { useState, useEffect } from 'react';
import NavBar from '../../../components/menu.jsx';
import api from '../../../config/api.js';
import Loading from '../../../components/loading/loading.js';
import CryptoJS from 'crypto-js';
import ReactPaginate from "react-paginate";
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';
import './../../css/estilo.css'
import { Mask } from '../../../config/Util.js';

function Pessoas() {

    const [pessoa, setPessoa] = useState([]);
    const [descricao, setDescricao] = useState('');
    const [pagina, setPagina] = useState(1);
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
                const res = await api.get(
                    `/pessoas/lista?page=${pagina}&pageSize=10`
                );
                if (res.data.DATA.length > 0) {
                    setPessoa(res.data.DATA);
                    const total = Number(res.data.TOTALPAGES);
                    setpageCount(Math.ceil(total));
                }
                else if (res.data.SUCCESS === false) {
                    toastr.error(res.data.MESSAGE, 'Erro!');
                }
            } catch (error) {
                toastr.error(error, "Erro ao buscar lista de pessoas");
            } finally {
                Loading.hide();
            }
        };

        fetchGetList();

    }, [pagina, controle])

    const handlePageClick = async (data) => {
        let currentPage = data.selected + 1;
        setPagina(currentPage)
    };

    function alterarDescricao(event) {
        setDescricao(event.target.value)
    }

    function BuscarNome(value) {
        Loading.show("Aguarde....")
        const fetchGetList = async () => {
            Loading.show("Aguarde....");
            try {
                const res = await api.get(
                    `/pessoas/lista/params?descricao=${value}&id_empresa=${decryptData(sessionStorage.getItem('id_empresa'))}&page=${pagina}&pageSize=10`
                );
                if (res.data.DATA.length > 0) {
                    setPessoa(res.data.DATA);
                    const total = Number(res.data.TOTALPAGES);
                    setpageCount(Math.ceil(total));
                }
                else {
                    setPessoa(res.data.DATA);
                    const total = Number(res.data.TOTALPAGES);
                    setpageCount(Math.ceil(total));
                }
            } catch (error) {
                toastr.error("Erro ao buscar lista de funções:", error);
            } finally {
                Loading.hide();
            }
        };

        fetchGetList();
    }

    function Alterar() {
        if (document.getElementById('inputNomeCompleto').value !== '' ||
            document.getElementById('inputTelefone').value !== '' ||
            document.getElementById('inputEmail').value !== '' ||
            document.getElementById('inputMAC').value !== '') {
            Loading.show('Aguarde...')
            api.put(`/cadastro`, {
                NOME: document.getElementById('inputNomeCompleto').value,
                EMAIL: document.getElementById('inputEmail').value,
                TELEFONE: document.getElementById('inputTelefone').value,
                MAC: document.getElementById('inputMAC').value,
                MEMBRO: document.getElementById('inputMembro').value,
                ID_PESSOA: decryptData(sessionStorage.getItem('id_pessoa'))
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

    function Deletar(id_pessoa) {
        Loading.show('Aguarde...')
        api.delete(`/delete/cadastro/${id_pessoa}`).then(function (AxiosResponse) {
            Loading.hide();
            if (AxiosResponse.data.SUCCESS === true) {
                toastr.success("Cadastro deletado com sucesso", "Sucesso");
                setControle(controle + 1);
            }
            else {
                toastr.error(AxiosResponse.data.MESSAGE, "Atenção");
            }

        }).catch(function (error) {
            Loading.hide();
            toastr.error(error, "Erro ao cadastrar dados!")
        });

    }

    function Inserir() {
        if (document.getElementById('inputNomeCompleto').value !== '' ||
            document.getElementById('inputTelefone').value !== '' ||
            document.getElementById('inputEmail').value !== '' ||
            document.getElementById('inputMAC').value !== '') {
            Loading.show('Aguarde...')
            api.post(`/cadastro`, {
                NOME: document.getElementById('inputNomeCompleto').value,
                EMAIL: document.getElementById('inputEmail').value,
                TELEFONE: document.getElementById('inputTelefone').value,
                MAC: document.getElementById('inputMAC').value,
                ACEITOU_TERMOS: "S",
                MEMBRO: document.getElementById('inputMAC').value
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
        document.getElementById('inputNomeCompleto').value = '';
        document.getElementById('inputTelefone').value = '';
        document.getElementById('inputEmail').value = '';
        document.getElementById('inputMAC').value = '';

        sessionStorage.removeItem('id_pessoa');
    }

    const type = (navigator.userAgent.match(/Android/i)
        || navigator.userAgent.match(/webOS/i)
        || navigator.userAgent.match(/iPhone/i)
        || navigator.userAgent.match(/iPad/i)
        || navigator.userAgent.match(/iPod/i)
        || navigator.userAgent.match(/BlackBerry/i)
        || navigator.userAgent.match(/Windows Phone/i) ? 'cardMobileHome' : 'cardWebHome');




    const conteudoHtml = <div className='body'>
        <div className={`pt-2  mt-2`}>
            <div className='text-center'>
                <h3 className='tituloD mb-1'>Membros/Visitantes</h3>
            </div>
            <div className="row mt-4">
                <div className='col-md-6 mt-1'>
                    <div className="input-group" hidden>
                        <input type="text" className="form-control"
                            onChange={(e) => alterarDescricao(e)}
                            placeholder="Digite um Nome para Buscar..." aria-label="Recipient's username"
                            aria-describedby="button-addon2" />
                        <button onClick={() => descricao !== '' ? BuscarNome(descricao) : setControle(controle + 1)}
                            className="btn btn-outline-secondary" type="button" id="button-addon2">Consultar</button>
                    </div>
                </div>
                <div className='col-md-3'>
                    <div className="input-group">


                    </div>
                </div>
                <div className='col-md-3 mt-1'>
                    <button className="btn btn-secondary float-end w-100"
                        onClick={() => {
                            window.$('#modalCadastro').modal('show');
                            sessionStorage.setItem('Movimentacao', 'C');
                            LimparCampos();
                        }}
                        type="button" id="button-addon2">Novo</button>
                </div>
            </div>
            <div className="row mt-3">
                <div className='col-md-12'>
                    <table className="table table-responsive table-sm table-striped w-100">
                        <thead>
                            <tr className="tabela">
                                <th className='codigo' scope="col">Código</th>
                                <th className='nome' scope="col">Nome Completo</th>
                                <th className='nome' scope="col">Telefone</th>
                                <th className='nome' scope="col">Email</th>
                                <th className='nome' scope="col">Tipo Pessoa</th>
                                <th className='nome' scope="col">Data Cadastro</th>
                                <th className='delete' scope="col"></th>
                                <th className='editar' scope="col"></th>
                            </tr>
                        </thead>
                        <tbody className='text-center'>{
                            pessoa?.length > 0 ? (
                                pessoa?.map((CC) => (
                                    <tr key={CC.ID_PESSOA}>
                                        <td>{CC.ID_PESSOA}</td>
                                        <td>{CC.NOME.length > 20 ? CC.NOME.slice(0, 20) + '...' : CC.NOME}</td>
                                        <td>{Mask.telefone(CC.TELEFONE)}</td>
                                        <td>{CC.EMAIL}</td>
                                        <td>{(CC.MEMBRO === 'S') ? 'Membro' : 'Visitante'}</td>
                                        <td>{CC.DATA_CADASTRO}</td>
                                        <td onClick={() => {
                                            Deletar(CC.ID_PESSOA)
                                        }} className='text-center'>
                                            <img src="../../img/delete.png"
                                                alt="delete" width="25"
                                                className="fas mouse fa-edit icone-acao"></img>
                                        </td>
                                        <td onClick={() => {
                                            sessionStorage.setItem('Movimentacao', 'A');
                                            sessionStorage.setItem('id_pessoa', encryptData(CC.ID_PESSOA))
                                            document.getElementById('inputNomeCompleto').value = CC.NOME;
                                            document.getElementById('inputTelefone').value = CC.TELEFONE;
                                            document.getElementById('inputEmail').value = CC.EMAIL;
                                            document.getElementById('inputMAC').value = CC.MAC;
                                            document.getElementById('inputMembro').value = (CC.MEMBRO === 'S') ? 'S' : 'N';
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
                                    <td colSpan="8" className="text-center">Nenhuma pessoa encontrada</td>
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
                                <h5 className="modal-title col-md-12 tituloC" id="TituloModalLongoExemplo">Cadastro Pessoas</h5>
                            </div>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <form className='container'>
                                <div className="row">

                                    <div className="col-md-12 p-1">
                                        <b className="labelDescC">Nome Completo</b>
                                        <div className="input-group">
                                            <input type="text"
                                                id='inputNomeCompleto'
                                                className="form-control form-control-sm"
                                                aria-label="Nome Completo" />
                                        </div>
                                    </div>
                                    <div className="col-md-6 p-1">
                                        <b className="labelDescC">Telefone</b>
                                        <div className="input-group">
                                            <input type="text"
                                                id='inputTelefone'
                                                className="form-control form-control-sm"
                                                aria-label="Telefone" />
                                        </div>
                                    </div>
                                    <div className="col-md-6 p-1">
                                        <b className="labelDescC">Email</b>
                                        <div className="input-group">
                                            <input type="email"
                                                id='inputEmail'
                                                className="form-control form-control-sm"
                                                aria-label="Email" />
                                        </div>
                                    </div>
                                    <div className="col-md-6 p-1">
                                        <b className="labelDescC">Mac Dispositivo</b>
                                        <div className="input-group">
                                            <input type="text"
                                                id='inputMAC'
                                                className="form-control form-control-sm"
                                                aria-label="Email" />
                                        </div>
                                    </div>

                                    <div className='col-md-6 mt-1'>
                                        <b className="labelDescC">Tipo Pessoa</b>
                                        <select class="form-select form-select-sm select" aria-label="Membroe" id="inputMembro">
                                            <option value="S">Membro</option>
                                            <option value="N">Visitante</option>
                                        </select>
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



    return (<>
        <NavBar conteudo={conteudoHtml} />
    </>
    );
}

export default Pessoas;


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

function AcessoPessoas() {

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
        var date = new Date();
        var primeiroDia = new Date(date.getFullYear(), date.getMonth(), 1);
        var ultimoDia = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        // Formatar datas para YYYY-MM-DD
        const formatarData = (data) => data.toISOString().split('T')[0];

        document.getElementById('inputDataInicial').value = formatarData(primeiroDia);
        document.getElementById('inputDataFinal').value = formatarData(ultimoDia);

        const fetchGetList = async () => {
            Loading.show("Aguarde....");
            try {
                const res = await api.get(
                    `/pessoas/checkinPeriodo/?dataInicial=${document.getElementById('inputDataInicial').value}&dataFinal=${document.getElementById('inputDataFinal').value}&page=${pagina}&pageSize=10`
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
                    `/pessoas/checkinPeriodo/?dataInicial=${document.getElementById('inputDataInicial').value}&dataFinal=${document.getElementById('inputDataFinal').value}&page=${pagina}&pageSize=10`
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
                <h3 className='tituloD mb-1'>Acessos Periodo</h3>
            </div>
            <div className="row mt-4">
                <div className='col-md-2 mt-1'>
                    <div className="input-group">
                        <input type="date" className="form-control"
                            id='inputDataInicial'
                            placeholder="Digite uma data Inicial" aria-label="Recipient's username"
                            aria-describedby="button-addon2" />
                    </div>
                </div>
                <div className='col-md-2 mt-1'>
                    <div className="input-group">
                        <input type="date" className="form-control"
                            id='inputDataFinal'
                            placeholder="Digite uma data Final" aria-label="Recipient's username"
                            aria-describedby="button-addon2" />
                    </div>
                </div>
                <div className='col-md-3 mt-1'>

                    <button onClick={() => BuscarNome()}
                        className="btn btn-outline-secondary" type="button" id="button-addon2">Consultar</button>
                </div>
                <div className='col-md-2'>
                    <div className="input-group">
                    </div>
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
                                <th className='nome' scope="col">Tipo Pessoa</th>
                                <th className='nome' scope="col">Data Checkin</th>
                            </tr>
                        </thead>
                        <tbody className='text-center'>{
                            pessoa?.length > 0 ? (
                                pessoa?.map((CC) => (
                                    <tr key={CC.ID_PESSOA}>
                                        <td>{CC.ID_PESSOA}</td>
                                        <td>{CC.NOME.length > 20 ? CC.NOME.slice(0, 20) + '...' : CC.NOME}</td>
                                        <td>{Mask.telefone(CC.TELEFONE)}</td>
                                        <td>{(CC.MEMBRO === 'S') ? 'Membro' : 'Visitante'}</td>
                                        <td>{CC.DATA_FORMATADA}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center">Nenhuma pessoa encontrada</td>
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



    </div >



    return (<>
        <NavBar conteudo={conteudoHtml} />
    </>
    );
}

export default AcessoPessoas;


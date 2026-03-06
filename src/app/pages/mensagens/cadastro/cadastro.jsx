import React, { useState, useEffect } from 'react';
import NavBar from '../../../components/menu.jsx';
import api from '../../../config/api.js';
import Loading from '../../../components/loading/loading.js';
import CryptoJS from 'crypto-js';
import ReactPaginate from "react-paginate";
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';
import EditorWhatsApp from '../../../components/editorWhatsApp';

function MensagensCadastro() {
    const [templates, setTemplates] = useState([]);
    const [pagina, setPagina] = useState(1);
    const [descricao, setDescricao] = useState('');
    const [pageCount, setpageCount] = useState(1);
    const [controle, setControle] = useState(0);
    const [conteudoDaMensagem, setConteudoDaMensagem] = useState('');
    // 1. Estados para os campos do formulário (Adapta se já os tiveres noutro lugar)
    const [tipo, setTipo] = useState('MARKETING');
    const [nomeTemplate, setNomeTemplate] = useState('');

    // 2. Estados para o nosso Editor e Variáveis
    const [variaveis, setVariaveis] = useState([]); // Guarda a lista de variáveis: ['{{1}}', '{{2}}']
    const [exemplos, setExemplos] = useState({});   // Guarda o que o utilizador digita: { '{{1}}': 'João' }

    // 3. O "Espião" (useEffect): Roda sempre que o texto do editor muda
    useEffect(() => {
        const regex = /\{\{\d+\}\}/g;
        const encontradas = conteudoDaMensagem.match(regex);

        if (encontradas) {
            // Remove duplicados (ex: se o utilizador usar {{1}} duas vezes)
            const unicas = [...new Set(encontradas)];
            setVariaveis(unicas);
        } else {
            setVariaveis([]); // Limpa se apagar tudo
        }
    }, [conteudoDaMensagem]);

    // Função para atualizar o valor de cada exemplo específico
    const handleExemploChange = (variavel, valorDigitado) => {
        setExemplos(prev => ({
            ...prev,
            [variavel]: valorDigitado
        }));
    };
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

                let url = `/templates/lista?nome=${descricao}&page=${pagina}&pageSize=9`;

                const res = await api.get(url);
                if (res.data.DATA && res.data.DATA.length > 0) {
                    setTemplates(res.data.DATA);
                    const total = Number(res.data.TOTALPAGES);
                    setpageCount(Math.ceil(total));
                }
                else {
                    setTemplates([]);
                    setpageCount(1);
                    if (res.data.SUCCESS === false && res.data.MESSAGE) {
                        toastr.error(res.data.MESSAGE, 'Atenção');
                    }
                }
            } catch (error) {
                toastr.error(error.message || error, "Erro ao buscar lista de templates");
            } finally {
                Loading.hide();
            }
        };

        fetchGetList();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagina, controle,])

    async function AtualizarTemplates() {
        Loading.show("Aguarde....");
        try {
            const res = await api.get(`/templates/listaMeta`);
            if (res.data.RESULT === true) {
                toastr.success(res.data.MESSAGE, "Sucesso");
                setControle(controle + 1);
            }
            else {
                toastr.error(res.data.MESSAGE, "Atenção");
            }
        } catch (error) {
            toastr.error(error.message || error, "Erro ao atualizar templates");
        } finally {
            Loading.hide();
        }
    }

    const handlePageClick = async (data) => {
        let currentPage = data.selected + 1;
        setPagina(currentPage)
    };

    function alterarDescricao(event) {
        setDescricao(event.target.value)
    }

    function Alterar() {
        if (document.getElementById('inputNomeCompleto').value !== '' ||
            document.getElementById('inputTelefone').value !== '' ||
            document.getElementById('inputMAC').value !== '') {
            Loading.show('Aguarde...')
            api.put(`/cadastro`, {
                NOME: document.getElementById('inputNomeCompleto').value,
                TELEFONE: document.getElementById('inputTelefone').value,
                MAC: document.getElementById('inputMAC').value,
                MEMBRO: document.getElementById('inputMembro').value,
                SITUACAO: document.getElementById('inputSituacao').value,
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
        if (document.getElementById('inputNomeTemplate').value !== '' ||
            document.getElementById('inputTipo').value !== '' ||
            document.getElementById('inputDescricaoTemplate').value !== '') {
            Loading.show('Aguarde...')
            api.post(`/cadastro`, {
                NOME: document.getElementById('inputNomeTemplate').value,
                TELEFONE: document.getElementById('inputTipo').value,
                MAC: document.getElementById('inputDescricaoTemplate').value,
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
        document.getElementById('inputDescricaoTemplate').value = '';
        document.getElementById('inputNomeTemplate').value = '';
        setConteudoDaMensagem('');
        setExemplos({});
        sessionStorage.removeItem('id_template');
    }


    const conteudoHtml = (
        <div className='body'>
            <div className={`pt-2 mt-2`}>
                <div className='text-center'>
                    <h3 className='tituloD mb-1'>Cadastro de Mensagens</h3>
                </div>
                <div className="row mt-4">
                    <div className='col-md-6 mt-1'>
                        <div className="input-group">
                            <input type="text" className="form-control" placeholder="Buscar mensagem..." />
                            <button className="btn btn-outline-secondary" type="button">Consultar</button>
                        </div>
                    </div>
                    <div className='col-md-3 mt-1'>
                        <button className="btn btn-secondary float-end w-100" type="button" onClick={() => AtualizarTemplates()}>Atualizar Templates</button>
                    </div>
                    <div className='col-md-3 mt-1'>
                        <button onClick={() => {
                            window.$('#modalCadastro').modal('show');
                            sessionStorage.setItem('Movimentacao', 'C');
                            LimparCampos();
                        }}
                            className="btn btn-secondary float-end w-100" type="button">Nova Mensagem</button>
                    </div>
                </div>
                <div className="row mt-3">
                    <div className='col-md-12'>
                        <table className="table table-responsive table-sm table-striped w-100">
                            <thead>
                                <tr className="tabela">
                                    <th className='codigo' scope="col">Código</th>
                                    <th className='nome' scope="col">Título da Mensagem</th>
                                    <th className='nome' scope="col">Categoria</th>
                                    <th className='nome' scope="col">Template WhatsApp</th>
                                    <th scope="col">Status</th>
                                    <th className='delete' scope="col"></th>
                                    <th className='editar' scope="col"></th>
                                </tr>
                            </thead>
                            <tbody className='text-center'>
                                {
                                    templates?.length > 0 ? (
                                        templates?.map((CC) => (
                                            <tr key={CC.ID_TEMPLATE}>
                                                <td>{CC.ID_TEMPLATE}</td>
                                                <td>{CC.DESCRICAO.length > 50 ? CC.DESCRICAO.slice(0, 50) + '...' : CC.DESCRICAO}</td>
                                                <td>{CC.TIPO}</td>
                                                <td>{CC.NOME_MODELO}</td>
                                                <td>{CC.SITUACAO}</td>
                                                <td onClick={() => {
                                                    // Deletar(CC.ID_PESSOA)
                                                }} className='text-center'>
                                                    <img src="../../img/delete.png"
                                                        alt="delete" width="25"
                                                        className="fas mouse fa-edit icone-acao"></img>
                                                </td>
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
            <div className="modal fade modal-lg" id="modalCadastro" data-bs-backdrop="false" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="false">
                <div className='opaco'>
                    <div className='modal-dialog'>
                        <div className="modal-content shadow-lg border-0"> {/* Pequena sombra extra */}

                            <div className="modal-header bg-light">
                                <h5 className="modal-title tituloC text-primary fw-bold" id="TituloModalLongoExemplo">
                                    <i className="bi bi-whatsapp me-2"></i> Cadastro Template Mensagem
                                </h5>
                                <button onClick={LimparCampos} type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>

                            <div className="modal-body">
                                <form className='container-fluid'> {/* Usei fluid para ocupar bem o espaço */}

                                    {/* LINHA 1: Descrição e Tipo */}
                                    <div className="row mb-2">
                                        <div className="col-md-6 p-1">
                                            <b className="labelDescC">Descrição Template</b>
                                            <input
                                                type="text"
                                                id='inputDescricaoTemplate'
                                                className="form-control form-control-sm"
                                                value={descricao}
                                                onChange={(e) => setDescricao(e.target.value)}
                                            />
                                        </div>
                                        <div className='col-md-6 p-1'>
                                            <b className="labelDescC">Tipo Template</b>
                                            <select
                                                className="form-select form-select-sm select"
                                                id="inputTipo"
                                                value={tipo}
                                                onChange={(e) => setTipo(e.target.value)}
                                            >
                                                <option value="MARKETING">Marketing (Avisos, Ofertas)</option>
                                                <option value="UTILITY">Utilidades (Recibos, Inscrições)</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* LINHA 2: Nome do Template */}
                                    <div className="row mb-3">
                                        <div className="col-md-12 p-1">
                                            <b className="labelDescC">Nome Template (Na Meta)</b>
                                            <input
                                                type="text"
                                                id='inputNomeTemplate'
                                                className="form-control form-control-sm"
                                                placeholder="Ex: aviso_culto_domingo (usar minúsculas e underline)"
                                                value={nomeTemplate}
                                                onChange={(e) => setNomeTemplate(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {/* LINHA 3: DIVISÃO MÁGICA (Editor de um lado, Variáveis do outro) */}
                                    <div className="row border-top pt-3 mt-1">

                                        {/* COLUNA ESQUERDA: O Editor */}
                                        <div className="col-md-7 border-end">
                                            <EditorWhatsApp
                                                conteudo={conteudoDaMensagem}
                                                setConteudo={setConteudoDaMensagem}
                                            />
                                        </div>

                                        {/* COLUNA DIREITA: Variáveis Dinâmicas */}
                                        <div className="col-md-5">
                                            <b className="labelDescC text-secondary d-block mb-2">Variáveis Encontradas</b>

                                            {variaveis.length === 0 ? (
                                                <div className="alert alert-secondary text-center p-2" style={{ fontSize: '0.9rem' }}>
                                                    Nenhuma variável no texto. <br /> Use <b>{`{{1}}`}</b>, <b>{`{{2}}`}</b> para adicionar personalização.
                                                </div>
                                            ) : (
                                                <div className="bg-light p-3 rounded border scrollVertical">
                                                    <small className="text-muted d-block mb-3">Preencha um exemplo real para cada variável. A Meta exige isso para aprovar o template.</small>

                                                    {/* Faz um loop nas variáveis encontradas e desenha os campos */}
                                                    {variaveis.map((variavel, index) => (
                                                        <div className="mb-2" key={index}>
                                                            <label className="form-label form-label-sm fw-bold mb-1">
                                                                Exemplo para <span className="text-primary">{variavel}</span>
                                                            </label>
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm"
                                                                placeholder="Ex: Alysson, Culto, 19:30..."
                                                                value={exemplos[variavel] || ''}
                                                                onChange={(e) => handleExemploChange(variavel, e.target.value)}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                    </div>

                                </form>
                            </div>

                            <div className="modal-footer bg-light">
                                <button
                                    onClick={() => { LimparCampos(); window.$('#modalCadastro').modal('hide'); }}
                                    type="button"
                                    className="btn btn-outline-danger"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => { SalvarCadastro(); window.$('#modalCadastro').modal('hide'); }}
                                    type="button"
                                    className="btn btn-success px-4 fw-bold"
                                >
                                    <i className="bi bi-cloud-arrow-up me-1"></i> Salvar e Enviar
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div >
    );

    return (
        <NavBar conteudo={conteudoHtml} />
    );
}

export default MensagensCadastro;

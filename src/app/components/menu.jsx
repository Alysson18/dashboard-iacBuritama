import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../config/api.js'
import './styles.css';
import Loading from '../components/loading/loading';
import CryptoJS from 'crypto-js';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';
import md5 from 'md5';
import PlanejamentoGastos from '../pages/relatorios/extratoMensalLista/extratoLista.jsx';

function Menu({ conteudo }) {
    const [empresas, setEmpresas] = useState([])


    function encryptData(data) {
        return CryptoJS.AES.encrypt(data.toString(), 'Alysson-2025-ABAC').toString();
    }

    function decryptData(encryptedData) {
        const bytes = CryptoJS.AES.decrypt(encryptedData.toString(), 'Alysson-2025-ABAC');
        return bytes.toString(CryptoJS.enc.Utf8);
    }

    function Logout() {
        sessionStorage.clear();
        localStorage.clear();

    }


    function alterarSenha() {
        const novaSenha = document.getElementById("novaSenha").value;
        const confirmarSenha = document.getElementById("confirmarSenha").value;

        if (novaSenha !== '') {
            if (novaSenha !== confirmarSenha) {
                toastr.warning("As senhas não coincidem. Por favor, verifique.", 'Atenção');
                return;
            }
            else {
                Loading.show('Aguarde...')
                api.put('/senha', {
                    "ID_USUARIO": decryptData(sessionStorage.getItem('id_usuario')),
                    "SENHA": md5(novaSenha)
                }).then((Response) => {
                    // Fechar modal após salvar (simulado)
                    if (Response.data.SUCCESS) {
                        window.$('#alterarSenhaModal').modal('hide');
                        toastr.success("Senha alterada com sucesso!", "Sucesso.");
                        document.getElementById("novaSenha").value = '';
                        document.getElementById("confirmarSenha").value = '';
                    }
                    else {
                        toastr.error(Response.data.MESSAGE, "Erro");
                    }
                }).catch((error) => {
                    toastr.error(error, "Erro");
                }).finally(() => {
                    Loading.hide()
                })
            }
        } else {
            toastr.warning('Todos os campos devem ser prenchidos', "Erro ao cadastrar dados!");
        }


    }


    // useState(() => {
    //     Loading.show('Aguarde...')
    //     const fetchGetList = async () => {
    //         const res = await api.get("/usuario/empresas?id_usuario=" + decryptData(sessionStorage.getItem("id_usuario")));
    //         setEmpresas(res.data.DATA)
    //         Loading.hide();
    //     }
    //     fetchGetList();
    //     // eslint-disable-next-line
    // }, '')


    useEffect(() => {
        var trigger = window.$('.hamburger'),
            overlay = window.$('.overlay'),
            isClosed = false;

        function hamburger_cross() {
            if (isClosed) {
                overlay.hide();
                trigger.removeClass('is-open').addClass('is-closed');
                isClosed = false;
            } else {
                overlay.show();
                trigger.removeClass('is-closed').addClass('is-open');
                isClosed = true;
            }
        }

        trigger.click(hamburger_cross);

        window.$('[data-toggle="offcanvas"]').click(function () {
            window.$('#wrapper').toggleClass('toggled');
        });

        // Cleanup dos eventos ao desmontar o componente
        return () => {
            trigger.off('click', hamburger_cross);
            window.$('[data-toggle="offcanvas"]').off('click');
        };
    }, []);

    return (
        <div id="wrapper">
            <div className="overlay"></div>

            {/* Navbar */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark color fixed-top navTop">
                <div className="container-fluid">

                    <button type="button" className="btn btn-outline-light me-0" data-toggle="offcanvas">
                        <i class="bi bi-list"></i>
                    </button>

                    <div className="collapse navbar-collapse" id="navbarNav">
                    </div>
                </div>
            </nav >

            {/* Sidebar */}
            < nav className="navbar navbar-inverse fixed-top" id="sidebar-wrapper" role="navigation" >
                <ul className="nav sidebar-nav">
                    <div className="sidebar-header">
                        <div className="sidebar-brand">
                            <img className='mt-2' src='../../../img/logoHorizontalBranca.png' width='93%' />
                        </div>
                    </div>
                    <li><Link className="nav-link home" to="/app/home">Home</Link></li>
                    <li className="dropdown">
                        <a href="#acessosRede" className="dropdown-toggle" data-toggle="dropdown">
                            Acessos a Rede <span className="caret"></span>
                        </a>D
                        <ul className="dropdown-menu animated fadeInLeft" role="menu">
                            <div className="dropdown-header">Cadastros</div>
                            <li><Link className="nav-link usuario" to="/app/cadastros/pessoas">Cadastro de Acesso</Link></li>
                            <li><Link className="nav-link evento" to="/app/cadastro/eventos">Cadasto de Eventos</Link></li>
                            <div className="dropdown-header">Dados</div>
                            <li><Link className="nav-link grafico" to="/app/acessos/acesso-periodo">Acessos por Periodo</Link></li>
                            <li><Link className="nav-link grafico" to="/app/acessos/quantidade-acesso">Qtd. Acessos por Pessoas</Link></li>
                            <li><Link className="nav-link grafico" to="/app/acessos/acesso-pessoa">Acessos por Pessoas</Link></li>
                            <div className="dropdown-header">Sorteio</div>
                            <li><Link className="nav-link sorteio" to="/app/acessos/sorteio">Sortear</Link></li>
                        </ul>
                    </li>
                    <li className="dropdown">
                        <a href="#mensagens" className="dropdown-toggle" data-toggle="dropdown">
                            Mensagens<span className="caret"></span>
                        </a>
                        <ul className="dropdown-menu animated fadeInLeft" role="menu">
                            <div className="dropdown-header">Cadastros</div>
                            <li><Link className="nav-link email" to="/app/conta-corrente">Mensagens de Email</Link></li>
                            <li><Link className="nav-link whatsapp" to="/app/conta-corrente">Mensagens do WhatsApp</Link></li>
                            <div className="dropdown-header">Disparo</div>
                            <li><Link className="nav-link email" to="/app/conta-corrente">Email</Link></li>
                            <li><Link className="nav-link whatsapp" to="/app/condicao-pagamento">WhatsApp</Link></li>
                        </ul>
                    </li>

                    <li className="dropdown">
                        <a href="#services" className="dropdown-toggle" data-toggle="dropdown">
                            Configurações <span className="caret"></span>
                        </a>
                        <ul className="dropdown-menu animated fadeInLeft" role="menu">
                            <div className="dropdown-header">Usuário</div>
                            <li><Link className="nav-link key" data-bs-toggle="modal" data-bs-target="#alterarSenhaModal">Alterar Senha</Link></li>
                        </ul>
                    </li>
                    <li className='mb-5'><Link className="nav-link logout" to="/" onClick={() => Logout()}>Logout</Link></li>
                </ul>
            </nav >

            {/* Content */}
            < div id="page-content-wrapper" >
                {/* <button type="button" className="hamburger animated fadeInLeft is-closed" data-toggle="offcanvas">
                    <span className="hamb-top"></span>
                    <span className="hamb-middle"></span>
                    <span className="hamb-bottom"></span>
                </button> */}
                < div className="container-fluid" >
                    <div className="row">
                        {conteudo}
                    </div>
                </div >
            </div >





            {/*Estrutura do Modal*/}
            <div class="modal fade" id="alterarSenhaModal" tabindex="-1" aria-labelledby="alterarSenhaModalLabel" aria-hidden="true" ata-bs-backdrop="false" data-bs-keyboard="false">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="alterarSenhaModalLabel">Alterar Senha</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
                        </div>
                        <div class="modal-body">
                            <form id="alterarSenhaForm">
                                <div class="mb-1">
                                    <b className="labelDescC">Nova Senha</b>
                                    <input type="password" class="form-control" id="novaSenha"
                                        laceholder="Digite a nova senha" required />
                                </div>
                                <div class="mb-2">
                                    <b className="labelDescC">Confirme a Nova Senha</b>
                                    <input type="password" class="form-control" id="confirmarSenha"
                                        placeholder="Confirme a nova senha" required />
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-primary" onClick={() => alterarSenha()}>Salvar</button>
                        </div>
                    </div>
                </div>
            </div>

        </div >
    );
}

export default Menu;

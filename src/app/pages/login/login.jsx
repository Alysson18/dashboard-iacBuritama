import React, { useState, useContext } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { AuthContext } from '../../Context/auth';
import './login.css';
import api from '../../config/api';
import md5 from 'md5';
import Loading from '../../components/loading/loading';
import CryptoJS from 'crypto-js';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';


toastr.options = {
    "closeButton": true,
    "debug": false,
    "newestOnTop": false,
    "progressBar": true,
    "positionClass": "toast-top-right",
    "preventDuplicates": false,
    "onclick": null,
    "showDuration": "300",
    "hideDuration": "1000",
    "timeOut": "5000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
}

function Login() {


    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [Sucesso, setSucesso] = useState('Nulo');
    const { setLogado } = useContext(AuthContext);
    const senhaHash = md5(senha)


    function encryptData(data) {
        return CryptoJS.AES.encrypt(data.toString(), 'Alysson-2025-IACBURITAMA').toString();
    }


    function LoginUsuario() {
        if (email === '' || senha === '') {
            toastr.warning('Usuario ou senha devem ser preenchidos.', "Atenção")
        }
        else {
            Loading.show('Efetuando Login...')
            api.post("/login", { "USUARIO": email, "SENHA": senhaHash }).then(function (AxiosResponse) {
                if (AxiosResponse.data.SUCCESS === true) {
                    sessionStorage.setItem("logado", encryptData("S"));
                    sessionStorage.setItem("nome_usuario", encryptData(AxiosResponse.data.DATA[0].NOME));
                    sessionStorage.setItem("id_usuario", encryptData(AxiosResponse.data.DATA[0].ID));
                    //sessionStorage.setItem("id_empresa", encryptData(AxiosResponse.data.DATA[0].EMPRESA_PADRAO));
                    setLogado(true);
                    setSucesso('S')
                }
                else {
                    Loading.hide();
                    toastr.warning('Usuario ou senha incorretos', "Atenção")
                }
            }).catch(function (error) {
                sessionStorage.setItem("logado", "N");
                setLogado(false);
                Loading.hide();
                setSucesso('N')
                toastr.error(error, "Erro")
            });
        }
    }



    function EnterTab(event) {
        if (event.keyCode === 13) {
            document.getElementById("floatingPassword").focus();
        }
    }

    function EnvioEnter(event) {
        if (document.getElementById("floatingPassword")) {
            if (event.keyCode === 13) {
                LoginUsuario()
            }
        }
    }



    function alterarEmail(event) {
        setEmail(event.target.value)
    }

    function alterarSenha(event) {
        setSenha(event.target.value)
    }

    return <div className="d-flex align-items-center text-center form-container">
        <div className="card form-signin colorCard">
            <form className="form-signin">
                <img className="mb-3 mt-3" src="../../img/logoHorizontalBranca.png" alt="" width="300" />
                <h1 className="h3 mb-3 fw-normal text-white">Login</h1>

                <div className="form-floating mb-1">
                    <input onChange={alterarEmail}
                        onKeyDown={EnterTab} type="email" className="form-control edtEmail"
                        id="floatingInput" placeholder=" " />
                    <label htmlFor="floatingInput">E-mail</label>
                </div>
                <div className="form-floating mt-1">
                    <input onChange={alterarSenha} onKeyDown={EnvioEnter} type="password"
                        className="form-control edtSenha" id="floatingPassword" placeholder=" " />
                    <label htmlFor="floatingPassword">Senha</label>
                </div>

                <button on onClick={() => { LoginUsuario() }} className="btnLogin w-100 btn btn-lg mt-3" type="button">Acessar</button>
                {
                    Sucesso === 'S' ? <Redirect to='/app/home' /> : null
                }

                {/* <div className="login-links mt-3">
                    <Link to="/app/esquecisenha" className="mx-3">Esqueci Senha</Link>
                </div> */}
                <footer className="mt-5 mb-4 text-white">
                    <label className='text-white'> Versão: 0.0.1</label> <br />
                    &copy;Desenvolvido Por <a href="https://softwareplus.com.br" className="login-links text-white">SoftwarePlus </a></footer>

            </form >
        </div>

    </div>

}
export default Login;


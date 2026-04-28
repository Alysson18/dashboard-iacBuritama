import React, { useContext } from 'react';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import { AuthContext } from './app/Context/auth.jsx';
import CryptoJS from 'crypto-js';

/* Paginas */
import login from './app/pages/login/login.jsx';
import home from './app/pages/home/home.jsx';
import Pessoas from './app/pages/cadastros/pessoas/pessoas.jsx';
import QntdAcessoPessoas from './app/pages/dados/qntdAcessoPessoas/qntdAcessosPessoas.jsx'
import AcessoPessoaPeriodo from './app/pages/dados/acessoPeriodo/acessosPeriodo.jsx'

import Sorteio from './app/pages/sorteio/sorteio.jsx';
import Eventos from './app/pages/cadastros/eventos/eventos.jsx';
import MensagensCadastro from './app/pages/mensagens/cadastro/cadastro.jsx';
import MensagensDisparo from './app/pages/mensagens/disparo/disparo.jsx';
import MensagensAgendamento from './app/pages/mensagens/agendamento/agendamento.jsx';
import TicketsLista from './app/pages/atendimento/tickets/tickets.jsx';
import TicketChat from './app/pages/atendimento/chat/chat.jsx';
import Setores from './app/pages/cadastros/setores/setores.jsx';
import Usuarios from './app/pages/cadastros/usuarios/usuarios.jsx';
import MenuBot from './app/pages/cadastros/menuBot/MenuBot.jsx';
import ConfigHorarios from './app/pages/config/ConfigHorarios.jsx';
import MetaAnalytics from './app/pages/dados/metaAnalytics/metaAnalytics.jsx';
/*Soluções*/

function decryptData(encryptedData) {
  if (!encryptedData) return "";
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData.toString(), 'Alysson-2025-IACBURITAMA');
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (e) {
    return "";
  }
}

// Lógica para restaurar sessão do "Mantenha-me conectado"
const expiracaoCripto = localStorage.getItem('expiracao');
if (expiracaoCripto) {
  const expiracaoRaw = decryptData(expiracaoCripto);
  if (expiracaoRaw && new Date().getTime() < parseInt(expiracaoRaw)) {
    // Sessão ainda é válida, restaura para o sessionStorage se estiver vazio
    if (!sessionStorage.getItem('logado')) {
      const chaves = ['logado', 'nome_usuario', 'id_usuario', 'permissoes', 'id_setor'];
      chaves.forEach(key => {
        const valor = localStorage.getItem(key);
        if (valor) sessionStorage.setItem(key, valor);
      });
    }
  } else {
    // Expirou, limpa o localStorage
    localStorage.clear();
  }
}

function App() {
  const { logado } = useContext(AuthContext);


  function SecureRoute({ ...params }) {
    if (!logado) {
      return <Redirect to='/' />
    }
    else {
      return <Route {...params} />
    }
  }

  function LoginRoute({ ...params }) {
    if (logado) {
      return <Redirect to='/app/home' />
    }
    else {
      return <Route {...params} />
    }
  }

  return <BrowserRouter>
    <Switch>
      <LoginRoute exact path='/' component={login} />
      <SecureRoute exact path='/app/home' component={home} />
      <SecureRoute exact path='/app/cadastros/pessoas' component={Pessoas} />
      <SecureRoute exact path='/app/cadastros/eventos' component={Eventos} />
      <SecureRoute exact path='/app/mensagens/cadastro' component={MensagensCadastro} />
      <SecureRoute exact path='/app/mensagens/disparo' component={MensagensDisparo} />
      <SecureRoute exact path='/app/mensagens/agendamento' component={MensagensAgendamento} />
      <SecureRoute exact path='/app/acessos/sorteio' component={Sorteio} />
      <SecureRoute exact path='/app/acessos/quantidade-acesso' component={QntdAcessoPessoas} />
      <SecureRoute exact path='/app/acessos/acesso-periodo' component={AcessoPessoaPeriodo} />

      <SecureRoute exact path='/app/atendimento/tickets' component={TicketsLista} />
      <SecureRoute exact path='/app/atendimento/chat' component={TicketChat} />
      <SecureRoute exact path='/app/cadastros/setores' component={Setores} />
      <SecureRoute exact path='/app/cadastros/usuarios' component={Usuarios} />
      <SecureRoute exact path='/app/cadastros/menu-bot' component={MenuBot} />
      <SecureRoute exact path='/app/configuracoes/horarios' component={ConfigHorarios} />
      <SecureRoute exact path='/app/dados/meta-analytics' component={MetaAnalytics} />

      <LoginRoute exact path='/*' component={login} />
    </Switch>
  </BrowserRouter>;
}

export default App;

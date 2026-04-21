import React, { useContext } from 'react';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import { AuthContext } from './app/Context/auth.jsx';

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
/*Soluções*/

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

  return <BrowserRouter>
    <Switch>
      <Route exact path='/' component={login} />
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

      <Route exact path='/*' component={login} />
    </Switch>
  </BrowserRouter>;
}

export default App;


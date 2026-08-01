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
import ConfigWhatsApp from './app/pages/config/ConfigWhatsApp.jsx';
import LinksPortal from './app/pages/cadastros/links/links.jsx';
import MetaAnalytics from './app/pages/dados/metaAnalytics/metaAnalytics.jsx';
import DashboardAcessos from './app/pages/dados/dashboardAcessos/dashboardAcessos.jsx';
import MembrosAusentes from './app/pages/dados/membrosAusentes/membrosAusentes.jsx';
import AcessosPorEvento from './app/pages/dados/acessosPorEvento/acessosPorEvento.jsx';
import MetricasAtendimento from './app/pages/atendimento/metricasAtendimento/metricasAtendimento.jsx';
import Igrejas from './app/pages/cadastros/igrejas/igrejas.jsx';
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
      const chaves = ['logado', 'nome_usuario', 'id_usuario', 'permissoes', 'id_setor', 'tipo_usuario', 'igreja_atual', 'igrejas_disponiveis'];
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

// IMPORTANTE: estes wrappers de rota ficam FORA do componente App (nível de módulo),
// não dentro dele. Declará-los dentro de App() faz o React recriar a "identidade" desses
// componentes a cada render de App, o que força desmontar/remontar toda a árvore da rota
// ativa (Home, Menu, etc.) sempre que o AuthContext mudar — e como o Menu atualiza o
// contexto ao buscar as igrejas, isso virava um loop infinito de remontagem.
function SecureRoute({ ...params }) {
  const { logado } = useContext(AuthContext);
  if (!logado) {
    return <Redirect to='/' />
  }
  else {
    return <Route {...params} />
  }
}

function LoginRoute({ ...params }) {
  const { logado } = useContext(AuthContext);
  if (logado) {
    return <Redirect to='/app/home' />
  }
  else {
    return <Route {...params} />
  }
}

// Rota de gestão de igrejas: exclusiva do usuário SISTEMA (criar/editar/desativar igreja).
// Administrador não entra aqui — o vínculo de usuário a igreja pra ele acontece pela tela de
// Usuários (usuarios.jsx), restrito à(s) igreja(s) que ele administra.
// Isso é só uma conveniência de UX (evita renderizar a tela pra quem não devia ver);
// a barreira de verdade é o backend, que rejeita (403) quem não é Sistema.
function SistemaRoute({ ...params }) {
  const { logado, tipoUsuario } = useContext(AuthContext);
  if (!logado) {
    return <Redirect to='/' />
  }
  else if (tipoUsuario !== 'SISTEMA') {
    return <Redirect to='/app/home' />
  }
  else {
    return <Route {...params} />
  }
}

function App() {
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
      <SistemaRoute exact path='/app/cadastros/igrejas' component={Igrejas} />
      <SecureRoute exact path='/app/cadastros/menu-bot' component={MenuBot} />
      <SecureRoute exact path='/app/configuracoes/horarios' component={ConfigHorarios} />
      <SecureRoute exact path='/app/configuracoes/whatsapp' component={ConfigWhatsApp} />
      <SecureRoute exact path='/app/cadastros/links' component={LinksPortal} />
      <SecureRoute exact path='/app/dados/meta-analytics' component={MetaAnalytics} />
      <SecureRoute exact path='/app/dados/dashboard-acessos' component={DashboardAcessos} />
      <SecureRoute exact path='/app/dados/membros-ausentes' component={MembrosAusentes} />
      <SecureRoute exact path='/app/dados/acessos-por-evento' component={AcessosPorEvento} />
      <SecureRoute exact path='/app/atendimento/metricas' component={MetricasAtendimento} />

      <LoginRoute exact path='/*' component={login} />
    </Switch>
  </BrowserRouter>;
}

export default App;

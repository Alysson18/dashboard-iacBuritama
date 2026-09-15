import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './site.css';

function Site() {
    const [menuAberto, setMenuAberto] = useState(false);

    function enviarContato(event) {
        event.preventDefault();
        const nome = document.getElementById('ctName').value.trim();
        const igreja = document.getElementById('ctChurch').value.trim();
        const whats = document.getElementById('ctPhone').value.trim();
        const email = document.getElementById('ctEmail').value.trim();
        const msg = document.getElementById('ctMsg').value.trim();

        const corpo = 'Igreja: ' + igreja + '\nWhatsApp: ' + whats +
            (email ? ('\nE-mail: ' + email) : '') + '\n\n' + msg;
        const link = 'mailto:contato@softwareplus.com.br' +
            '?subject=' + encodeURIComponent('Contato Wi-Fé · ' + igreja) +
            '&body=' + encodeURIComponent(corpo + '\n\n— ' + nome);
        window.location.href = link;
    }

    return (
        <div className="site-page">
            <nav className={'site-nav' + (menuAberto ? ' open' : '')}>
                <div className="nav-inner">
                    <a className="brand-link wordmark" href="#top">
                        Wi<span className="bars" aria-hidden="true"><i></i><i></i><i></i></span>Fé
                    </a>
                    <button
                        type="button"
                        className="nav-toggle"
                        aria-label="Abrir menu"
                        aria-expanded={menuAberto}
                        onClick={() => setMenuAberto(!menuAberto)}
                    >
                        <span></span><span></span><span></span>
                    </button>
                    <div className="nav-links">
                        <a href="#domingo" onClick={() => setMenuAberto(false)}>Como funciona</a>
                        <a href="#recursos" onClick={() => setMenuAberto(false)}>Recursos</a>
                        <a href="#planos" onClick={() => setMenuAberto(false)}>Planos</a>
                        <a href="#contato" onClick={() => setMenuAberto(false)}>Contato</a>
                    </div>
                    <Link className="nav-cta" to="/login">Acessar o sistema</Link>
                </div>
            </nav>

            <main>
                <section className="hero" id="top">
                    <div className="wrap hero-inner">
                        <div className="hero-copy">
                            <h1>O Wi-Fi da igreja agora conhece o nome de quem entra.</h1>
                            <p className="lede">A pessoa conecta, digita o número do WhatsApp, e pronto: já está
                                no seu sistema. Sem senha, sem fila na recepção, sem planilha depois do culto.</p>
                            <div className="hero-actions">
                                <Link className="btn btn-solid" to="/login">Acessar o sistema</Link>
                                <a className="btn btn-line" href="#planos">Ver os planos</a>
                            </div>
                        </div>
                        <div className="phone" aria-hidden="true">
                            <div className="phone-screen">
                                <div className="phone-status">
                                    <span className="time">10:42</span>
                                    <span className="bars"><i></i><i></i><i></i></span>
                                </div>
                                <h3>Bem-vindo(a) à igreja</h3>
                                <p className="hint">Digite seu WhatsApp para continuar</p>
                                <div className="phone-input">
                                    (18) 9 9999-9999<span className="cursor blink"></span>
                                </div>
                                <div className="phone-btn">Entrar</div>
                                <div className="phone-note"><span className="dot"></span>Rede da igreja conectada</div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="how" id="domingo">
                    <div className="wrap">
                        <div className="section-head"><h2>O que muda no domingo</h2></div>
                        <div className="rowlist">
                            <div className="rowlist-item">
                                <span className="label">Primeiro</span>
                                <p className="desc">A pessoa entra na igreja e o celular já mostra a tela de
                                    conexão, sem precisar procurar rede nem senha no mural.</p>
                            </div>
                            <div className="rowlist-item">
                                <span className="label">Em seguida</span>
                                <p className="desc">Ela digita o nome e o WhatsApp. Não precisa senha, não precisa
                                    instalar nada.</p>
                            </div>
                            <div className="rowlist-item">
                                <span className="label">Por fim</span>
                                <p className="desc">Ela já está no sistema — pronta pra receber mensagem, ser
                                    lembrada no aniversário e contar nos relatórios de presença.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="features" id="recursos">
                    <div className="wrap">
                        <div className="section-head"><h2>O que o Wi-Fé faz pela sua igreja</h2></div>
                        <div className="rowlist">
                            <div className="rowlist-item">
                                <span className="label">Check-in pelo Wi-Fi</span>
                                <p className="desc">A pessoa conecta, digita o número, e já está cadastrada. Sem
                                    fila, sem papel na recepção.</p>
                            </div>
                            <div className="rowlist-item">
                                <span className="label">Membros e visitantes</span>
                                <p className="desc">Um registro por pessoa, com histórico de presença e o que ela
                                    é: membro ou visitante.</p>
                            </div>
                            <div className="rowlist-item">
                                <span className="label">Mensagens no WhatsApp</span>
                                <p className="desc">Disparo, agendamento e um menu de atendimento — sem digitar
                                    mensagem pessoa por pessoa.</p>
                            </div>
                            <div className="rowlist-item">
                                <span className="label">Painéis e relatórios</span>
                                <p className="desc">Presença por culto, aniversariantes do mês, quem sumiu — tudo
                                    pronto pra exportar em PDF.</p>
                            </div>
                            <div className="rowlist-item">
                                <span className="label">Várias igrejas, um painel</span>
                                <p className="desc">Sede e congregações no mesmo sistema, cada uma com os próprios
                                    dados, separados.</p>
                            </div>
                            <div className="rowlist-item">
                                <span className="label">Atendimento da equipe</span>
                                <p className="desc">Fila de conversas e métricas pra quem responde as mensagens da
                                    igreja no WhatsApp.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="preview">
                    <div className="wrap preview-inner">
                        <div className="preview-copy">
                            <div className="section-head"><h2>Um retrato do culto, sem precisar perguntar</h2></div>
                            <p>Cadastros, presença e a proporção entre membros e visitantes — sempre à vista de
                                quem cuida da congregação, prontos pra levar pra reunião de liderança.</p>
                        </div>
                        <div className="browserframe">
                            <div className="browserbar">
                                <div className="dots"><i></i><i></i><i></i></div>
                                <span className="browser-url">app.wife.com.br/resumo-cadastros</span>
                            </div>
                            <div className="panel">
                                <div className="panel-head">
                                    <strong>Resumo de Cadastros</strong>
                                    <span>dados de exemplo</span>
                                </div>
                                <div className="tiles">
                                    <div className="tile"><span className="num">1.284</span><span className="lbl">Cadastros</span></div>
                                    <div className="tile"><span className="num">812</span><span className="lbl">Membros</span></div>
                                    <div className="tile"><span className="num">472</span><span className="lbl">Visitantes</span></div>
                                    <div className="tile"><span className="num">96</span><span className="lbl">Check-ins hoje</span></div>
                                </div>
                                <div className="panel-bottom">
                                    <div className="donut" role="img" aria-label="63% membros, 37% visitantes"></div>
                                    <div className="legend">
                                        <span><i style={{ background: 'var(--site-accent)' }}></i>Membros · 63%</span>
                                        <span><i style={{ background: 'var(--site-gold)' }}></i>Visitantes · 37%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="pricing" id="planos">
                    <div className="wrap">
                        <div className="section-head"><h2>Um plano do tamanho da sua igreja</h2></div>
                        <p className="section-sub">Valores de referência — a proposta final é sempre combinada
                            com você.</p>
                        <div className="tickets">
                            <div className="ticket">
                                <div className="ticket-head">
                                    <div className="name">Básico</div>
                                    <p className="tag">Pra começar a receber visitante com o pé direito</p>
                                    <div className="price">R$79<small>/mês</small></div>
                                    <p className="per">por igreja, cobrança mensal</p>
                                </div>
                                <div className="perf"></div>
                                <div className="ticket-body">
                                    <p>Check-in pelo Wi-Fi ilimitado</p>
                                    <p>Cadastro de membros e visitantes</p>
                                    <p>Painel de acessos e presença</p>
                                    <p>Aniversariantes do mês</p>
                                    <p>1 usuário administrador</p>
                                </div>
                                <div className="ticket-foot"><a className="btn btn-line" href="#contato">Falar com a gente</a></div>
                            </div>

                            <div className="ticket featured">
                                <div className="ticket-head">
                                    <div className="name">Completo</div>
                                    <p className="tag">O mais escolhido entre as igrejas</p>
                                    <div className="price">R$150<small>/mês</small></div>
                                    <p className="per">por igreja, cobrança mensal</p>
                                </div>
                                <div className="perf"></div>
                                <div className="ticket-body">
                                    <p>Tudo do plano Básico</p>
                                    <p>Mensagens automáticas e agendadas no WhatsApp</p>
                                    <p>Menu de atendimento e fila de conversas da equipe</p>
                                    <p>Relatórios completos: eventos, ausentes, resumo de cadastros, sorteios</p>
                                    <p>Usuários ilimitados, com permissão por setor</p>
                                </div>
                                <div className="ticket-foot"><a className="btn btn-solid" href="#contato">Falar com a gente</a></div>
                            </div>

                            <div className="ticket">
                                <div className="ticket-head">
                                    <div className="name">Rede de Igrejas</div>
                                    <p className="tag">Pra sede com mais de uma congregação</p>
                                    <div className="price">Sob consulta</div>
                                    <p className="per">proposta conforme número de unidades</p>
                                </div>
                                <div className="perf"></div>
                                <div className="ticket-body">
                                    <p>Tudo do plano Completo</p>
                                    <p>Várias igrejas no mesmo painel, com dados separados</p>
                                    <p>Comparação de presença entre as unidades</p>
                                    <p>Implantação acompanhada pela nossa equipe</p>
                                </div>
                                <div className="ticket-foot"><a className="btn btn-line" href="#contato">Falar com a gente</a></div>
                            </div>
                        </div>
                        <p className="pricing-note">Já usa o Wi-Fé? O acesso ao sistema continua o mesmo — <Link to="/login">entre por aqui</Link>.</p>
                    </div>
                </section>

                <section id="contato">
                    <div className="wrap">
                        <div className="section-head"><h2>Vamos conversar sobre a sua igreja?</h2></div>
                        <div className="contact-inner">
                            <div className="contact-copy">
                                <p>Conta pra gente o tamanho da sua congregação e como funciona o Wi-Fi de vocês
                                    hoje — a implantação é feita junto com o time da Software Plus.</p>
                                <div className="contact-list">
                                    <a href="mailto:contato@softwareplus.com.br">contato@softwareplus.com.br</a>
                                    <a href="https://softwareplus.com.br" target="_blank" rel="noopener noreferrer">softwareplus.com.br</a>
                                </div>
                            </div>
                            <form onSubmit={enviarContato}>
                                <div className="form-row">
                                    <div className="field">
                                        <label htmlFor="ctName">Seu nome</label>
                                        <input id="ctName" name="ctName" type="text" required autoComplete="name" />
                                    </div>
                                    <div className="field">
                                        <label htmlFor="ctChurch">Igreja</label>
                                        <input id="ctChurch" name="ctChurch" type="text" required autoComplete="organization" />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="field">
                                        <label htmlFor="ctPhone">WhatsApp</label>
                                        <input id="ctPhone" name="ctPhone" type="tel" required autoComplete="tel" />
                                    </div>
                                    <div className="field">
                                        <label htmlFor="ctEmail">E-mail</label>
                                        <input id="ctEmail" name="ctEmail" type="email" autoComplete="email" />
                                    </div>
                                </div>
                                <div className="field">
                                    <label htmlFor="ctMsg">Mensagem</label>
                                    <textarea id="ctMsg" name="ctMsg" placeholder="Quantas pessoas passam pela igreja num culto?"></textarea>
                                </div>
                                <button type="submit" className="btn btn-solid" style={{ width: '100%', justifyContent: 'center' }}>Enviar mensagem</button>
                                <p className="form-note">Abre seu e-mail com a mensagem pronta para contato@softwareplus.com.br.</p>
                            </form>
                        </div>
                    </div>
                </section>
            </main>

            <footer>
                <div className="footer-inner">
                    <a className="wordmark" href="#top" style={{ textDecoration: 'none', color: 'var(--site-brand-ink)', fontSize: '16px', fontWeight: 700 }}>
                        Wi<span className="bars" aria-hidden="true"><i></i><i></i><i></i></span>Fé
                    </a>
                    <nav>
                        <a href="#domingo">Como funciona</a>
                        <a href="#recursos">Recursos</a>
                        <a href="#planos">Planos</a>
                        <a href="#contato">Contato</a>
                        <Link to="/login">Acessar o sistema</Link>
                    </nav>
                    <span className="fine">&copy; 2026 Wi-Fé · desenvolvido por <a href="https://softwareplus.com.br" target="_blank" rel="noopener noreferrer">Software Plus</a></span>
                </div>
            </footer>
        </div>
    );
}

export default Site;

import React, { useState, useEffect } from 'react';
import NavBar from '../../../components/menu.jsx';
import api from '../../../config/api.js';
import Loading from '../../../components/loading/loading.js';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

import { Bar } from 'react-chartjs-2';

function AcessosPorEvento() {
    ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

    const [eventos, setEventos] = useState([]);
    const [idsSelecionados, setIdsSelecionados] = useState([]);
    const [detalhes, setDetalhes] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            Loading.show('Aguarde....');
            try {
                const res = await api.get('/eventos/acessos');
                if (res.data.SUCCESS) {
                    setEventos(res.data.DATA || []);
                } else {
                    toastr.error(res.data.MESSAGE || 'Erro ao buscar dados.');
                }
            } catch (error) {
                toastr.error('Erro na comunicação com o servidor.');
            } finally {
                Loading.hide();
            }
        };
        fetchData();
    }, []);

    // Filtro é por evento: nada de detalhe aparece até escolher pelo menos um. Escolhendo
    // mais de um, os dados de cada evento vêm lado a lado pra comparação.
    useEffect(() => {
        if (idsSelecionados.length === 0) {
            setDetalhes([]);
            return;
        }
        const fetchDetalhes = async () => {
            Loading.show('Aguarde....');
            try {
                const respostas = await Promise.all(
                    idsSelecionados.map((id) => api.get(`/eventos/${id}/acessos`))
                );
                const validos = [];
                respostas.forEach((res, idx) => {
                    if (res.data.SUCCESS) {
                        validos.push(res.data.DATA);
                    } else {
                        toastr.error(`${res.data.MESSAGE || 'Erro ao buscar evento'} (evento ${idsSelecionados[idx]})`);
                    }
                });
                // Mantém a ordem em que os eventos aparecem na lista (mais recente primeiro),
                // não a ordem em que foram clicados.
                validos.sort((a, b) => (a.EVENTO.DATA < b.EVENTO.DATA ? 1 : -1));
                setDetalhes(validos);
            } catch (error) {
                toastr.error('Erro na comunicação com o servidor.');
            } finally {
                Loading.hide();
            }
        };
        fetchDetalhes();
    }, [idsSelecionados]);

    const alternarEvento = (id) => {
        setIdsSelecionados((atual) =>
            atual.includes(id) ? atual.filter((x) => x !== id) : [...atual, id]
        );
    };

    const dataComparacao = {
        labels: detalhes.map((d) => d.EVENTO.NOME_EVENTO),
        datasets: [
            { label: 'Membros', data: detalhes.map((d) => d.TOTAL_MEMBROS), backgroundColor: '#4e73df' },
            { label: 'Visitantes', data: detalhes.map((d) => d.TOTAL_VISITANTES), backgroundColor: '#36b9cc' },
        ]
    };

    function exportarPDF() {
        if (detalhes.length === 0) {
            toastr.warning('Selecione ao menos um evento!', 'Atenção');
            return;
        }

        const doc = new jsPDF('p', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();
        const margem = 15;

        const rodape = () => {
            const pageNumber = doc.internal.getNumberOfPages();
            doc.setFontSize(8);
            doc.setTextColor(120);
            doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')} - Página ${pageNumber}`, pageWidth / 2, 290, { align: 'center' });
            doc.setTextColor(0);
        };

        doc.setFontSize(14);
        doc.text(detalhes.length > 1 ? 'Comparativo de Acessos por Evento' : 'Relatório de Acessos do Evento', pageWidth / 2, 15, { align: 'center' });
        doc.line(margem, 20, pageWidth - margem, 20);

        // Tabela-resumo comparando todos os eventos escolhidos
        autoTable(doc, {
            startY: 26,
            head: [['Evento', 'Data', 'Total', 'Membros', 'Visitantes', 'Novos', 'Existentes']],
            body: detalhes.map((d) => ([
                d.EVENTO.NOME_EVENTO, d.EVENTO.DATA_FORMATADA, d.TOTAL,
                d.TOTAL_MEMBROS, d.TOTAL_VISITANTES, d.TOTAL_NOVOS, d.TOTAL_EXISTENTES,
            ])),
            styles: { fontSize: 8, cellPadding: 1.5 },
            headStyles: { fillColor: [44, 62, 80], textColor: [255, 255, 255], halign: 'center' },
            columnStyles: { 2: { halign: 'center' }, 3: { halign: 'center' }, 4: { halign: 'center' }, 5: { halign: 'center' }, 6: { halign: 'center' } },
            didDrawPage: rodape,
        });

        // Detalhe (cards + listas separadas de membros/visitantes) de cada evento, um por página
        detalhes.forEach((detalhe) => {
            doc.addPage();
            const membros = (detalhe.PESSOAS || []).filter((p) => p.MEMBRO === 'S');
            const visitantes = (detalhe.PESSOAS || []).filter((p) => p.MEMBRO !== 'S');

            doc.setFontSize(13);
            doc.text(detalhe.EVENTO.NOME_EVENTO, pageWidth / 2, 15, { align: 'center' });
            doc.setFontSize(9);
            doc.setTextColor(120);
            doc.text(`Data do evento: ${detalhe.EVENTO.DATA_FORMATADA}`, pageWidth / 2, 21, { align: 'center' });
            doc.setTextColor(0);

            const cards = [
                { titulo: 'Total', valor: detalhe.TOTAL, cor: [36, 52, 92] },
                { titulo: 'Membros', valor: detalhe.TOTAL_MEMBROS, cor: [78, 115, 223] },
                { titulo: 'Visitantes', valor: detalhe.TOTAL_VISITANTES, cor: [54, 185, 204] },
                { titulo: 'Cad. Novos', valor: detalhe.TOTAL_NOVOS, cor: [28, 200, 138] },
                { titulo: 'Cad. Existentes', valor: detalhe.TOTAL_EXISTENTES, cor: [133, 135, 150] },
            ];
            const larguraTotal = pageWidth - margem * 2;
            const espaco = 3;
            const larguraCard = (larguraTotal - espaco * (cards.length - 1)) / cards.length;
            const alturaCard = 20;
            const topoCards = 27;

            cards.forEach((card, i) => {
                const x = margem + i * (larguraCard + espaco);
                doc.setFillColor(card.cor[0], card.cor[1], card.cor[2]);
                doc.roundedRect(x, topoCards, larguraCard, alturaCard, 2, 2, 'F');
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(7);
                doc.text(card.titulo.toUpperCase(), x + larguraCard / 2, topoCards + 7, { align: 'center' });
                doc.setFontSize(13);
                doc.text(String(card.valor), x + larguraCard / 2, topoCards + 16, { align: 'center' });
            });
            doc.setTextColor(0);

            let proximoY = topoCards + alturaCard + 8;
            const colunas = [['Nome', 'Telefone', 'Cadastro', 'Data do Cadastro', 'Acessos']];
            const linhas = (pessoas) => pessoas.map((p) => ([
                p.NOME, p.TELEFONE || '-', p.CADASTRO === 'NOVO' ? 'Novo' : 'Existente', p.DATA_CADASTRO || '-', p.ACESSOS,
            ]));

            const secao = (titulo, pessoas, cor) => {
                doc.setFontSize(10);
                doc.text(`${titulo} (${pessoas.length})`, margem, proximoY);
                if (pessoas.length === 0) {
                    doc.setFontSize(8);
                    doc.setTextColor(120);
                    doc.text('Nenhum acesso nesta categoria.', margem, proximoY + 5);
                    doc.setTextColor(0);
                    proximoY += 12;
                    return;
                }
                autoTable(doc, {
                    startY: proximoY + 3,
                    head: colunas,
                    body: linhas(pessoas),
                    styles: { fontSize: 8, cellPadding: 1.5 },
                    headStyles: { fillColor: cor, textColor: [255, 255, 255], halign: 'center' },
                    columnStyles: { 2: { halign: 'center' }, 3: { halign: 'center' }, 4: { halign: 'center' } },
                    didDrawPage: rodape,
                });
                proximoY = doc.lastAutoTable.finalY + 10;
            };

            secao('Membros', membros, [78, 115, 223]);
            secao('Visitantes', visitantes, [54, 185, 204]);
        });

        rodape();
        doc.save(detalhes.length > 1 ? 'comparativo_acessos_eventos.pdf' : `acessos_evento_${detalhes[0].EVENTO.ID_EVENTOS}.pdf`);
    }

    const tabelaPessoas = (titulo, pessoas, classeBadge) => (
        <div className="mb-4">
            <h6 className="fw-bold mb-2" style={{ fontSize: '13px' }}>
                {titulo} <span className={`badge ${classeBadge}`}>{pessoas.length}</span>
            </h6>
            <table className="table table-responsive table-sm table-striped w-100">
                <thead>
                    <tr className="tabela">
                        <th scope="col">Nome</th>
                        <th scope="col">Telefone</th>
                        <th scope="col">Cadastro</th>
                        <th scope="col">Data do Cadastro</th>
                        <th scope="col">Acessos</th>
                    </tr>
                </thead>
                <tbody className="text-center">
                    {pessoas.length > 0 ? pessoas.map((p, idx) => (
                        <tr key={idx}>
                            <td>{p.NOME}</td>
                            <td>{p.TELEFONE || '-'}</td>
                            <td>
                                <span className={`badge ${p.CADASTRO === 'NOVO' ? 'bg-success' : 'bg-secondary'}`}>
                                    {p.CADASTRO === 'NOVO' ? 'Novo' : 'Existente'}
                                </span>
                            </td>
                            <td>{p.DATA_CADASTRO || '-'}</td>
                            <td>{p.ACESSOS}</td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan="5" className="text-center text-muted">Nenhum acesso nesta categoria</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );

    const conteudoHtml = (
        <div className="container mb-5">
            <div className="text-center mb-3">
                <h3 className="tituloD mb-1">Acessos por Evento</h3>
                <p className="text-muted" style={{ fontSize: '12px' }}>
                    Escolha um ou mais eventos para ver quem acessou (membros e visitantes,
                    separados) e comparar os números entre eles.
                </p>
            </div>

            <div className="row mb-3 justify-content-center">
                <div className="col-md-8 mb-2">
                    <div className="border rounded shadow-sm p-2" style={{ maxHeight: '160px', overflowY: 'auto' }}>
                        {eventos.length === 0 ? (
                            <p className="text-muted text-center mb-0" style={{ fontSize: '12px' }}>Nenhum evento cadastrado.</p>
                        ) : eventos.map((e) => (
                            <div className="form-check" key={e.ID_EVENTOS}>
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    checked={idsSelecionados.includes(e.ID_EVENTOS)}
                                    onChange={() => alternarEvento(e.ID_EVENTOS)}
                                    id={`evento_${e.ID_EVENTOS}`}
                                />
                                <label className="form-check-label" htmlFor={`evento_${e.ID_EVENTOS}`} style={{ fontSize: '13px' }}>
                                    {e.NOME_EVENTO} <span className="text-muted">- {e.DATA_FORMATADA}</span>
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="col-md-2 mb-2">
                    <button onClick={() => exportarPDF()}
                        className="btn btn-outline-danger btn-sm w-100" type="button"
                        disabled={detalhes.length === 0}>
                        <i className="bi bi-file-earmark-pdf me-1"></i>Exportar PDF
                    </button>
                </div>
            </div>

            {idsSelecionados.length === 0 && (
                <p className="text-center text-muted mt-4" style={{ fontSize: '13px' }}>
                    Selecione ao menos um evento acima para ver os dados de acesso.
                </p>
            )}

            {detalhes.length > 0 && (
                <div className="container-fluid px-3">
                    {detalhes.length > 1 && (
                        <div className="row mb-4">
                            <div className="col-md-12">
                                <div className="card shadow-sm p-2" style={{ borderRadius: '8px' }}>
                                    <h6 className="fw-bold mb-2 text-center" style={{ fontSize: '13px' }}>Comparativo entre Eventos</h6>
                                    <div style={{ height: '280px' }}>
                                        <Bar data={dataComparacao}
                                            options={{ maintainAspectRatio: false, scales: { y: { beginAtZero: true, ticks: { font: { size: 10 } } }, x: { ticks: { font: { size: 9 } } } } }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {detalhes.length > 1 && (
                        <div className="row mb-4">
                            <div className="col-md-12">
                                <table className="table table-responsive table-sm table-striped w-100">
                                    <thead>
                                        <tr className="tabela">
                                            <th scope="col">Evento</th>
                                            <th scope="col">Data</th>
                                            <th scope="col">Total</th>
                                            <th scope="col">Membros</th>
                                            <th scope="col">Visitantes</th>
                                            <th scope="col">Novos</th>
                                            <th scope="col">Existentes</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-center">
                                        {detalhes.map((d) => (
                                            <tr key={d.EVENTO.ID_EVENTOS}>
                                                <td>{d.EVENTO.NOME_EVENTO}</td>
                                                <td>{d.EVENTO.DATA_FORMATADA}</td>
                                                <td>{d.TOTAL}</td>
                                                <td>{d.TOTAL_MEMBROS}</td>
                                                <td>{d.TOTAL_VISITANTES}</td>
                                                <td>{d.TOTAL_NOVOS}</td>
                                                <td>{d.TOTAL_EXISTENTES}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {detalhes.map((detalhe) => {
                        const membros = (detalhe.PESSOAS || []).filter((p) => p.MEMBRO === 'S');
                        const visitantes = (detalhe.PESSOAS || []).filter((p) => p.MEMBRO !== 'S');
                        return (
                            <div key={detalhe.EVENTO.ID_EVENTOS} className="mb-5">
                                <div className="border-top pt-3 mb-3">
                                    <h5 className="tituloD mb-1">{detalhe.EVENTO.NOME_EVENTO}</h5>
                                    <p className="text-muted mb-3" style={{ fontSize: '12px' }}>Evento em {detalhe.EVENTO.DATA_FORMATADA}</p>
                                </div>

                                <div className="row mb-4 text-center gx-2">
                                    <div className="col-md-2 col-4 mb-2">
                                        <div className="card shadow-sm p-2 h-100" style={{ borderLeft: '5px solid #24345c' }}>
                                            <span className="text-uppercase fw-bold" style={{ fontSize: '10px', color: '#24345c' }}>Total</span>
                                            <h5 className="fw-bold mb-0">{detalhe.TOTAL}</h5>
                                        </div>
                                    </div>
                                    <div className="col-md-2 col-4 mb-2">
                                        <div className="card shadow-sm p-2 h-100" style={{ borderLeft: '5px solid #4e73df' }}>
                                            <span className="text-primary text-uppercase fw-bold" style={{ fontSize: '10px' }}>Membros</span>
                                            <h5 className="fw-bold mb-0">{detalhe.TOTAL_MEMBROS}</h5>
                                        </div>
                                    </div>
                                    <div className="col-md-2 col-4 mb-2">
                                        <div className="card shadow-sm p-2 h-100" style={{ borderLeft: '5px solid #36b9cc' }}>
                                            <span className="text-info text-uppercase fw-bold" style={{ fontSize: '10px' }}>Visitantes</span>
                                            <h5 className="fw-bold mb-0">{detalhe.TOTAL_VISITANTES}</h5>
                                        </div>
                                    </div>
                                    <div className="col-md-2 col-4 mb-2">
                                        <div className="card shadow-sm p-2 h-100" style={{ borderLeft: '5px solid #1cc88a' }}>
                                            <span className="text-success text-uppercase fw-bold" style={{ fontSize: '10px' }}>Cad. Novos</span>
                                            <h5 className="fw-bold mb-0">{detalhe.TOTAL_NOVOS}</h5>
                                        </div>
                                    </div>
                                    <div className="col-md-2 col-4 mb-2">
                                        <div className="card shadow-sm p-2 h-100" style={{ borderLeft: '5px solid #858796' }}>
                                            <span className="text-uppercase fw-bold" style={{ fontSize: '10px', color: '#858796' }}>Cad. Existentes</span>
                                            <h5 className="fw-bold mb-0">{detalhe.TOTAL_EXISTENTES}</h5>
                                        </div>
                                    </div>
                                    <div className="col-md-2 col-4 mb-2">
                                        <div className="card shadow-sm p-2 h-100" style={{ borderLeft: '5px solid #f6c23e' }}>
                                            <span className="text-uppercase fw-bold" style={{ fontSize: '10px', color: '#b98b17' }}>Check-ins</span>
                                            <h5 className="fw-bold mb-0">{detalhe.TOTAL_ACESSOS}</h5>
                                            <small className="text-muted" style={{ fontSize: '9px' }}>inclui reconexões</small>
                                        </div>
                                    </div>
                                </div>

                                {tabelaPessoas('Membros', membros, 'bg-primary')}
                                {tabelaPessoas('Visitantes', visitantes, 'bg-info')}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );

    return <NavBar conteudo={conteudoHtml} />;
}

export default AcessosPorEvento;

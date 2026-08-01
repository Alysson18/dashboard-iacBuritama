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

    // Gráfico mostra do mais antigo pro mais recente (leitura da esquerda pra direita);
    // a tabela abaixo mantém do mais recente primeiro (o que a API já devolve).
    const eventosOrdemGrafico = [...eventos].reverse();

    const dataEventos = {
        labels: eventosOrdemGrafico.map(e => e.NOME_EVENTO),
        datasets: [{
            label: 'Acessos',
            data: eventosOrdemGrafico.map(e => e.ACESSOS),
            backgroundColor: '#4e73df',
        }]
    };

    function exportarPDF() {
        if (eventos.length === 0) {
            toastr.warning('Sem dados para gerar PDF!', 'Atenção');
            return;
        }

        const doc = new jsPDF('p', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();

        doc.setFontSize(14);
        doc.text('Acessos por Evento', pageWidth / 2, 15, { align: 'center' });
        doc.setFontSize(10);
        doc.text(`Últimos ${eventos.length} eventos cadastrados`, 15, 23);
        doc.line(15, 27, pageWidth - 15, 27);

        autoTable(doc, {
            startY: 32,
            head: [['Evento', 'Data', 'Acessos no Dia']],
            body: eventos.map((e) => ([e.NOME_EVENTO, e.DATA_FORMATADA, e.ACESSOS])),
            styles: { fontSize: 8, cellPadding: 1.5 },
            headStyles: { fillColor: [44, 62, 80], textColor: [255, 255, 255], halign: 'center' },
            didDrawPage: () => {
                const pageNumber = doc.internal.getNumberOfPages();
                doc.setFontSize(8);
                doc.setTextColor(120);
                doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')} - Página ${pageNumber}`, pageWidth / 2, 290, { align: 'center' });
            }
        });

        doc.save('acessos_por_evento.pdf');
    }

    const conteudoHtml = (
        <div className="container mb-5">
            <div className="text-center mb-3">
                <h3 className="tituloD mb-1">Acessos por Evento</h3>
                <p className="text-muted" style={{ fontSize: '12px' }}>
                    Compara, pra cada evento cadastrado, quantos acessos (check-in normal) aconteceram no dia do evento.
                </p>
            </div>

            <div className="row mb-3 justify-content-end">
                <div className="col-md-2 mb-2">
                    <button onClick={() => exportarPDF()}
                        className="btn btn-outline-danger btn-sm w-100" type="button">
                        <i className="bi bi-file-earmark-pdf me-1"></i>Exportar PDF
                    </button>
                </div>
            </div>

            {eventos.length > 0 && (
                <div className="container-fluid px-3">
                    <div className="row mb-3">
                        <div className="col-md-12 mb-2">
                            <div className="card shadow-sm p-2" style={{ borderRadius: '8px' }}>
                                <div style={{ height: '280px' }}>
                                    <Bar data={dataEventos}
                                        options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { font: { size: 10 } } }, x: { ticks: { font: { size: 9 } } } } }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-12">
                            <table className="table table-responsive table-sm table-striped w-100">
                                <thead>
                                    <tr className="tabela">
                                        <th scope="col">Evento</th>
                                        <th scope="col">Data</th>
                                        <th scope="col">Acessos no Dia</th>
                                    </tr>
                                </thead>
                                <tbody className="text-center">
                                    {eventos.map((e) => (
                                        <tr key={e.ID_EVENTOS}>
                                            <td>{e.NOME_EVENTO}</td>
                                            <td>{e.DATA_FORMATADA}</td>
                                            <td>{e.ACESSOS}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    return <NavBar conteudo={conteudoHtml} />;
}

export default AcessosPorEvento;

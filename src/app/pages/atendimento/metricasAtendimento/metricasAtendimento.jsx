import React, { useState, useEffect } from 'react';
import NavBar from '../../../components/menu.jsx';
import api from '../../../config/api.js';
import Loading from '../../../components/loading/loading.js';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

import { Bar, Doughnut } from 'react-chartjs-2';

function MetricasAtendimento() {
    ChartJS.register(CategoryScale, LinearScale, PointElement,
        LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

    const [dados, setDados] = useState(null);
    const [controle, setControle] = useState(0);

    useEffect(() => {
        const date = new Date();
        const primeiroDia = new Date(date.getFullYear(), date.getMonth(), 1);
        const formatarData = (d) => d.toISOString().split('T')[0];

        if (document.getElementById('inputDataInicial')) {
            document.getElementById('inputDataInicial').value = formatarData(primeiroDia);
            document.getElementById('inputDataFinal').value = formatarData(date);
        }
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            const dtIni = document.getElementById('inputDataInicial')?.value || '';
            const dtFim = document.getElementById('inputDataFinal')?.value || '';
            if (!dtIni || !dtFim) return;

            Loading.show('Aguarde....');
            try {
                const res = await api.get(`/tickets/metricas?dataInicial=${dtIni}&dataFinal=${dtFim}`);
                if (res.data.SUCCESS) {
                    setDados(res.data.DATA);
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
    }, [controle]);

    const porSetor = dados?.POR_SETOR || [];
    const porStatus = dados?.POR_STATUS || [];

    const formatarTempoResposta = (minutos) => {
        if (minutos === null || minutos === undefined) return '-';
        const min = Math.round(minutos);
        if (min < 60) return `${min} min`;
        const horas = Math.floor(min / 60);
        const resto = min % 60;
        return `${horas}h ${resto}min`;
    };

    const dataSetor = {
        labels: porSetor.map(s => s.SETOR),
        datasets: [{
            label: 'Tickets',
            data: porSetor.map(s => s.QTD),
            backgroundColor: '#4e73df',
        }]
    };

    const dataStatus = {
        labels: porStatus.map(s => s.STATUS),
        datasets: [{
            data: porStatus.map(s => s.QTD),
            backgroundColor: ['#f6c23e', '#36b9cc', '#1cc88a', '#e74a3b'],
        }]
    };

    const conteudoHtml = (
        <div className="container mb-5">
            <div className="text-center mb-3">
                <h3 className="tituloD mb-1">Métricas de Atendimento</h3>
            </div>

            <div className="row mb-3 justify-content-center">
                <div className="col-md-2 mb-2">
                    <input type="date" className="form-control form-control-sm shadow-sm" id="inputDataInicial" />
                </div>
                <div className="col-md-2 mb-2">
                    <input type="date" className="form-control form-control-sm shadow-sm" id="inputDataFinal" />
                </div>
                <div className="col-md-2 mb-2">
                    <button onClick={() => setControle(c => c + 1)}
                        className="btn btn-outline-secondary btn-sm w-100" type="button">
                        Consultar
                    </button>
                </div>
            </div>

            {dados && (
                <div className="container-fluid px-3">
                    <div className="row mb-3 text-center gx-3">
                        <div className="col-md-3 mb-2">
                            <div className="card shadow-sm p-3 h-100" style={{ borderLeft: '5px solid #4e73df' }}>
                                <span className="text-primary text-uppercase fw-bold" style={{ fontSize: '11px' }}>Total de Tickets</span>
                                <h5 className="fw-bold mb-0">{dados.TOTAL}</h5>
                            </div>
                        </div>
                        <div className="col-md-3 mb-2">
                            <div className="card shadow-sm p-3 h-100" style={{ borderLeft: '5px solid #e74a3b' }}>
                                <span className="text-danger text-uppercase fw-bold" style={{ fontSize: '11px' }}>Abertos</span>
                                <h5 className="fw-bold mb-0">{dados.ABERTOS}</h5>
                            </div>
                        </div>
                        <div className="col-md-3 mb-2">
                            <div className="card shadow-sm p-3 h-100" style={{ borderLeft: '5px solid #1cc88a' }}>
                                <span className="text-success text-uppercase fw-bold" style={{ fontSize: '11px' }}>Fechados</span>
                                <h5 className="fw-bold mb-0">{dados.FECHADOS}</h5>
                            </div>
                        </div>
                        <div className="col-md-3 mb-2">
                            <div className="card shadow-sm p-3 h-100" style={{ borderLeft: '5px solid #36b9cc' }}>
                                <span className="text-info text-uppercase fw-bold" style={{ fontSize: '11px' }}>Tempo Médio 1ª Resposta</span>
                                <h5 className="fw-bold mb-0">{formatarTempoResposta(dados.TEMPO_MEDIO_RESPOSTA_MINUTOS)}</h5>
                            </div>
                        </div>
                    </div>

                    <div className="row mb-3">
                        <div className="col-md-6 mb-2">
                            <div className="card shadow-sm p-2" style={{ borderRadius: '8px' }}>
                                <h6 className="fw-bold mb-2 text-center" style={{ fontSize: '13px' }}>Tickets por Status</h6>
                                <div style={{ height: '220px' }}>
                                    <Doughnut data={dataStatus}
                                        options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } } } }} />
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 mb-2">
                            <div className="card shadow-sm p-2" style={{ borderRadius: '8px' }}>
                                <h6 className="fw-bold mb-2 text-center" style={{ fontSize: '13px' }}>Tickets por Setor</h6>
                                <div style={{ height: '220px' }}>
                                    <Bar data={dataSetor}
                                        options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { font: { size: 10 } } }, x: { ticks: { font: { size: 9 } } } } }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    return <NavBar conteudo={conteudoHtml} />;
}

export default MetricasAtendimento;

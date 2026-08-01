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

import { Bar, Doughnut, Line } from 'react-chartjs-2';

const DIAS_SEMANA = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
const PERIODOS = ['Manhã', 'Tarde', 'Noite'];

function DashboardAcessos() {
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
                const res = await api.get(`/acessosrede/dashboard?dataInicial=${dtIni}&dataFinal=${dtFim}`);
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

    const porTipo = dados?.POR_TIPO || [];
    const porDia = dados?.POR_DIA || [];
    const porPeriodo = dados?.POR_PERIODO || [];
    const porDiaSemana = dados?.POR_DIA_SEMANA || [];
    const porRecorrencia = dados?.POR_RECORRENCIA || [];
    const tendencia = dados?.TENDENCIA || [];

    const membros = porTipo.find(t => t.TIPO === 'Membro')?.ACESSOS || 0;
    const visitantes = porTipo.find(t => t.TIPO === 'Visitante')?.ACESSOS || 0;
    const totalAcessos = membros + visitantes;
    const diaComMaisAcesso = porDia.reduce((max, item) => (item.ACESSOS > (max?.ACESSOS || 0) ? item : max), null);

    const dataTipo = {
        labels: ['Membros', 'Visitantes'],
        datasets: [{
            data: [membros, visitantes],
            backgroundColor: ['#4e73df', '#f6c23e'],
        }]
    };

    const dataDia = {
        labels: porDia.map(d => d.DATA_FORMATADA),
        datasets: [{
            label: 'Acessos',
            data: porDia.map(d => d.ACESSOS),
            backgroundColor: '#1cc88a',
        }]
    };

    const dataPeriodo = {
        labels: PERIODOS,
        datasets: [{
            data: PERIODOS.map(p => porPeriodo.find(x => x.PERIODO === p)?.ACESSOS || 0),
            backgroundColor: ['#36b9cc', '#f6c23e', '#5a5c69'],
        }]
    };

    const dataSemana = {
        labels: DIAS_SEMANA,
        datasets: [{
            label: 'Acessos',
            data: DIAS_SEMANA.map((_, i) => porDiaSemana.find(x => x.DIA_SEMANA_NUM === i + 1)?.ACESSOS || 0),
            backgroundColor: '#e74a3b',
        }]
    };

    const dataRecorrencia = {
        labels: ['Única Visita', 'Recorrente (2+)'],
        datasets: [{
            data: [
                porRecorrencia.find(r => r.CATEGORIA === 'Única Visita')?.QTD_PESSOAS || 0,
                porRecorrencia.find(r => r.CATEGORIA === 'Recorrente (2+)')?.QTD_PESSOAS || 0,
            ],
            backgroundColor: ['#858796', '#4e73df'],
        }]
    };

    const dataTendencia = {
        labels: tendencia.map(t => t.MES_FORMATADO),
        datasets: [{
            label: 'Acessos',
            data: tendencia.map(t => t.ACESSOS),
            borderColor: '#4e73df',
            backgroundColor: 'rgba(78, 115, 223, 0.15)',
            fill: true,
            tension: 0.3,
        }]
    };

    const conteudoHtml = (
        <div className="container mb-5">
            <div className="text-center mb-3">
                <h3 className="tituloD mb-1">Dashboard de Acessos</h3>
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
                                <span className="text-primary text-uppercase fw-bold" style={{ fontSize: '11px' }}>Total de Acessos</span>
                                <h5 className="fw-bold mb-0">{totalAcessos}</h5>
                            </div>
                        </div>
                        <div className="col-md-3 mb-2">
                            <div className="card shadow-sm p-3 h-100" style={{ borderLeft: '5px solid #1cc88a' }}>
                                <span className="text-success text-uppercase fw-bold" style={{ fontSize: '11px' }}>Membros</span>
                                <h5 className="fw-bold mb-0">{membros}</h5>
                            </div>
                        </div>
                        <div className="col-md-3 mb-2">
                            <div className="card shadow-sm p-3 h-100" style={{ borderLeft: '5px solid #f6c23e' }}>
                                <span className="text-warning text-uppercase fw-bold" style={{ fontSize: '11px' }}>Visitantes</span>
                                <h5 className="fw-bold mb-0">{visitantes}</h5>
                            </div>
                        </div>
                        <div className="col-md-3 mb-2">
                            <div className="card shadow-sm p-3 h-100" style={{ borderLeft: '5px solid #e74a3b' }}>
                                <span className="text-danger text-uppercase fw-bold" style={{ fontSize: '11px' }}>Dia com Mais Acesso</span>
                                <h5 className="fw-bold mb-0" style={{ fontSize: '15px' }}>
                                    {diaComMaisAcesso ? `${diaComMaisAcesso.DATA_FORMATADA} (${diaComMaisAcesso.ACESSOS})` : '-'}
                                </h5>
                            </div>
                        </div>
                    </div>

                    <div className="row mb-3">
                        <div className="col-md-6 mb-2">
                            <div className="card shadow-sm p-2" style={{ borderRadius: '8px' }}>
                                <h6 className="fw-bold mb-2 text-center" style={{ fontSize: '13px' }}>Membros vs Visitantes</h6>
                                <div style={{ height: '220px' }}>
                                    <Doughnut data={dataTipo}
                                        options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } } } }} />
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 mb-2">
                            <div className="card shadow-sm p-2" style={{ borderRadius: '8px' }}>
                                <h6 className="fw-bold mb-2 text-center" style={{ fontSize: '13px' }}>Acessos por Período do Dia</h6>
                                <div style={{ height: '220px' }}>
                                    <Doughnut data={dataPeriodo}
                                        options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } } } }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row mb-3">
                        <div className="col-md-12 mb-2">
                            <div className="card shadow-sm p-2" style={{ borderRadius: '8px' }}>
                                <h6 className="fw-bold mb-2 text-center" style={{ fontSize: '13px' }}>Acessos por Dia</h6>
                                <div style={{ height: '250px' }}>
                                    <Bar data={dataDia}
                                        options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { font: { size: 10 } } }, x: { ticks: { font: { size: 9 } } } } }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row mb-3">
                        <div className="col-md-12 mb-2">
                            <div className="card shadow-sm p-2" style={{ borderRadius: '8px' }}>
                                <h6 className="fw-bold mb-2 text-center" style={{ fontSize: '13px' }}>Acessos por Dia da Semana</h6>
                                <div style={{ height: '250px' }}>
                                    <Bar data={dataSemana}
                                        options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { font: { size: 10 } } }, x: { ticks: { font: { size: 9 } } } } }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row mb-3">
                        <div className="col-md-6 mb-2">
                            <div className="card shadow-sm p-2" style={{ borderRadius: '8px' }}>
                                <h6 className="fw-bold mb-2 text-center" style={{ fontSize: '13px' }}>Recorrência de Visitantes</h6>
                                <div style={{ height: '220px' }}>
                                    <Doughnut data={dataRecorrencia}
                                        options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } } } }} />
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 mb-2">
                            <div className="card shadow-sm p-2" style={{ borderRadius: '8px' }}>
                                <h6 className="fw-bold mb-2 text-center" style={{ fontSize: '13px' }}>Tendência de Acessos (últimos 6 meses)</h6>
                                <div style={{ height: '220px' }}>
                                    <Line data={dataTendencia}
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

export default DashboardAcessos;

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

function ResumoCadastros() {
    ChartJS.register(CategoryScale, LinearScale, PointElement,
        LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

    const [resumo, setResumo] = useState(null);

    useEffect(() => {
        const fetchResumo = async () => {
            Loading.show('Aguarde....');
            try {
                const res = await api.get(`/pessoas/resumo`);
                if (res.data.SUCCESS) {
                    setResumo(res.data.DATA);
                } else {
                    toastr.error(res.data.MESSAGE || 'Erro ao buscar resumo de cadastros.');
                }
            } catch (error) {
                toastr.error('Erro na comunicação com o servidor.');
            } finally {
                Loading.hide();
            }
        };
        fetchResumo();
    }, []);

    const cadastrosPorMes = resumo?.CADASTROS_POR_MES || [];

    const dataTipo = {
        labels: ['Membros', 'Visitantes'],
        datasets: [{
            data: [resumo?.TOTAL_MEMBROS || 0, resumo?.TOTAL_VISITANTES || 0],
            backgroundColor: ['#4e73df', '#36b9cc'],
        }]
    };

    const dataSituacao = {
        labels: ['Ativos', 'Inativos'],
        datasets: [{
            data: [resumo?.TOTAL_ATIVOS || 0, resumo?.TOTAL_INATIVOS || 0],
            backgroundColor: ['#1cc88a', '#e74a3b'],
        }]
    };

    const dataCadastrosPorMes = {
        labels: cadastrosPorMes.map(m => m.MES_FORMATADO),
        datasets: [{
            label: 'Novos Cadastros',
            data: cadastrosPorMes.map(m => m.CADASTROS),
            backgroundColor: '#24345c',
        }]
    };

    const conteudoHtml = (
        <div className='body'>
            <div className='pt-2 mt-2'>
                <div className='text-center'>
                    <h3 className='tituloD mb-1'>Resumo de Cadastros</h3>
                </div>

                {resumo && (
                    <div className="container mt-4">
                        <div className="row mb-3 text-center gx-3">
                            <div className="col-md-12 mb-2">
                                <div className="card shadow-sm p-3 h-100" style={{ borderLeft: '5px solid #24345c' }}>
                                    <span className="text-uppercase fw-bold" style={{ fontSize: '11px', color: '#24345c' }}>Total de Cadastros</span>
                                    <h5 className="fw-bold mb-0">{resumo.TOTAL}</h5>
                                </div>
                            </div>
                        </div>
                        <div className="row mb-3 text-center gx-3">
                            <div className="col-md-3 col-6 mb-2">
                                <div className="card shadow-sm p-3 h-100" style={{ borderLeft: '5px solid #4e73df' }}>
                                    <span className="text-primary text-uppercase fw-bold" style={{ fontSize: '11px' }}>Membros</span>
                                    <h5 className="fw-bold mb-0">{resumo.TOTAL_MEMBROS}</h5>
                                </div>
                            </div>
                            <div className="col-md-3 col-6 mb-2">
                                <div className="card shadow-sm p-3 h-100" style={{ borderLeft: '5px solid #36b9cc' }}>
                                    <span className="text-info text-uppercase fw-bold" style={{ fontSize: '11px' }}>Visitantes</span>
                                    <h5 className="fw-bold mb-0">{resumo.TOTAL_VISITANTES}</h5>
                                </div>
                            </div>
                            <div className="col-md-3 col-6 mb-2">
                                <div className="card shadow-sm p-3 h-100" style={{ borderLeft: '5px solid #1cc88a' }}>
                                    <span className="text-success text-uppercase fw-bold" style={{ fontSize: '11px' }}>Ativos</span>
                                    <h5 className="fw-bold mb-0">{resumo.TOTAL_ATIVOS}</h5>
                                </div>
                            </div>
                            <div className="col-md-3 col-6 mb-2">
                                <div className="card shadow-sm p-3 h-100" style={{ borderLeft: '5px solid #e74a3b' }}>
                                    <span className="text-danger text-uppercase fw-bold" style={{ fontSize: '11px' }}>Inativos</span>
                                    <h5 className="fw-bold mb-0">{resumo.TOTAL_INATIVOS}</h5>
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
                                    <h6 className="fw-bold mb-2 text-center" style={{ fontSize: '13px' }}>Ativos vs Inativos</h6>
                                    <div style={{ height: '220px' }}>
                                        <Doughnut data={dataSituacao}
                                            options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } } } }} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="row mb-3">
                            <div className="col-md-12 mb-2">
                                <div className="card shadow-sm p-2" style={{ borderRadius: '8px' }}>
                                    <h6 className="fw-bold mb-2 text-center" style={{ fontSize: '13px' }}>Novos Cadastros por Mês (últimos 6 meses)</h6>
                                    <div style={{ height: '250px' }}>
                                        <Bar data={dataCadastrosPorMes}
                                            options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { font: { size: 10 } } }, x: { ticks: { font: { size: 9 } } } } }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    return <NavBar conteudo={conteudoHtml} />;
}

export default ResumoCadastros;

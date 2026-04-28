import React, { useState, useEffect } from 'react';
import NavBar from '../../../components/menu.jsx';
import api from '../../../config/api.js';
import Loading from '../../../components/loading/loading.js';
import CryptoJS from 'crypto-js';
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

import { Bar, Doughnut } from "react-chartjs-2";

function MetaAnalytics() {
    ChartJS.register(CategoryScale, LinearScale, PointElement,
        LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

    const [dados, setDados] = useState(null);
    const [controle, setControle] = useState(0);

    const decryptData = (encryptedData) => {
        if (!encryptedData) return "";
        try {
            const bytes = CryptoJS.AES.decrypt(encryptedData.toString(), 'Alysson-2025-IACBURITAMA');
            return bytes.toString(CryptoJS.enc.Utf8);
        } catch (e) {
            return "";
        }
    };

    useEffect(() => {
        var date = new Date();
        var primeiroDia = new Date(date.getFullYear(), date.getMonth(), 1);
        var ultimoDia = new Date();

        const formatarData = (data) => data.toISOString().split('T')[0];

        if (document.getElementById('inputDataInicial')) {
            document.getElementById('inputDataInicial').value = formatarData(primeiroDia);
            document.getElementById('inputDataFinal').value = formatarData(ultimoDia);
        }
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            Loading.show("Aguarde....");
            const dtIni = document.getElementById('inputDataInicial')?.value || '';
            const dtFim = document.getElementById('inputDataFinal')?.value || '';

            try {
                const res = await api.get(`/meta/analytics?dtInicio=${dtIni}&dtFim=${dtFim}`);
                if (res.data.SUCCESS) {
                    setDados(res.data.DATA);
                } else {
                    toastr.error(res.data.MESSAGE || "Erro ao buscar dados.");
                }
            } catch (error) {
                toastr.error("Erro na comunicação com o servidor.");
            } finally {
                Loading.hide();
            }
        };

        fetchData();
    }, [controle]);

    const chartData = dados ? {
        labels: ['Marketing', 'Utilidade', 'Autenticação', 'Serviço'],
        datasets: [{
            data: [
                dados.categories.marketing,
                dados.categories.utility,
                dados.categories.authentication,
                dados.categories.service
            ],
            backgroundColor: [
                '#FF6384',
                '#36A2EB',
                '#FFCE56',
                '#4BC0C0'
            ]
        }]
    } : null;

    const conteudoHtml = (
        <div className='container'>
            <div className='text-center mb-3'>
                <h3 className='tituloD mb-1'>Estatísticas Meta</h3>
            </div>

            <div className="row mb-3 justify-content-center">
                <div className='col-md-2 mb-2'>
                    <input type="date" className="form-control form-control-sm shadow-sm" id='inputDataInicial' />
                </div>
                <div className='col-md-2 mb-2'>
                    <input type="date" className="form-control form-control-sm shadow-sm" id='inputDataFinal' />
                </div>
                <div className='col-md-2 mb-2'>
                    <button onClick={() => setControle(controle + 1)}
                        className="btn btn-outline-secondary btn-sm w-100" type="button">
                        Consultar
                    </button>
                </div>
            </div>

            {dados && (
                <div className="container-fluid px-3">
                    {/* Principais Indicadores */}
                    <div className="row mb-3 text-center gx-3">
                        <div className="col-md-4 mb-2">
                            <div className="card shadow-sm  p-3 h-100" style={{ borderLeft: '5px solid #4e73df' }}>
                                <span className="text-primary text-uppercase fw-bold" style={{ fontSize: '11px' }}>Custo Total (BRL)</span>
                                <h5 className="fw-bold mb-0">R$ {dados.cost_brl}</h5>
                                <small className="text-muted" style={{ fontSize: '10px' }}>Cotação: {dados.dollar_rate}</small>
                            </div>
                        </div>
                        <div className="col-md-4 mb-2">
                            <div className="card shadow-sm  p-3 h-100" style={{ borderLeft: '5px solid #1cc88a' }}>
                                <span className="text-success text-uppercase fw-bold" style={{ fontSize: '11px' }}>Custo Total (USD)</span>
                                <h5 className="fw-bold mb-0">US$ {dados.cost_usd}</h5>
                                <small className="text-muted" style={{ fontSize: '10px' }}>Valor Base Meta</small>
                            </div>
                        </div>
                        <div className="col-md-4 mb-2">
                            <div className="card shadow-sm  p-3 h-100" style={{ borderLeft: '5px solid #36b9cc' }}>
                                <span className="text-info text-uppercase fw-bold" style={{ fontSize: '11px' }}>Conversas</span>
                                <h5 className="fw-bold mb-0">{dados.total_conversations}</h5>
                                <small className="text-muted" style={{ fontSize: '10px' }}>Total no Período</small>
                            </div>
                        </div>
                    </div>

                    {/* Detalhamento por Categoria */}
                    <div className="row mb-3 text-center">
                        <div className="col-md-3 mb-2">
                            <div className="card shadow-sm p-3 h-100" style={{ borderLeft: '5px solid #FF6384' }}>
                                <span className="text-uppercase fw-bold" style={{ color: '#FF6384', fontSize: '11px' }}>Marketing</span>
                                <h5 className="fw-bold mb-0">{dados.categories.marketing || 0}</h5>
                            </div>
                        </div>
                        <div className="col-md-3 mb-2">
                            <div className="card shadow-sm p-3 h-100" style={{ borderLeft: '5px solid #36A2EB' }}>
                                <span className="text-uppercase fw-bold" style={{ color: '#36A2EB', fontSize: '11px' }}>Utilidade</span>
                                <h5 className="fw-bold mb-0">{dados.categories.utility || 0}</h5>
                            </div>
                        </div>
                        <div className="col-md-3 mb-2">
                            <div className="card shadow-sm  p-3 h-100" style={{ borderLeft: '5px solid #FFCE56' }}>
                                <span className="text-uppercase fw-bold" style={{ color: '#FFCE56', fontSize: '11px' }}>Autenticação</span>
                                <h5 className="fw-bold mb-0">{dados.categories.authentication || 0}</h5>
                            </div>
                        </div>
                        <div className="col-md-3 mb-2">
                            <div className="card shadow-sm p-3 h-100" style={{ borderLeft: '5px solid #4BC0C0' }}>
                                <span className="text-uppercase fw-bold" style={{ color: '#4BC0C0', fontSize: '11px' }}>Serviço</span>
                                <h5 className="fw-bold mb-0">{dados.categories.service || 0}</h5>
                            </div>
                        </div>
                    </div>

                    {/* Gráficos */}
                    <div className="row mb-3">
                        <div className="col-md-6 mb-2">
                            <div className="card shadow-sm p-2" style={{ borderRadius: '8px' }}>
                                <h6 className="fw-bold mb-2 text-center" style={{ fontSize: '13px' }}>Distribuição</h6>
                                <div style={{ height: '200px' }}>
                                    <Doughnut data={chartData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } } } }} />
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 mb-2">
                            <div className="card shadow-sm p-2" style={{ borderRadius: '8px' }}>
                                <h6 className="fw-bold mb-2 text-center" style={{ fontSize: '13px' }}>Volume por Categoria</h6>
                                <div style={{ height: '200px' }}>
                                    <Bar data={chartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { font: { size: 10 } } }, x: { ticks: { font: { size: 10 } } } } }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div >
            )
            }
        </div >
    );

    return <NavBar conteudo={conteudoHtml} />;
}

export default MetaAnalytics;


import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './estilo.css';
import NavBar from '../../components/menu.jsx';
import api from '../../config/api.js';
import Loading from '../../components/loading/loading.js';
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

import { Bar } from "react-chartjs-2";


function Site() {
    ChartJS.register(CategoryScale, LinearScale, PointElement,
        LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

    const [dados, setDados] = useState([]);
    const [resumo, setResumo] = useState(null);
    const [controle] = useState(0);

    useEffect(() => {
        const fetchGrafico = async () => {
            try {
                const res = await api.get(`/acessosrede/graficohome`);
                if (res.data.DATA.length > 0) {
                    setDados(res.data.DATA)
                }
            } catch (error) {
                toastr.error("Erro ao buscar gráfico de acessos:", error);
            }
        };

        const fetchResumo = async () => {
            try {
                const res = await api.get(`/home/resumo`);
                if (res.data.SUCCESS) {
                    setResumo(res.data.DATA);
                }
            } catch (error) {
                toastr.error("Erro ao buscar resumo da home:", error);
            }
        };

        Loading.show("Aguarde....");
        Promise.all([fetchGrafico(), fetchResumo()]).finally(() => Loading.hide());

    }, [controle]);

    const labels = Array.isArray(dados) ? dados.map(item => item.DATA_FORMATADA) : [];
    const quanidadeAcesso = Array.isArray(dados) ? dados.map(item => item.ACESSOS) : [];

    const data = new Date();

    // Exibir apenas o mês em extenso
    const mesExtenso = data.toLocaleDateString('pt-BR', { month: 'long' });

    const conteudoHtml =
        <div className="container mb-5 mt-0 pt-0 mt-0">
            {resumo && (
                <div className="row mb-3 text-center gx-3">
                    <div className="col-md-3 col-6 mb-2">
                        <Link to="/app/dados/dashboard-acessos" className="text-decoration-none">
                            <div className="card shadow-sm p-3 h-100" style={{ borderLeft: '5px solid #4e73df' }}>
                                <span className="text-primary text-uppercase fw-bold" style={{ fontSize: '11px' }}>Check-ins Hoje</span>
                                <h5 className="fw-bold mb-0">{resumo.CHECKINS_HOJE}</h5>
                            </div>
                        </Link>
                    </div>
                    <div className="col-md-3 col-6 mb-2">
                        <Link to="/app/atendimento/tickets" className="text-decoration-none">
                            <div className="card shadow-sm p-3 h-100" style={{ borderLeft: '5px solid #e74a3b' }}>
                                <span className="text-danger text-uppercase fw-bold" style={{ fontSize: '11px' }}>Tickets Abertos</span>
                                <h5 className="fw-bold mb-0">{resumo.TICKETS_ABERTOS}</h5>
                            </div>
                        </Link>
                    </div>
                    <div className="col-md-3 col-6 mb-2">
                        <Link to="/app/cadastros/pessoas" className="text-decoration-none">
                            <div className="card shadow-sm p-3 h-100" style={{ borderLeft: '5px solid #1cc88a' }}>
                                <span className="text-success text-uppercase fw-bold" style={{ fontSize: '11px' }}>Visitantes Novos (7 dias)</span>
                                <h5 className="fw-bold mb-0">{resumo.VISITANTES_NOVOS_SEMANA}</h5>
                            </div>
                        </Link>
                    </div>
                    <div className="col-md-3 col-6 mb-2">
                        <Link to="/app/dados/membros-ausentes" className="text-decoration-none">
                            <div className="card shadow-sm p-3 h-100" style={{ borderLeft: '5px solid #36b9cc' }}>
                                <span className="text-info text-uppercase fw-bold" style={{ fontSize: '11px' }}>Membros Ausentes (30+)</span>
                                <h5 className="fw-bold mb-0">{resumo.MEMBROS_AUSENTES}</h5>
                            </div>
                        </Link>
                    </div>
                </div>
            )}

            <div className="row">
                <div className="col-md-12">
                    <div className="card p-2">
                        <h6 className="fw-bold mb-2 text-center" style={{ fontSize: '13px' }}>
                            Quantidade de Acessos - {mesExtenso.charAt(0).toUpperCase() + mesExtenso.slice(1)}
                        </h6>
                        <div style={{ height: 'calc(100vh - 260px)', minHeight: '400px' }}>
                            <Bar data={{
                                labels: labels,
                                datasets: [{
                                    label: 'Acessos',
                                    data: quanidadeAcesso,
                                    backgroundColor: 'rgb(75, 192, 192)',
                                    borderColor: 'rgb(75, 192, 192)',
                                    borderWidth: 1
                                }],
                            }}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                }} />
                        </div>
                    </div>
                </div>
            </div>

        </div>

    return (<>
        <NavBar conteudo={conteudoHtml} />
    </>
    );
}

export default Site;

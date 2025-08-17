
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

import { Bar, Line, Pie } from "react-chartjs-2";


function QntdAcessosPessoas() {
    ChartJS.register(CategoryScale, LinearScale, PointElement,
        LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

    function decryptData(encryptedData) {
        const bytes = CryptoJS.AES.decrypt(encryptedData.toString(), 'Alysson-2025-IACBURITAMA');
        return bytes.toString(CryptoJS.enc.Utf8);
    }



    const [dados, setDados] = useState([]);
    const [pagina, setPagina] = useState(1);
    const [controle, setControle] = useState(0);

    useEffect(() => {
        const fetchGetList = async () => {
            Loading.show("Aguarde....");
            try {
                const res = await api.get(`/acessosrede/graficoqntdpessoa`);
                if (res.data.DATA.length > 0) {
                    setDados(res.data.DATA)
                }
            } catch (error) {
                toastr.error("Erro ao buscar despesas:", error);
            } finally {
                Loading.hide();
            }

        };

        fetchGetList();



    }, [controle]);

    const labels = Array.isArray(dados) ? dados.map(item => item.NOME) : [];
    const quanidadeAcesso = Array.isArray(dados) ? dados.map(item => item.ACESSOS) : [];

    const data = new Date();


    const conteudoHtml =
        <div className="container mb-5 mt-0 pt-0 mt-0">
            <div className="row">
                <h3 className='text-center mb-3'>Quantidade de Acessos Por Pessoa</h3>
            </div>
            <div className="row">
                <div className="col-md-12">
                    <div className="card card-graficos">
                        <Bar
                            data={{
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
                                indexAxis: 'y', // 🔁 transforma em gráfico horizontal
                                responsive: true,
                                maintainAspectRatio: false,
                                scales: {
                                    x: {
                                        beginAtZero: true
                                    }
                                }
                            }}
                        />

                    </div>
                </div>
            </div>

        </div>

    return (<>
        <NavBar conteudo={conteudoHtml} />

        {/* <div className="d-flex">
            <NavBar />
           
        </div> */}

    </>
    );
}

export default QntdAcessosPessoas;

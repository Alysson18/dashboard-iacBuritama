import React, { useState, useEffect } from 'react';
import NavBar from '../../../components/menu.jsx';
import { Link, Redirect } from 'react-router-dom';
import api from '../../../config/api.js';
import Loading from '../../../components/loading/loading.js';
import './grafico.css'
import CryptoJS from 'crypto-js';
import ReactPaginate from "react-paginate";
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



function Extrato() {
    ChartJS.register(
        CategoryScale,
        LinearScale,
        PointElement,
        LineElement,
        BarElement,
        ArcElement,
        Title,
        Tooltip,
        Legend
    );


    const [contacorrente, setContaCorrente] = useState([]);

    const [despesaPrevista, setDespesaPrevista] = useState(0);
    const [receitaPrevista, setReceitaPrevista] = useState(0);
    const [saldoAtual, setSaldoAtual] = useState(0);
    const [saldoPrevisto, setSaldoPrevisto] = useState(0);
    const [pagina, setPagina] = useState(1);
    const [pageCount, setpageCount] = useState(1);
    const [controle, setControle] = useState(0);
    const [controla, setControla] = useState(0);
    const [dados, setDados] = useState([]);
    const [saldoporconta, setSaldoporconta] = useState([]);

    function decryptData(encryptedData) {
        const bytes = CryptoJS.AES.decrypt(encryptedData.toString(), 'Alysson-2025-ABAC');
        return bytes.toString(CryptoJS.enc.Utf8);
    }

    useEffect(() => {
        var date = new Date();

        const anoAtual = new Date().getFullYear();
        var primeiroDia = `${anoAtual}-01-01`;
        var ultimoDia = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        // Formatar datas para YYYY-MM-DD
        const formatarData = (data) => data.toISOString().split('T')[0];

        document.getElementById('dataInicial').value = (primeiroDia);
        document.getElementById('dataFinal').value = formatarData(ultimoDia);

        console.log(primeiroDia, ultimoDia)
        const fetchGetList = async () => {
            Loading.show("Aguarde....");
            try {
                const res = await api.get(
                    `/contacorrente/lista?id_empresa=${decryptData(sessionStorage.getItem('id_empresa'))}&page=1&pageSize=500`
                );
                if (res.data.DATA.length > 0) {
                    setContaCorrente(res.data.DATA);
                }
            } catch (error) {
                toastr.error("Erro ao buscar lista de conta corrente:", error);
            }
        };

        fetchGetList();
    }, [controla])

    useEffect(() => {
        const fetchGetList = async () => {
            Loading.show("Aguarde....");
            try {
                const res = await api.get(`/extrato/dados?id_empresa=${decryptData(sessionStorage.getItem('id_empresa'))}&data_inicial=${document.getElementById('dataInicial').value}&data_final=${document.getElementById('dataFinal').value}&situacao=0&id_conta_corrente=${document.getElementById('idcontacorrente').value}&page=1&pageSize=500`);
                if (res.data.VALORES.length > 0) {
                    setReceitaPrevista(res.data.VALORES[0].TOTAL_CREDITO_PREVISTO)
                    setDespesaPrevista(res.data.VALORES[0].TOTAL_DEBITO_PREVISTO)
                    setSaldoAtual(res.data.VALORES[0].SALDO_ATUAL)
                    setSaldoPrevisto(res.data.VALORES[0].SALDO_PREVISTO)
                    setDados(res.data.GRAFICO)
                    setSaldoporconta(res.data.CONTA)

                }
            } catch (error) {
                toastr.error("Erro ao buscar despesas:", error);
            } finally {
                Loading.hide();
            }
        };

        fetchGetList();

    }, [pagina, controle])



    async function BuscarDados() {
        Loading.show("Aguarde....");
        try {
            const res = await api.get(`/extrato/dados?id_empresa=${decryptData(sessionStorage.getItem('id_empresa'))}&data_inicial=${document.getElementById('dataInicial').value}&data_final=${document.getElementById('dataFinal').value}&situacao=0&id_conta_corrente=${document.getElementById('idcontacorrente').value}&page=1&pageSize=500`);
            if (res.data.VALORES.length > 0) {
                setReceitaPrevista(res.data.VALORES[0].TOTAL_CREDITO_PREVISTO)
                setDespesaPrevista(res.data.VALORES[0].TOTAL_DEBITO_PREVISTO)
                setSaldoAtual(res.data.VALORES[0].SALDO_ATUAL)
                setSaldoPrevisto(res.data.VALORES[0].SALDO_PREVISTO)
                setDados(res.data.GRAFICO)
                setSaldoporconta(res.data.CONTA)

            }
        } catch (error) {
            toastr.error("Erro ao buscar despesas:", error);
        } finally {
            Loading.hide();
        }
    }


    const labels = Array.isArray(dados) ? dados.map(item => item.MES_ANO) : [];
    const dataCredito = Array.isArray(dados) ? dados.map(item => item.TOTAL_CREDITO_PREVISTO) : [];
    const dataDebito = Array.isArray(dados) ? dados.map(item => item.TOTAL_DEBITO_PREVISTO) : [];
    const receita = Array.isArray(dados) ? dados.map(item => item.TOTAL_CREDITO_PAGO) : [];
    const despesa = Array.isArray(dados) ? dados.map(item => item.TOTAL_DEBITO_PAGO) : [];

    const labelsContas = Array.isArray(saldoporconta) ? saldoporconta.map(item => item.DESCRICAO) : [];
    const creditoContaPrevisto = Array.isArray(saldoporconta) ? saldoporconta.map(item => item.TOTAL_CREDITO_PREVISTO) : [];
    const debitoContaPrevisto = Array.isArray(saldoporconta) ? saldoporconta.map(item => item.TOTAL_DEBITO_PREVISTO) : [];
    const receitaConta = Array.isArray(saldoporconta) ? saldoporconta.map(item => item.TOTAL_CREDITO_PAGO) : [];
    const despesaConta = Array.isArray(saldoporconta) ? saldoporconta.map(item => item.TOTAL_DEBITO_PAGO) : [];


    const conteudoHtml = <div className='body'>
        <div className={` pt-2  mt-2`}>
            <div className='text-center'>
                <h3 className='tituloD mb-1'>Saude Financeira</h3>
            </div>

            <div className="row mt-4">
                <div className='col-md-2 mt-1'>
                    <b className="labelDescC">Data Inicial</b>
                    <div className="input-group">
                        <input type="date" className="form-control"
                            aria-label="Data Inicial" id="dataInicial"
                        />

                    </div>
                </div>
                <div className='col-md-2 mt-1'>
                    <b className="labelDescC">Data Final</b>
                    <div className="input-group">
                        <input type="date" className="form-control"
                            aria-label="Data Final" id="dataFinal"
                        />

                    </div>
                </div>

                {/* <div className='col-md-2 mt-1'>
                    <b className="labelDescC">Situação</b>
                    <select className="form-select" aria-label="Situação" id="situacao">
                        <option value="T">Todas</option>
                        <option value="P">Efetivadas</option>
                        <option value="A">Pendentes</option>

                    </select>
                </div> */}

                <div className='col-md-2 mt-1'>
                    <b className="labelDescC">Conta Bancaria</b>
                    <select class="form-select select" aria-label="Conta Corrente" id="idcontacorrente">
                        <option value="0">Todas</option>
                        {contacorrente?.map((CC) => (
                            <option className='text-black' key={CC.ID_CONTA}
                                value={CC.ID_CONTA}>{CC.DESCRICAO}</option>

                        ))}

                    </select>
                </div>
                <div className='col-md-2 d-flex flex-column mt-1'>
                    <button className="btn btn-outline-secondary w-100 mt-auto"
                        onClick={() => BuscarDados()}
                        type="button" id="button-addon2">Buscar</button>
                </div>

            </div>

            <div className="row mt-2 mt-4  justify-content-center align-items-center">
                <div className="card cardValores text-white bg-secondary  mb-3 col-12 me-1 col-12 col-sm-1">
                    <div className="card-header text-center">Saldo Atual</div>
                    <div className="card-body">
                        <h5 className="card-title text-center">{parseFloat(saldoAtual).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</h5>
                    </div>
                </div>
                <div className="card cardValores text-white bg-success mb-3 col-12 me-1 col-12 col-sm-1">
                    <div className="card-header text-center">Receitas</div>
                    <div className="card-body">
                        <h5 className="card-title text-center">{parseFloat(receitaPrevista).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</h5>
                    </div>
                </div>
                <div className="card cardValores text-white bg-danger mb-3 col-12 me-1 col-12 col-sm-1">
                    <div className="card-header text-center">Despesas</div>
                    <div className="card-body">
                        <h5 className="card-title text-center">{parseFloat(despesaPrevista).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</h5>
                    </div>
                </div>
                <div className="card cardValores text-white bg-primary mb-3 col-12  col-12 col-sm-1">
                    <div className="card-header text-center">Saldo Previsto</div>
                    <div className="card-body">
                        <h5 className="card-title text-center">{parseFloat((saldoPrevisto + saldoAtual)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</h5>
                    </div>
                </div>
            </div>

            <div className="">
                <div className="row justify-content-center align-items-center">
                    <div className="col-md-5 card card-grafico mx-3">
                        <div className="text-center mb-2">Valores Mês a Mês</div>
                        <div className='tamanho'>
                            <Line data={{
                                labels: labels,
                                datasets: [
                                    {
                                        label: "Receitas Previstas",
                                        data: dataCredito,
                                        borderColor: "rgb(0, 183, 255)",
                                        backgroundColor: "rgb(0, 183, 255)",
                                        fill: true,
                                    },
                                    {
                                        label: "Despesas Previstas",
                                        data: dataDebito,
                                        borderColor: "rgb(234, 0, 255)",
                                        backgroundColor: "rgb(234, 0, 255)",
                                        fill: true,
                                    },
                                    {
                                        label: "Receitas Recebidas",
                                        data: receita,
                                        borderColor: "rgb(0, 255, 0)",
                                        backgroundColor: "rgb(0, 255, 0)",
                                        fill: true,
                                    },
                                    {
                                        label: "Despesas Pagas",
                                        data: despesa,
                                        borderColor: "red",
                                        backgroundColor: "rgb(255, 0, 0)",
                                        fill: true,
                                    }
                                ]
                            }}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    scales: {
                                        y: {
                                            ticks: {
                                                callback: function (value) {
                                                    return 'R$ ' + value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                                                }
                                            }
                                        },
                                    },
                                    plugins: {
                                        tooltip: {
                                            mode: 'index', // Exibe informações de todos os datasets no mesmo tooltip
                                            intersect: false, // Permite exibir o tooltip mesmo ao passar próximo de um ponto/barra
                                            callbacks: {
                                                label: function (context) {
                                                    const datasetLabel = context.dataset.label || ''; // Nome do dataset
                                                    const value = context.raw || 0; // Valor correspondente
                                                    // Retorno com o valor formatado em Reais
                                                    return `${datasetLabel}: R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
                                                }
                                            }
                                        }
                                    },
                                }} />
                        </div>
                    </div>

                    <div className="col-md-5 card card-grafico mx-3 mt-3">
                        <div className="text-center mb-2">Valores Por Conta Corrente</div>
                        <div className='tamanho'>
                            <Bar data={{
                                labels: labelsContas,
                                datasets: [
                                    {
                                        label: "Receitas Previstas",
                                        data: creditoContaPrevisto,
                                        borderColor: "rgb(0, 183, 255)",
                                        backgroundColor: "rgb(0, 183, 255)",
                                        fill: true,
                                    },
                                    {
                                        label: "Despesas Previstas",
                                        data: debitoContaPrevisto,
                                        borderColor: "rgb(234, 0, 255)",
                                        backgroundColor: "rgb(234, 0, 255)",
                                        fill: true,
                                    },
                                    {
                                        label: "Receitas Recebidas",
                                        data: receitaConta,
                                        borderColor: "rgb(0, 255, 0)",
                                        backgroundColor: "rgb(0, 255, 0)",
                                        fill: true,
                                    },
                                    {
                                        label: "Despesas Pagas",
                                        data: despesaConta,
                                        borderColor: "red",
                                        backgroundColor: "rgb(255, 0, 0)",
                                        fill: true,
                                    }
                                ]
                            }}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    scales: {
                                        y: {
                                            ticks: {
                                                callback: function (value) {
                                                    return 'R$ ' + value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                                                }
                                            }
                                        },
                                    },
                                    plugins: {
                                        tooltip: {
                                            mode: 'index', // Exibe informações de todos os datasets no mesmo tooltip
                                            intersect: false, // Permite exibir o tooltip mesmo ao passar próximo de um ponto/barra
                                            callbacks: {
                                                label: function (context) {
                                                    const datasetLabel = context.dataset.label || ''; // Nome do dataset
                                                    const value = context.raw || 0; // Valor correspondente
                                                    // Retorno com o valor formatado em Reais
                                                    return `${datasetLabel}: R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
                                                }
                                            }
                                        }
                                    },
                                }} />
                        </div>
                    </div>
                </div>
                {/* <div className="row justify-content-center align-items-center">
                    <div className="col-md-5 card card-grafico mx-3 mt-2">

                    </div>
                </div> */}
            </div>

        </div>
    </div>







    return (<>
        <NavBar conteudo={conteudoHtml} />
    </>
    );
}

export default Extrato;


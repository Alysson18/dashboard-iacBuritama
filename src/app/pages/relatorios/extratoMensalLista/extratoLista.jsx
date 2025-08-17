import React, { useEffect, useState } from 'react';
import NavBar from '../../../components/menu.jsx';
import { Mask } from '../../../config/Util.js';
import api from '../../../config/api';
import CryptoJS from 'crypto-js';
import Loading from '../../../components/loading/loading.js';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
const logo = '../../img/logo2.png'

const ExtartoMensal = () => {
    const now = new Date();
    const [dados, setDados] = useState([]);
    const [dadosEmpresa, setDadosEmpresa] = useState({});
    const [despesa, setDespesa] = useState(0);
    const [receita, setReceita] = useState(0);
    const [valorConta, setValorConta] = useState([]);
    const [saldo, setsaldo] = useState(0);
    const [contacorrente, setContaCorrente] = useState([]);
    const [data, setData] = useState(now.toISOString().split('T')[0])

    function encryptData(data) {
        return CryptoJS.AES.encrypt(data.toString(), 'Alysson-2025-ABAC').toString();
    }

    function decryptData(encryptedData) {
        const bytes = CryptoJS.AES.decrypt(encryptedData, 'Alysson-2025-ABAC');
        return bytes.toString(CryptoJS.enc.Utf8);
    }

    useEffect(() => {
        var date = new Date();
        var primeiroDia = new Date(date.getFullYear(), date.getMonth(), 1);
        var ultimoDia = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        // Formatar datas para YYYY-MM-DD
        const formatarData = (data) => data.toISOString().split('T')[0];

        document.getElementById('dataInicial').value = formatarData(primeiroDia);
        document.getElementById('dataFinal').value = formatarData(ultimoDia);

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
            } finally {
                Loading.hide();
            }
        };

        fetchGetList();

    }, [1])

    function parseInputDate(idInput) {
        const inputStr = document.getElementById(idInput).value; // Ex: "2025-06-17"
        if (!inputStr) return null;
        const [year, month, day] = inputStr.split("-");
        return new Date(Number(year), Number(month) - 1, Number(day)); // mês começa em 0
    }

    const fetchGetList = async () => {
        Loading.show("Aguarde....");
        try {
            const res = await api.get(`/movimentacoes/extrato?id_empresa=${decryptData(sessionStorage.getItem('id_empresa'))}&data_inicial=${document.getElementById('dataInicial').value}&data_final=${document.getElementById('dataFinal').value}&id_conta_corrente=${document.getElementById('idcontacorrente').value}`);
            if (res.data.DATA.length > 0) {
                setDados(res.data.DATA);
                setValorConta(res.data.VALOR_POR_CONTA)
                setDespesa(res.data.VALORES[0].TOTAL_DESPESA)
                setReceita(res.data.VALORES[0].TOTAL_RECEITA)
                setsaldo(res.data.VALORES[0].TOTAL_RECEITA - res.data.VALORES[0].TOTAL_DESPESA)
                generatePDFExtrato(res.data.SALDO_CONTA, res.data.DATA, res.data.VALOR_POR_CONTA);
            }
        } catch (error) {
            toastr.error("Erro ao buscar extratos:", error);
        } finally {
            Loading.hide();
        }
    };

    const generatePDFExtrato = async (dadosC, dadosE, valorPC) => {
        setDadosEmpresa(JSON.parse(decryptData(sessionStorage.getItem('empresa'))))
        const select = document.getElementById('idcontacorrente');
        const contaSelecionada = select.options[select.selectedIndex].text;



        if (dadosE.length <= 0) {
            toastr.remove()
            toastr.warning('Sem dados para gerar PDF!', 'Atenção!')
            return
        }

        const doc = new jsPDF("l", "mm", "a4"); // "l" define o formato paisagem (landscape)

        //Adicionar Cabeçalho
        const addHeader = () => {
            doc.setTextColor(0, 0, 0); // Define o texto para preto
            if (logo) {
                doc.addImage(logo, "PNG", 5, 5, 38, 32);
            }
            doc.setFontSize(10);
            doc.text(dadosEmpresa.RAZAO_SOCIAL, 45, 15);
            doc.setFontSize(9);
            doc.text("CNPJ: " + dadosEmpresa.DOCUMENTO, 45, 20);
            doc.text("Endereço: " + dadosEmpresa.ENDERECO + ", " + dadosEmpresa.NUMERO_ENDERECO + " - " + dadosEmpresa.CIDADE + ", " + dadosEmpresa.UF, 45, 25);
            doc.text("Contato: " + dadosEmpresa.TELEFONE + " | " + dadosEmpresa.EMAIL, 45, 30);
            doc.line(5, 35, 290, 35);
        };

        const addFooter = (pageNumber, totalPages) => {
            doc.setTextColor(0, 0, 0);
            doc.line(5, 195, 290, 195);
            doc.setFontSize(9);
            const now = new Date;
            const hora = now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
            doc.text("Financeiro ABAC - financeiro.softwareplus.com.br", 5, 200);
            doc.text("Relatório Gerado em: " + new Date().toLocaleDateString("pt-BR") + " - " + hora, 150, 200, { align: "center" });
            doc.text(`Página ${pageNumber} de ${totalPages}`, 310, 200, { align: "right" });
        };

        const addCardsToPDF = () => {
            let startX = 10;
            let startY = 65;
            const cardWidth = 50;
            const cardHeight = 20;

            const colors = {
                planejado: [255, 105, 97],
                realizado: [119, 221, 119],
                diferenca: [132, 182, 244],
            };

            doc.setFillColor(...colors.realizado);
            doc.roundedRect(startX, startY, cardWidth, cardHeight, 5, 5, "F");
            const text1 = "Receitas";
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(10);
            const text1Width = doc.getTextWidth(text1);
            const centerX1 = startX + (cardWidth / 2) - (text1Width / 2);
            doc.text(text1, centerX1, startY + 8);

            doc.setFontSize(14);
            const textPla = Number(receita).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
            const textPlaWidth = doc.getTextWidth(textPla);
            const centerPlaX = startX + (cardWidth / 2) - (textPlaWidth / 2);
            doc.text(textPla, centerPlaX, startY + 15);

            startX += cardWidth + 2;
            doc.setFillColor(...colors.planejado);
            doc.roundedRect(startX, startY, cardWidth, cardHeight, 5, 5, "F");
            const text2 = "Despesa";
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(10);
            const text2Width = doc.getTextWidth(text2);
            const centerX2 = startX + (cardWidth / 2) - (text2Width / 2);
            doc.text(text2, centerX2, startY + 8);

            doc.setFontSize(14);
            const textReal = Number(despesa).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
            const textRealWidth = doc.getTextWidth(textReal);
            const centerRealX = startX + (cardWidth / 2) - (textRealWidth / 2);
            doc.text(textReal, centerRealX, startY + 15);

            startX += cardWidth + 2;
            doc.setFillColor(...colors.diferenca);
            doc.roundedRect(startX, startY, cardWidth, cardHeight, 5, 5, "F");
            const text3 = "Saldo Periodo";
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(10);
            const text3Width = doc.getTextWidth(text3);
            const centerX3 = startX + (cardWidth / 2) - (text3Width / 2);
            doc.text(text3, centerX3, startY + 8);

            doc.setFontSize(14);
            const textDiff = saldo.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
            const textDiffWidth = doc.getTextWidth(textDiff);
            const centerDiffX = startX + (cardWidth / 2) - (textDiffWidth / 2);
            doc.text(textDiff, centerDiffX, startY + 15);
        };

        addHeader();
        addCardsToPDF();

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.text("Extrato Bancario", 148, 45, { align: "center" });

        doc.setFontSize(10);
        const dataInicial = parseInputDate("dataInicial");
        const dataFinal = parseInputDate("dataFinal");
        doc.text("Periodo: " + dataInicial.toLocaleDateString("pt-BR") + ' - ' + dataFinal.toLocaleDateString("pt-BR"), 9, 55, { align: "left" });
        doc.text("Conta Corrente: " + contaSelecionada, 9, 60, { align: "left" });

        doc.setFontSize(12);

        const headers = [
            "Data",
            "Cond. Pag.",
            "Descrição",
            "Tipo",
            "Categoria",
            "Conta Corrente",
            "Entrada",
            "Saida",
            "Saldo"
        ];
        let saldoGeral = 0;
        let EntradaGeralResumo = 0;
        const dataInicialSaldo = new Date(dataInicial);
        dataInicialSaldo.setDate(dataInicialSaldo.getDate() - 1);

        const body = [
            ...dadosC.map(item1 => {
                saldoGeral += Number(item1.SALDO_ANTERIOR) || 0;
                EntradaGeralResumo += Number(item1.SALDO_ANTERIOR) || 0;

                return [
                    (dataInicialSaldo).toLocaleDateString("pt-BR"),
                    'SALDO',
                    'SALDO REF.' + ' -> ' + item1.CONTA_CORRENTE,
                    'RECEITA',
                    'SALDO CONTA',
                    item1.CONTA_CORRENTE || '',
                    (Number(item1.SALDO_ANTERIOR) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
                    (0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
                    (Number(saldoGeral) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
                ];
            }),
            ...dadosE.map(item => {
                const valor = Number(item.VALOR) || 0;
                const isCredito = item.TIPO_MOVIMENTACAO === 'C';
                const isDebito = item.TIPO_MOVIMENTACAO === 'D';

                if (isCredito) saldoGeral += valor;
                if (isDebito) saldoGeral -= valor;

                return [
                    item.DATA_FORMATADA || '',
                    item.CONDICAO_PAGAMENTO || '',
                    item.DESCRICAO || '',
                    item.TIPO_MOVIMENTACAO_COMPLETO || '',
                    item.DESCRICAO_OBJETO || '',
                    item.CONTA_CORRENTE || '',
                    isCredito ? valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : (0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
                    isDebito ? valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : (0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
                    saldoGeral.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                ];
            })
        ];


        const totalPagesPlaceholder = "{totalPagesCount}"

        autoTable(doc, {
            head: [headers],
            body: body,
            startY: 95,
            margin: { left: 7, right: 5 }, // ← este é o ajuste
            styles: {
                fontSize: 7,
                cellPadding: 1,
                overflow: 'hidden',
            },
            headStyles: {
                fillColor: [44, 62, 80],
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                halign: 'center', // Centraliza o texto no cabeçalho
            },
            bodyStyles: {
                fillColor: [245, 245, 245],
                textColor: [50, 50, 50],
            },
            alternateRowStyles: {
                fillColor: [255, 255, 255]
            },
            columnStyles: {
                0: { cellWidth: 20 },
                1: { cellWidth: 22 },
                2: { cellWidth: 62 },
                3: { cellWidth: 22 },
                4: { cellWidth: 38 },
                5: { cellWidth: 40 },
                6: { cellWidth: 25 },
                7: { cellWidth: 25 },
                8: { cellWidth: 25 }
            },
            didDrawPage: function (data) {
                const pageNumber = doc.internal.getNumberOfPages();
                addFooter(pageNumber, totalPagesPlaceholder);
            }
        });


        // Nova página em retrato
        doc.addPage('a4', 'landscape');

        addHeader()


        doc.setFontSize(14);
        doc.text("Resumo Final", 148, 45, { align: "center" });

        const headersF = [
            "Conta Corrente",
            "Entrada",
            "Saida",
            "Saldo"
        ];

        const json = {
            'DESCRICAO': 'SALDO GERAL CONTAS',
            'TOTAL_RECEITA': Number(receita) + Number(EntradaGeralResumo),
            'TOTAL_DESPESA': Number(despesa),
        };

        valorPC.push(json);

        const bodyFinal = valorPC.map(item1 => {
            const receita = Number(item1.TOTAL_RECEITA) || 0;
            const despesa = Number(item1.TOTAL_DESPESA) || 0;

            return [
                item1.DESCRICAO || '',
                receita.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
                despesa.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
                (receita - despesa).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
            ];
        });


        autoTable(doc, {
            head: [headersF],
            body: bodyFinal,
            startY: 60,
            margin: { left: 22, right: 5 }, // ← este é o ajuste
            styles: {
                fontSize: 7,
                cellPadding: 3,
                overflow: 'hidden',
            },
            headStyles: {
                fillColor: [44, 62, 80],
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                halign: 'center', // Centraliza o texto no cabeçalho
            },
            bodyStyles: {
                fillColor: [245, 245, 245],
                textColor: [50, 50, 50],
            },
            alternateRowStyles: {
                fillColor: [255, 255, 255]
            },
            columnStyles: {
                0: { cellWidth: 150 },
                1: { cellWidth: 34 },
                2: { cellWidth: 34 },
                3: { cellWidth: 34 },
            },
        });



        // doc.setTextColor(0, 0, 0);
        // doc.line(5, 285, 205, 285);
        // doc.setFontSize(10);
        // const now = new Date;
        // const hora = now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
        // doc.text("Financeiro ABAC - financeiro.softwareplus.com.br", 5, 290);
        // doc.text("Relatório Gerado em: " + new Date().toLocaleDateString("pt-BR") + " - " + hora, 127, 290, { align: "center" });
        const pageNumber = doc.internal.getNumberOfPages();
        // doc.text(`Página ${pageNumber} de ${totalPagesPlaceholder}`, 228, 290, { align: "right" });
        addFooter(pageNumber, totalPagesPlaceholder);



        doc.putTotalPages(totalPagesPlaceholder);
        doc.save("extrato_bancario.pdf");
    };



    const conteudoHtml = <>
        <form className='container'>
            <div className="row">
                <div className="col-md-2 p-1">
                    <b className="labelDescC">Data Inicial</b>
                    <div className="input-group">
                        <input type="date"
                            id='dataInicial'
                            className="form-control form-control-sm"
                            aria-label="Data Inicial Lançamento" />
                    </div>
                </div>
                <div className="col-md-2 p-1">
                    <b className="labelDescC">Data Final</b>
                    <div className="input-group">
                        <input type="date"
                            id='dataFinal'
                            className="form-control form-control-sm"
                            aria-label="Data Final Lançamento" />
                    </div>
                </div>
            </div>
            <div className="row">
                <div className='col-md-4 mt-1 p-1'>
                    <b className="labelDescC">Conta Bancaria</b>
                    <select class="form-select" aria-label="Conta Corrente" id="idcontacorrente">
                        <option value="0">Todas</option>
                        {contacorrente?.map((CC) => (
                            <option className='text-black' key={CC.ID_CONTA}
                                value={CC.ID_CONTA}>{CC.DESCRICAO}</option>

                        ))}

                    </select>
                </div>
            </div>
            <div className="row">
                <div className='col-md-4 mt-1 p-1'>
                    <b className="labelDescC">Modelo de Relatório</b>
                    <select class="form-select" aria-label="Conta Corrente" id="idcontacorrente">
                        <option value="0">Relatório de Caixa</option>
                    </select>
                </div>
            </div>
            <div className="row">
                <div className='mt-1 p-1 col-md-4'>
                    <button type="button" className="p-1 btn btn-success col-md-6 float-end"
                        onClick={() => fetchGetList()}>Gerar Relatório</button>
                </div>
            </div>
        </form>
    </>

    return (<NavBar conteudo={conteudoHtml} />);
};

export default ExtartoMensal;

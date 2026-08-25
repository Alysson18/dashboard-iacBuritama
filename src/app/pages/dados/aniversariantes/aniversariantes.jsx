import React, { useState, useEffect } from 'react';
import NavBar from '../../../components/menu.jsx';
import api from '../../../config/api.js';
import Loading from '../../../components/loading/loading.js';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';
import { Mask } from '../../../config/Util.js';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const MESES = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

function Aniversariantes() {
    const [pessoas, setPessoas] = useState([]);
    const [mes, setMes] = useState(String(new Date().getMonth() + 1));
    const [controle, setControle] = useState(0);

    useEffect(() => {
        const fetchList = async () => {
            Loading.show('Aguarde....');
            try {
                const res = await api.get(`/pessoas/aniversariantes?mes=${mes}`);
                if (res.data.SUCCESS) {
                    setPessoas(res.data.DATA || []);
                } else {
                    toastr.error(res.data.MESSAGE || 'Erro ao buscar aniversariantes.');
                }
            } catch (error) {
                toastr.error('Erro na comunicação com o servidor.');
            } finally {
                Loading.hide();
            }
        };
        fetchList();
        // mes só é aplicado quando o usuário clica em "Consultar" (setControle), não a cada
        // troca do select.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [controle]);

    function exportarPDF() {
        if (pessoas.length === 0) {
            toastr.warning('Sem dados para gerar PDF!', 'Atenção');
            return;
        }

        const doc = new jsPDF('p', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();

        doc.setFontSize(14);
        doc.text('Aniversariantes do Mês', pageWidth / 2, 15, { align: 'center' });
        doc.setFontSize(10);
        doc.text(`Mês: ${MESES[Number(mes) - 1]}`, 15, 23);
        doc.text(`Total: ${pessoas.length}`, pageWidth - 15, 23, { align: 'right' });
        doc.line(15, 27, pageWidth - 15, 27);

        autoTable(doc, {
            startY: 32,
            head: [['Dia', 'Nome', 'Telefone', 'Tipo Pessoa']],
            body: pessoas.map((p) => ([
                p.DATA_FORMATADA,
                p.NOME,
                Mask.telefone(p.TELEFONE),
                p.MEMBRO === 'S' ? 'Membro' : 'Visitante',
            ])),
            styles: { fontSize: 8, cellPadding: 1.5 },
            headStyles: { fillColor: [44, 62, 80], textColor: [255, 255, 255], halign: 'center' },
            didDrawPage: () => {
                const pageNumber = doc.internal.getNumberOfPages();
                doc.setFontSize(8);
                doc.setTextColor(120);
                doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')} - Página ${pageNumber}`, pageWidth / 2, 290, { align: 'center' });
            }
        });

        doc.save('aniversariantes.pdf');
    }

    const conteudoHtml = (
        <div className='body'>
            <div className='pt-2 mt-2'>
                <div className='text-center'>
                    <h3 className='tituloD mb-1'>Aniversariantes do Mês</h3>
                </div>
                <div className="row mt-4">
                    <div className='col-md-3 mt-1'>
                        <b className="labelDescC">Mês</b>
                        <select className="form-select form-select-sm select" value={mes} onChange={(e) => setMes(e.target.value)}>
                            {MESES.map((nome, idx) => (
                                <option key={idx + 1} value={idx + 1}>{nome}</option>
                            ))}
                        </select>
                    </div>
                    <div className='col-md-2 mt-4'>
                        <button onClick={() => setControle(c => c + 1)}
                            className="btn btn-outline-secondary w-100" type="button">
                            Consultar
                        </button>
                    </div>
                    <div className='col-md-2 mt-4'>
                        <button onClick={() => exportarPDF()}
                            className="btn btn-outline-danger w-100" type="button">
                            <i className="bi bi-file-earmark-pdf me-1"></i>Exportar PDF
                        </button>
                    </div>
                </div>
                <div className="row mt-3">
                    <div className='col-md-12'>
                        <table className="table table-responsive table-sm table-striped w-100">
                            <thead>
                                <tr className="tabela">
                                    <th scope="col">Dia</th>
                                    <th scope="col">Nome</th>
                                    <th scope="col">Telefone</th>
                                    <th scope="col">Tipo Pessoa</th>
                                </tr>
                            </thead>
                            <tbody className='text-center'>
                                {pessoas.length > 0 ? (
                                    pessoas.map((p) => (
                                        <tr key={p.ID_PESSOA}>
                                            <td>{p.DATA_FORMATADA}</td>
                                            <td>{p.NOME}</td>
                                            <td>{Mask.telefone(p.TELEFONE)}</td>
                                            <td>{p.MEMBRO === 'S' ? 'Membro' : 'Visitante'}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="text-center">Nenhum aniversariante nesse mês</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );

    return <NavBar conteudo={conteudoHtml} />;
}

export default Aniversariantes;

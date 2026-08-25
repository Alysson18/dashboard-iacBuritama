import React, { useState, useEffect } from 'react';
import NavBar from '../../../components/menu.jsx';
import api from '../../../config/api.js';
import Loading from '../../../components/loading/loading.js';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';
import { Mask } from '../../../config/Util.js';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function MembrosAusentes() {
    const [pessoas, setPessoas] = useState([]);
    const [dias, setDias] = useState('30');
    const [controle, setControle] = useState(0);

    useEffect(() => {
        const fetchList = async () => {
            Loading.show('Aguarde....');
            try {
                const res = await api.get(`/pessoas/ausentes?dias=${dias}`);
                if (res.data.SUCCESS) {
                    setPessoas(res.data.DATA || []);
                } else {
                    toastr.error(res.data.MESSAGE || 'Erro ao buscar membros ausentes.');
                }
            } catch (error) {
                toastr.error('Erro na comunicação com o servidor.');
            } finally {
                Loading.hide();
            }
        };
        fetchList();
        // dias só é aplicado quando o usuário clica em "Consultar" (setControle), não a cada
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
        doc.text('Membros Ausentes', pageWidth / 2, 15, { align: 'center' });
        doc.setFontSize(10);
        doc.text(`Sem check-in há ${dias}+ dias (ou nunca compareceram)`, 15, 23);
        doc.text(`Total: ${pessoas.length}`, pageWidth - 15, 23, { align: 'right' });
        doc.line(15, 27, pageWidth - 15, 27);

        autoTable(doc, {
            startY: 32,
            head: [['Nome', 'Telefone', 'Último Acesso', 'Dias Ausente']],
            body: pessoas.map((p) => ([
                p.NOME,
                Mask.telefone(p.TELEFONE),
                p.ULTIMO_CHECKIN_FORMATADO || 'Nunca compareceu',
                p.DIAS_AUSENTE === null ? '-' : p.DIAS_AUSENTE,
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

        doc.save('membros_ausentes.pdf');
    }

    const conteudoHtml = (
        <div className='body'>
            <div className='pt-2 mt-2'>
                <div className='text-center'>
                    <h3 className='tituloD mb-1'>Membros Ausentes</h3>
                </div>
                <div className="row mt-4">
                    <div className='col-md-3 mt-1'>
                        <b className="labelDescC">Sem check-in há pelo menos</b>
                        <select className="form-select form-select-sm select" value={dias} onChange={(e) => setDias(e.target.value)}>
                            <option value="15">15 dias</option>
                            <option value="30">30 dias</option>
                            <option value="60">60 dias</option>
                            <option value="90">90 dias</option>
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
                                    <th scope="col">Nome</th>
                                    <th scope="col">Telefone</th>
                                    <th scope="col">Último Acesso</th>
                                    <th scope="col">Dias Ausente</th>
                                </tr>
                            </thead>
                            <tbody className='text-center'>
                                {pessoas.length > 0 ? (
                                    pessoas.map((p) => (
                                        <tr key={p.ID_PESSOA}>
                                            <td>{p.NOME}</td>
                                            <td>{Mask.telefone(p.TELEFONE)}</td>
                                            <td>{p.ULTIMO_CHECKIN_FORMATADO || 'Nunca compareceu'}</td>
                                            <td>{p.DIAS_AUSENTE === null ? '-' : p.DIAS_AUSENTE}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="text-center">Nenhum membro ausente nesse período</td>
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

export default MembrosAusentes;

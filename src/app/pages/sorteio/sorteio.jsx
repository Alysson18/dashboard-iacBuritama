import React, { useState } from 'react';
import api from '../../config/api.js'
import Loading from '../../components/loading/loading.js'
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';
import NavBar from '../../components/menu.jsx';

const SorteioComponent = () => {
    const [sorteado, setSorteado] = useState(null);
    const [sorteados, setSorteados] = useState([]);

    const realizarSorteio = async () => {
        Loading.show('Sorteando vencedor...');
        try {
            // Realiza a chamada para buscar um sorteado
            // Nota: Como o sorteio é aleatório no banco, vamos validar se ele já saiu nesta sessão
            let vencedorValido = null;
            let tentativas = 0;

            while (tentativas < 5) {
                const res = await api.get('/sorteio');
                if (res.data.SUCCESS) {
                    const ganhador = res.data.sorteado;
                    // Verifica se já existe na lista temporária pelo Telefone (ID único)
                    const jaExiste = sorteados.find(s => s.TELEFONE === ganhador.TELEFONE);

                    if (!jaExiste) {
                        vencedorValido = ganhador;
                        break;
                    }
                } else {
                    toastr.info(res.data.MESSAGE || "Nenhuma pessoa disponível para sorteio.");
                    break;
                }
                tentativas++;
            }

            if (vencedorValido) {
                setSorteado(vencedorValido);
                setSorteados(prev => [vencedorValido, ...prev]);
                toastr.success(`Vencedor: ${vencedorValido.NOME}`, "Sorteio Realizado!");
            } else {
                toastr.warning("Não conseguimos encontrar um novo vencedor que ainda não tenha sido sorteado.");
            }
        } catch (err) {
            toastr.error("Erro na conexão com o servidor.");
        } finally {
            Loading.hide();
        }
    };

    const excluirRegistro = (telefone) => {
        setSorteados(prev => prev.filter(item => item.TELEFONE !== telefone));
        toastr.info("Registro removido da lista.");
    };

    const limparLista = () => {
        if (window.confirm("Deseja limpar todo o histórico de sorteios desta sessão?")) {
            setSorteados([]);
            setSorteado(null);
            toastr.success("Lista limpa!");
        }
    };

    const conteudoHtml = (
        <div className="body">
            <div className="pt-2 mt-2">
                <div className="text-center">
                    <h3 className="tituloD mb-1">Sorteio do Check-in</h3>
                    <p className="text-muted">Realize sorteios entre os usuários que fizeram check-in hoje.</p>
                </div>

                <div className="row mt-4 mb-3">
                    <div className="col-md-6 mt-1"></div>
                    <div className="col-md-3 mt-1">
                        <button onClick={limparLista} className="btn btn-danger w-100" type="button">
                            <i className="bi bi-trash me-2"></i>Limpar Lista
                        </button>
                    </div>
                    <div className="col-md-3 mt-1">
                        <button onClick={realizarSorteio} className="btn btn-secondary w-100" type="button">
                            <i className="bi bi-trophy me-2"></i>Novo Sorteio
                        </button>
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-12">
                        <table className="table table-responsive table-sm table-striped table-hover w-100">
                            <thead>
                                <tr className="tabela">
                                    <th scope="col" className="nome inicio-grid">Nome do Vencedor</th>
                                    <th scope="col" className="telefone">Telefone</th>
                                    <th scope="col" className="text-center fim-grid"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {sorteados.length > 0 ? (
                                    sorteados.map((item, index) => (
                                        <tr key={index} className={index === 0 && sorteado ? "table-success" : ""}>
                                            <td className="text-center">
                                                {item.NOME}
                                            </td>
                                            <td className="text-center">{item.TELEFONE}</td>
                                            <td className="text-center">
                                                <img src="../../img/delete.png" alt="Excluir" width="22"
                                                    className="fas mouse fa-edit icone-acao"
                                                    onClick={() => excluirRegistro(item.TELEFONE)} />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="text-center">Nenhum sorteio realizado nesta sessão.</td>
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
};

export default SorteioComponent;

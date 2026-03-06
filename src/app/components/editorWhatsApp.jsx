import React, { useRef } from 'react';

// Recebemos o estado e a função para atualizar o estado vindos do Modal (Pai)
export default function EditorWhatsApp({ conteudo, setConteudo }) {

    const textareaRef = useRef(null);

    const aplicarFormatacao = (simbolo) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const inicio = textarea.selectionStart;
        const fim = textarea.selectionEnd;

        const textoAntes = conteudo.substring(0, inicio);
        const textoSelecionado = conteudo.substring(inicio, fim);
        const textoDepois = conteudo.substring(fim, conteudo.length);

        let novoTexto = '';

        if (textoSelecionado) {
            novoTexto = `${textoAntes}${simbolo}${textoSelecionado}${simbolo}${textoDepois}`;
        } else {
            novoTexto = `${textoAntes}${simbolo}texto${simbolo}${textoDepois}`;
        }

        // Atualiza o estado que está lá no Modal!
        setConteudo(novoTexto);

        setTimeout(() => {
            textarea.focus();
        }, 0);
    };

    return (
        <div className="form-group mb-3">
            <b className="labelDescC">Conteúdo da Mensagem</b>
            <div className="mb-2 d-flex gap-2">
                <button type="button" className="btn btn-sm btn-outline-secondary fw-bold" onClick={() => aplicarFormatacao('*')}>B</button>
                <button type="button" className="btn btn-sm btn-outline-secondary fst-italic" onClick={() => aplicarFormatacao('_')}>I</button>
                <button type="button" className="btn btn-sm btn-outline-secondary text-decoration-line-through" onClick={() => aplicarFormatacao('~')}>S</button>
            </div>

            <textarea
                ref={textareaRef}
                className="form-control"
                rows="6"
                placeholder="Ex: Olá {{1}}, bem-vindo à Igreja Amor e Cuidado!"
                value={conteudo}
                onChange={(e) => setConteudo(e.target.value)}
            />
        </div>
    );
}
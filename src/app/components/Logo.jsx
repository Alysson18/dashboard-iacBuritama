import React from 'react';

// Logo padrão do sistema (placeholder), usada quando a igreja atual não tem LOGO_URL
// cadastrada ainda, ou antes do login (nenhuma igreja selecionada). É só uma cópia
// temporária de um logo já existente no projeto — troque public/img/logo_padrao.png
// pela arte definitiva quando o Alysson definir uma.
const LOGO_PADRAO = '/img/logo_padrao.png';

/**
 * Componente central de exibição de logo, com suporte a multi-igreja.
 *
 * A URL da logo da igreja atualmente selecionada fica em localStorage (chave
 * "igreja_logo_url"), SEM criptografia: precisa estar legível já na tela de login
 * (antes de qualquer autenticação) e precisa sobreviver ao fechamento da aba, então
 * localStorage é usado em vez de sessionStorage.
 */
function Logo({ className = '', width, alt = 'Logo' }) {
    const logoUrl = (typeof window !== 'undefined' && localStorage.getItem('igreja_logo_url')) || LOGO_PADRAO;

    return (
        <img
            className={className}
            src={logoUrl}
            alt={alt}
            width={width}
            onError={(e) => {
                // Se a URL customizada da igreja estiver quebrada, cai para o placeholder padrão
                if (e.target.src.indexOf(LOGO_PADRAO) === -1) {
                    e.target.src = LOGO_PADRAO;
                }
            }}
        />
    );
}

export default Logo;

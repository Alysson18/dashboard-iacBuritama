const Mask = {
    cpf: (value) => {
        return value.toString()
            .replace(/\D/g, '') // substitui qualquer caracter que nao seja numero por nada
            .replace(/(\d{3})(\d)/, '$1.$2') // captura 2 grupos de numero o primeiro de 3 e o segundo de 1, apos capturar o primeiro grupo ele adiciona um ponto antes do segundo grupo de numero
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})/, '$1-$2')
            .replace(/(-\d{2})\d+?$/, '$1')
    },

    cep: (value) => {
        return value.toString()
            .replace(/\D/g, '')
            .replace(/(\d{5})(\d)/, '$1-$2')
    },
    cnpj: (value) => {
        return value.toString()
            .replace(/\D/g, '')
            .replace(/(\d{2})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1/$2')
            .replace(/(\d{4})(\d)/, '$1-$2')
    },

    dinheiro: (value) => {
        return value.toString()
            .replace(/[\D]+/g, '')
            .replace(/([0-9]{2})$/g, ",$1")
    },


    telefone: value => {
        return value // Aplica a máscara fazendo uso de expressões regulares
            .replace(/\D/g, '')
            .replace(/^(\d{1,2})$/g, '($1')
            .replace(/^(\d{2})(\d)/g, '($1) $2')
            .replace(/(\d)(\d{4})$/, '$1-$2')
    },
    somenteNumeros: (value) => {
        return value.toString()
            .replace(/\D/g, '')
    },

    somenteLetras: (value) => {
        return value.toString()
            .replace(/\d/g, '')
    }
}

const Util = {
    sleep: ms => new Promise(r => setTimeout(r, ms)),
}

const Validation = (() => {

    var regexPatterns = {
        // eslint-disable-next-line 
        email: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,

    }

    return {
        email: (args) => Boolean(regexPatterns['email'].test(args.value)),
        regex: regexPatterns
    }
})()



export { Mask, Util, Validation }

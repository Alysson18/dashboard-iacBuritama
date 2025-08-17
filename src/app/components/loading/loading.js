import $ from 'jquery'
import '../loading/loading.css'

export default class Loading {
    static show(message) {
        this.hide()
        $('body').append(this._createLoading(message))
    }

    static hide() {
        $('#loading-container-master-id').remove()
    }

    static _createLoading(message) {
        var containerLoading = document.createElement('div')
        containerLoading.id = 'loading-container-master-id'
        containerLoading.classList.add('loading-container-master')

        var textLoading = document.createElement('p')
        textLoading.textContent = message;

        var loadingProgress = document.createElement('progress')
        loadingProgress.classList.add('pure-material-progress-circular')
        if (sessionStorage.getItem('context') === '1')
            loadingProgress.classList.add('instituicao-color')

        containerLoading.appendChild(loadingProgress)
        containerLoading.appendChild(textLoading)
        return containerLoading
    }

}
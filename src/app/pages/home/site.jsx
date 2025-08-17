import React from 'react';
import './estilo.css';
import NavBar from '../componentes/menu.jsx'

function Site() {
    return <div className="d-flex">
        <NavBar />
        <div id="mt-5 ms-5 ps-5">
            <header className="App-header ms-5 mt-5 ps-5">
                <img src='../img/logo.png' className="App-logo" alt="logo" />
                <p className="Aguarde">
                    Em Manutenção!!!
                </p>
            </header>
        </div>
        {/* <footer className='fixed-bottom'>
            <Footer />
        </footer> */}

    </div >

}
export default Site
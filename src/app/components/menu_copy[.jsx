import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './styles.css';


function Menu() {
    //eslint-disable-next-line}

    const [expanded, setExpanded] = useState(true);

    // const toggleSidebar = () => {
    //     setExpanded(!expanded);
    // };

    function toggleSidebar() {
        const sidebar = document.getElementById("sidebar");
        const content = document.getElementById("content");

        sidebar.classList.toggle("collapsed");
        content.classList.toggle("collapsed");
    }

    document.addEventListener("DOMContentLoaded", function (event) {

        const showNavbar = (toggleId, navId, bodyId, headerId) => {
            const toggle = document.getElementById(toggleId),
                nav = document.getElementById(navId),
                bodypd = document.getElementById(bodyId),
                headerpd = document.getElementById(headerId)

            // Validate that all variables exist
            if (toggle && nav && bodypd && headerpd) {
                toggle.addEventListener('click', () => {
                    // show navbar
                    nav.classList.toggle('show')
                    // change icon
                    toggle.classList.toggle('bx-x')
                    // add padding to body
                    bodypd.classList.toggle('body-pd')
                    // add padding to header
                    headerpd.classList.toggle('body-pd')
                })
            }
        }

        showNavbar('header-toggle', 'nav-bar', 'body-pd', 'header')

        /*===== LINK ACTIVE =====*/
        const linkColor = document.querySelectorAll('.nav_link')

        function colorLink() {
            if (linkColor) {
                linkColor.forEach(l => l.classList.remove('active'))
                this.classList.add('active')
            }
        }
        linkColor.forEach(l => l.addEventListener('click', colorLink))

        // Your code to run since DOM is loaded and ready
    });

    return <>
        <header class="header" id="header">
            <div class="header_toggle"> <i class='bx bx-menu' id="header-toggle"></i> </div>
            <div class="header_img"> <img src="https://i.imgur.com/hczKIze.jpg" alt="" /> </div>
        </header>
        <div class="l-navbar" id="nav-bar">
            <nav class="nav">
                <div> <a href="#" class="nav_logo"> <i class='bx bx-layer nav_logo-icon'></i> <span class="nav_logo-name">BBBootstrap</span> </a>
                    <div class="nav_list"> <a href="#" class="nav_link active"> <i class='bx bx-grid-alt nav_icon'></i> <span class="nav_name">Dashboard</span> </a> <a href="#" class="nav_link"> <i class='bx bx-user nav_icon'></i> <span class="nav_name">Users</span> </a> <a href="#" class="nav_link"> <i class='bx bx-message-square-detail nav_icon'></i> <span class="nav_name">Messages</span> </a> <a href="#" class="nav_link"> <i class='bx bx-bookmark nav_icon'></i> <span class="nav_name">Bookmark</span> </a> <a href="#" class="nav_link"> <i class='bx bx-folder nav_icon'></i> <span class="nav_name">Files</span> </a> <a href="#" class="nav_link"> <i class='bx bx-bar-chart-alt-2 nav_icon'></i> <span class="nav_name">Stats</span> </a> </div>
                </div> <a href="#" class="nav_link"> <i class='bx bx-log-out nav_icon'></i> <span class="nav_name">SignOut</span> </a>
            </nav>
        </div>


    </>

    // return <div class="d-flex flex-column flex-shrink-0 p-3 bg-body-tertiary sidebar text-white">
    //     <a href="/" class="d-flex align-items-center mb-3 mb-md-0 me-md-auto link-body-emphasis text-decoration-none">
    //         <img src="../../img/logo-abac.png" width='150px' />
    //     </a>
    //     <hr />
    //     <ul class="nav nav-pills flex-column mb-auto text-white">
    //         <li class="nav-item">
    //             <a href="#" class="nav-link link-body-emphasis text-white" aria-current="page">
    //                 <i class="bi bi-house-door me-2"></i>
    //                 Home
    //             </a>
    //         </li>
    //         <li>
    //             <a href="#" class="nav-link link-body-emphasis text-white">
    //                 <i class="bi bi-speedometer2 me-2"></i>
    //                 Dashboard
    //             </a>
    //         </li>
    //         <li>
    //             <a href="#" class="nav-link link-body-emphasis text-white">
    //                 <i class="bi bi-table me-2"></i>
    //                 Orders
    //             </a>
    //         </li>
    //         <li>
    //             <a href="#" class="nav-link link-body-emphasis text-white">
    //                 <i class="bi bi-gear me-2"></i>
    //                 Setings
    //             </a>
    //         </li>
    //         <li>
    //             <a href="#" class="nav-link link-body-emphasis text-white">
    //                 <i class="bi bi-people me-2"></i>
    //                 Customers
    //             </a>
    //         </li>
    //     </ul>
    //     <hr />
    //     <div class="dropdown text-white">
    //         <a href="#" class="d-flex align-items-center link-body-emphasis text-decoration-none dropdown-toggle text-white" data-bs-toggle="dropdown" aria-expanded="false">
    //             <img src="https://github.com/mdo.png" alt="" width="32" height="32" class="rounded-circle me-2" />
    //             <strong>mdo</strong>
    //         </a>
    //         <ul class="dropdown-menu text-small shadow">
    //             <li><a class="dropdown-item" href="#">New project...</a></li>
    //             <li><a class="dropdown-item" href="#">Settings</a></li>
    //             <li><a class="dropdown-item" href="#">Profile</a></li>
    //             <li><hr class="dropdown-divider" /></li>
    //             <li><a class="dropdown-item" href="#">Sign out</a></li>
    //         </ul>
    //     </div>
    // </div>
    // return <div
    //     className={`bg-primary text-white p-3 sidebar sidebar-transition 
    //     ${expanded ? "sidebar-expanded" : "sidebar-collapsed"}`}
    //     onClick={toggleSidebar}>
    //     {/* Logo */}

    //     <div className="d-flex justify-content-center mb-3">
    //         <img
    //             src='../../img/logo.png'
    //             alt="Logo"
    //             className="logo"

    //         />
    //     </div>
    //     <ul className="list-unstyled">
    //         <li className="my-2 ">
    //             <Link to='/home' className='nav-item nav-links'>
    //                 <i className="bi bi-house-door mouse"></i>
    //                 {expanded && <span class="ms-2 mouse" href="#">Home</span>}
    //             </Link>
    //         </li>
    //         <li className="my-2">
    //             <i className="bi bi-gear"></i>
    //             {expanded && <span className="ms-2">Settings</span>}
    //         </li>
    //         <li className="my-2">
    //             <i className="bi bi-box-arrow-in-right"></i>
    //             {expanded && <span className="ms-2">Logout</span>}
    //         </li>
    //     </ul>

    // </div>

}
export default Menu

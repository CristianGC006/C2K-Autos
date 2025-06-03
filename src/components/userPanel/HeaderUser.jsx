import React from 'react';
import Logo from '../../assets/C2K-LogoNoBackground.png'; // Ajusta la ruta según tu estructura
import './header.css';

const HeaderUser = () => {
  return (
    <header className="header-user">
      <div className="header-container">
        {/* Logo y nombre de la empresa */}
        <div className="header-logo-section">
          <div className="logo-container">
            <img src={Logo} alt="C2K Autos Logo" className="header-logo" />
          </div>
          <h1 className="company-name">C2K</h1>
        </div>

        {/* Menú de navegación */}
        <nav className="header-nav">
          <ul className="nav-menu">
            <li className="nav-item">
              <a href="#reservas" className="nav-link">
                Reservas
              </a>
            </li>
            <li className="nav-item">
              <a href="#mensajes" className="nav-link">
                Mensajes
              </a>
            </li>
            <li className="nav-item">
              <a href="#ajustes" className="nav-link">
                Ajustes
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default HeaderUser;

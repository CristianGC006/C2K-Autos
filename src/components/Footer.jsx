import React from 'react';
import './components.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section about">
          <h3>Sobre C2K Autos</h3>
          <p>
            C2K Autos es tu aliado en movilidad con sabor paisa. Alquila con confianza, flexibilidad y estilo.
          </p>
        </div>
        <div className="footer-section links">
          <h3>Enlaces Rápidos</h3>
          <ul>
            <li><a href="#about">Sobre Nosotros</a></li>
            <li><a href="#services">Servicios</a></li>
            <li><a href="#contact">Contacto</a></li>
            <li><a href="#faq">Preguntas Frecuentes</a></li>
          </ul>
        </div>
        <div className="footer-section social">
          <h3>Síguenos</h3>
          <div className="social-icons">
            <a href="https://facebook.com"><i className="fab fa-facebook-f">C2K Autos </i></a>
            <a href="https://twitter.com"><i className="fab fa-twitter">C2K Autos </i></a>
            <a href="https://instagram.com"><i className="fab fa-instagram">C2K Autos </i></a>
            <a href="https://linkedin.com"><i className="fab fa-linkedin-in">C2K Autos </i></a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        &copy; 2025 C2K Autos | Todos los derechos reservados
      </div>
    </footer>
  );
};

export default Footer;
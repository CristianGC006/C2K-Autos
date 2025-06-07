import { useNavigate } from "react-router-dom";
import { redirectionAlert } from "../../helpers/functions";
import "./aside.css";
import userAvatar from "../../assets/C2K-LogoNoBackground.png";

const Aside = ({ activeSection, setActiveSection }) => {
  let redirection = useNavigate();
  let customer = JSON.parse(localStorage.getItem("User")) || {};

  function logOut() {
    localStorage.removeItem("Token");
    localStorage.removeItem("User");
    redirectionAlert(redirection, "C2K", "Hasta luego, vuelva pronto", "info", "/");
  }


  return (
    <aside className="user-panel-sidebar">
      <div className="user-profile">
        <div className="user-avatar">
          <img src={userAvatar} alt="Avatar de usuario" />
          <div className="avatar-status"></div>
        </div>
        <h2 className="welcome-message">
          ¡Hola, <br />
          <span className="user-name">{customer.name || "Usuario"}!</span>
        </h2>
        <button className="edit-profile-btn" onClick={() => setActiveSection("editar")}>
          <span>✏️</span> Editar perfil
        </button>      </div>

      <nav className="sidebar-nav">
        <button 
          className={`nav-item ${activeSection === "inicio" ? "active" : ""}`}
          onClick={() => setActiveSection("inicio")}
        >
          <span className="nav-icon">🏠</span>
          <span className="nav-text">Dashboard</span>
        </button>
        <button 
          className={`nav-item ${activeSection === "rentados" ? "active" : ""}`}
          onClick={() => setActiveSection("rentados")}
        >
          <span className="nav-icon">🚗</span>
          <span className="nav-text">Mis Vehículos</span>
        </button>
        <button 
          className={`nav-item ${activeSection === "rentar" ? "active" : ""}`}
          onClick={() => setActiveSection("rentar")}
        >
          <span className="nav-icon">🛒</span>
          <span className="nav-text">Alquilar</span>
        </button>
        <button 
          className={`nav-item ${activeSection === "editar" ? "active" : ""}`}
          onClick={() => setActiveSection("editar")}
        >
          <span className="nav-icon">⚙️</span>
          <span className="nav-text">Configuración</span>
        </button>
        <div className="nav-divider"></div>
        <button onClick={logOut} className="nav-item logout">
          <span className="nav-icon">🚪</span>
          <span className="nav-text">Cerrar sesión</span>
        </button>
      </nav>
    </aside>
  );
};

export default Aside;
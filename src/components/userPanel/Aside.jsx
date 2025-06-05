import { useNavigate } from "react-router-dom";
import { redirectionAlert } from "../../helpers/functions";
import "./aside.css";
import userAvatar from "../../assets/C2K-LogoNoBackground.png"; // Asegúrate de tener esta imagen o usa otra

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
        </div>
        <h2 className="welcome-message">¡Bienvenido, {customer.name || "Usuario"}!</h2>
        <button className="edit-profile-btn" onClick={() => setActiveSection("editar")}>
          Editar perfil
        </button>
      </div>

      <div className="user-level">
        <h3>Nivel Oro</h3>
        <div className="level-indicator">
          <span className="level-progress" style={{ width: "75%" }}></span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <button 
          className={`nav-item ${activeSection === "inicio" ? "active" : ""}`}
          onClick={() => setActiveSection("inicio")}
        >
          Inicio
        </button>
        <button 
          className={`nav-item ${activeSection === "rentados" ? "active" : ""}`}
          onClick={() => setActiveSection("rentados")}
        >
          Coches Alquilados
        </button>
        <button 
          className={`nav-item ${activeSection === "rentar" ? "active" : ""}`}
          onClick={() => setActiveSection("rentar")}
        >
          Rentar Coches
        </button>
        <button 
          className={`nav-item ${activeSection === "editar" ? "active" : ""}`}
          onClick={() => setActiveSection("editar")}
        >
          Actualizar datos
        </button>
        <button onClick={logOut} className="nav-item logout">
          Cerrar sesión
        </button>
      </nav>
    </aside>
  );
};

export default Aside;
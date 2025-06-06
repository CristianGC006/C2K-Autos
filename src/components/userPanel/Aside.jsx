import { useNavigate } from "react-router-dom";
import { redirectionAlert } from "../../helpers/functions";
import "./aside.css";
import userAvatar from "../../assets/C2K-LogoNoBackground.png";

const Aside = ({ activeSection, setActiveSection, isMobileMenuOpen, setIsMobileMenuOpen }) => {
  let redirection = useNavigate();
  let customer = JSON.parse(localStorage.getItem("User")) || {};

  function logOut() {
    localStorage.removeItem("Token");
    localStorage.removeItem("User");
    redirectionAlert(redirection, "C2K", "Hasta luego, vuelva pronto", "info", "/");
  }

  // Función para obtener el nivel del usuario basado en algún criterio
  const getUserLevel = () => {
    // Aquí podrías usar datos reales del usuario
    return {
      name: "Oro",
      progress: 75,
      color: "#ffd700"
    };
  };

  const userLevel = getUserLevel();
  return (
    <aside className={`user-panel-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
      <div className="user-profile">
        <div className="user-avatar">
          <img src={userAvatar} alt="Avatar de usuario" />
          <div className="avatar-status"></div>
        </div>
        <h2 className="welcome-message">
          ¡Hola, <br />
          <span className="user-name">{customer.name || "Usuario"}!</span>
        </h2>
        <button className="edit-profile-btn" onClick={() => {
          setActiveSection("editar");
          setIsMobileMenuOpen && setIsMobileMenuOpen(false);
        }}>
          <span>✏️</span> Editar perfil
        </button>
      </div>

      <div className="user-level">
        <div className="level-header">
          <span className="level-icon">👑</span>
          <h3>Nivel {userLevel.name}</h3>
        </div>
        <div className="level-indicator">
          <div 
            className="level-progress" 
            style={{ 
              width: `${userLevel.progress}%`,
              backgroundColor: userLevel.color 
            }}
          ></div>
        </div>
        <p className="level-text">{userLevel.progress}% completado</p>
      </div>

      <nav className="sidebar-nav">        <button 
          className={`nav-item ${activeSection === "inicio" ? "active" : ""}`}
          onClick={() => {
            setActiveSection("inicio");
            setIsMobileMenuOpen && setIsMobileMenuOpen(false);
          }}
        >
          <span className="nav-icon">🏠</span>
          <span className="nav-text">Dashboard</span>
        </button>        <button 
          className={`nav-item ${activeSection === "rentados" ? "active" : ""}`}
          onClick={() => {
            setActiveSection("rentados");
            setIsMobileMenuOpen && setIsMobileMenuOpen(false);
          }}
        >
          <span className="nav-icon">🚗</span>
          <span className="nav-text">Mis Vehículos</span>
        </button>        <button 
          className={`nav-item ${activeSection === "rentar" ? "active" : ""}`}
          onClick={() => {
            setActiveSection("rentar");
            setIsMobileMenuOpen && setIsMobileMenuOpen(false);
          }}
        >
          <span className="nav-icon">🛒</span>
          <span className="nav-text">Alquilar</span>
        </button>        <button 
          className={`nav-item ${activeSection === "editar" ? "active" : ""}`}
          onClick={() => {
            setActiveSection("editar");
            setIsMobileMenuOpen && setIsMobileMenuOpen(false);
          }}
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
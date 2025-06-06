
import { useState } from "react";
import Aside from "../components/userPanel/Aside";
import Panel from "../components/userPanel/Panel";
import "../components/userPanel/userHome.css";

const UserHome = () => {
  const [activeSection, setActiveSection] = useState("inicio");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("User")) || {};
  return (
    <div className="aplicacion">      {/* Botón hamburguesa para móvil */}
      <button 
        className={`mobile-menu-toggle ${isMobileMenuOpen ? 'active' : ''}`}
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
      
      {/* Overlay para cerrar menú en móvil */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}
      
      <div className="user-panel-container">
        <Aside 
          activeSection={activeSection} 
          setActiveSection={setActiveSection}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />
        <Panel activeSection={activeSection} setActiveSection={setActiveSection} user={user} />
      </div>
    </div>
  );
};

export default UserHome;
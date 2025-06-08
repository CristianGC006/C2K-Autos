import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import './LogisticOperatorHome.css'; // Crea un CSS similar al de admin

const LogisticOperatorLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("Token");
    localStorage.removeItem("User");
    navigate('/loginLogisticOp');
  };

  const isActiveRoute = (path) => location.pathname.includes(path);

  const operatorUser = JSON.parse(localStorage.getItem("User")) || { name: "Operador" };

  return (
    <div className="logistic-operator-layout">
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="profile">
          <img src="/C2K-LogoNoBackground.png" alt="Operador" />
          <h2>¡Hola, <span>{operatorUser.name}</span>!</h2>
          <div className="badge">Operador Logístico</div>
        </div>
        <nav className="nav-menu-logistic">
          <button
            className={`nav-item ${isActiveRoute('/logisticOpHome/vehicles') ? 'active' : ''}`}
            onClick={() => navigate('/logisticOpHome/vehicles')}
          >
            🚗 Vehículos
          </button>
          {/* Agrega más botones si necesitas más secciones */}
          <button onClick={handleLogout} className="nav-item logout">
            🚪 Cerrar Sesión
          </button>
        </nav>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
      <div className="sidebar-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
        {isSidebarOpen ? '❌' : '☰'}
      </div>
    </div>
  );
};

export default LogisticOperatorLayout;
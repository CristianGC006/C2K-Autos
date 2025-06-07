import { useState } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import './AdminHome.css';

const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const handleLogout = () => {
        localStorage.removeItem("Token");
        localStorage.removeItem("Admin");
        navigate('/adminLogin');
    };

    const adminUser = JSON.parse(localStorage.getItem("Admin")) || { name: "Administrador" };



    // Función para determinar si una ruta está activa
    const isActiveRoute = (path) => {
        return location.pathname.includes(path);
    };

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                {/* Perfil del Admin */}
                <div className="admin-profile">
                    <div className="admin-avatar">
                        <img src="/C2K-LogoNoBackground.png" alt="Admin Avatar" />
                        <div className="avatar-status"></div>
                    </div>
                    <h2 className="welcome-message">
                        ¡Hola, <br />
                        <span className="admin-name">{adminUser.name}</span>!
                    </h2>
                    <div className="admin-badge">
                        <span>👑</span> Administrador
                    </div>
                </div>


                {/* Navegación Principal */}
                <nav className="admin-nav">
                    <button 
                        className={`nav-item ${isActiveRoute('/admin/dashboard') ? 'active' : ''}`}
                        onClick={() => navigate('/admin/dashboard')}
                    >
                        <span className="nav-icon">📊</span>
                        <span className="nav-text">Dashboard</span>
                    </button>
                    
                    <div className="nav-section">
                        <h4 className="nav-section-title">Gestión de Usuarios</h4>
                        <button 
                            className={`nav-item ${isActiveRoute('/admin/customers') ? 'active' : ''}`}
                            onClick={() => navigate('/admin/customers')}
                        >
                            <span className="nav-icon">👥</span>
                            <span className="nav-text">Clientes</span>
                        </button>
                        <button 
                            className={`nav-item ${isActiveRoute('/admin/admins') ? 'active' : ''}`}
                            onClick={() => navigate('/admin/admins')}
                        >
                            <span className="nav-icon">👑</span>
                            <span className="nav-text">Administradores</span>
                        </button>
                        <button 
                            className={`nav-item ${isActiveRoute('/admin/assessors') ? 'active' : ''}`}
                            onClick={() => navigate('/admin/assessors')}
                        >
                            <span className="nav-icon">💼</span>
                            <span className="nav-text">Asesores</span>
                        </button>
                        <button 
                            className={`nav-item ${isActiveRoute('/admin/logistics') ? 'active' : ''}`}
                            onClick={() => navigate('/admin/logistics')}
                        >
                            <span className="nav-icon">📦</span>
                            <span className="nav-text">Op. Logístico</span>
                        </button>                    </div>

                    <div className="nav-section">
                        <h4 className="nav-section-title">Gestión de Inventario</h4>
                        <button 
                            className={`nav-item ${isActiveRoute('/admin/vehicles') ? 'active' : ''}`}
                            onClick={() => navigate('/admin/vehicles')}
                        >
                            <span className="nav-icon">🚗</span>
                            <span className="nav-text">Vehículos</span>
                        </button>
                    </div>

                    <button 
                        className={`nav-item ${isActiveRoute('/admin/reports') ? 'active' : ''}`}
                        onClick={() => navigate('/admin/reports')}
                    >
                        <span className="nav-icon">📈</span>
                        <span className="nav-text">Reportes</span>
                    </button>
                    <button 
                        className={`nav-item ${isActiveRoute('/admin/settings') ? 'active' : ''}`}
                        onClick={() => navigate('/admin/settings')}
                    >
                        <span className="nav-icon">⚙️</span>
                        <span className="nav-text">Configuración</span>
                    </button>
                    
                    <div className="nav-divider"></div>
                    <button onClick={handleLogout} className="nav-item logout">
                        <span className="nav-icon">🚪</span>
                        <span className="nav-text">Cerrar Sesión</span>
                    </button>
                </nav>
            </aside>

            <main className="admin-main">
                {/* Aquí se renderizan los componentes hijos según la ruta */}
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;

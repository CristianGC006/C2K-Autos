import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import VehicleManagement from './VehicleManagement';
import '../../styles/admin/AdminMain.css';

const AdminHome = () => {
    const navigate = useNavigate();
    const [selectedSection, setSelectedSection] = useState('dashboard');
    const [selectedCrudType, setSelectedCrudType] = useState('customers');

    const handleLogout = () => {
        localStorage.removeItem("Token");
        localStorage.removeItem("Admin");
        navigate('/adminLogin');
    };

    const adminUser = JSON.parse(localStorage.getItem("Admin")) || { name: "Administrador" };

    // Función para obtener estadísticas del admin
    const getAdminStats = () => {
        return {
            level: "Master Admin",
            progress: 95,
            color: "#ffd700"
        };
    };

    const adminStats = getAdminStats();

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                {/* Perfil del Admin */}
                <div className="admin-profile">                    <div className="admin-avatar">
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

                {/* Nivel del Admin */}
                <div className="admin-level">
                    <div className="level-header">
                        <span className="level-icon">⚡</span>
                        <h3>{adminStats.level}</h3>
                    </div>
                    <div className="level-indicator">
                        <div 
                            className="level-progress"
                            style={{ 
                                width: `${adminStats.progress}%`,
                                backgroundColor: adminStats.color 
                            }}
                        ></div>
                    </div>
                    <p className="level-text">{adminStats.progress}% Control del Sistema</p>
                </div>

                {/* Navegación Principal */}
                <nav className="admin-nav">
                    <button 
                        className={`nav-item ${selectedSection === 'dashboard' ? 'active' : ''}`}
                        onClick={() => setSelectedSection('dashboard')}
                    >
                        <span className="nav-icon">📊</span>
                        <span className="nav-text">Dashboard</span>
                    </button>                    <button 
                        className={`nav-item ${selectedSection === 'vehicles' ? 'active' : ''}`}
                        onClick={() => setSelectedSection('vehicles')}
                    >
                        <span className="nav-icon">🚗</span>
                        <span className="nav-text">Vehículos</span>
                    </button>
                    <button 
                        className={`nav-item ${selectedSection === 'crud' ? 'active' : ''}`}
                        onClick={() => setSelectedSection('crud')}
                    >
                        <span className="nav-icon">⚙️</span>
                        <span className="nav-text">Gestión CRUD</span>
                    </button>
                    <button 
                        className={`nav-item ${selectedSection === 'reports' ? 'active' : ''}`}
                        onClick={() => setSelectedSection('reports')}
                    >
                        <span className="nav-icon">📈</span>
                        <span className="nav-text">Reportes</span>
                    </button>
                    <button 
                        className={`nav-item ${selectedSection === 'settings' ? 'active' : ''}`}
                        onClick={() => setSelectedSection('settings')}
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
                {selectedSection === 'dashboard' && (
                    <div className="dashboard-content">
                        <header className="content-header">
                            <h1>📊 Dashboard Administrativo</h1>
                            <p>Panel de control y estadísticas del sistema C2K</p>
                        </header>
                        
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon">👥</div>
                                <div className="stat-info">
                                    <h3>1,247</h3>
                                    <p>Usuarios Totales</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">🚗</div>
                                <div className="stat-info">
                                    <h3>89</h3>
                                    <p>Vehículos Disponibles</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">📋</div>
                                <div className="stat-info">
                                    <h3>156</h3>
                                    <p>Rentas Activas</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">🏢</div>
                                <div className="stat-info">
                                    <h3>12</h3>
                                    <p>Sucursales</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {selectedSection === 'crud' && (
                    <div className="crud-content">
                        <header className="content-header">
                            <h1>⚙️ Gestión CRUD</h1>
                            <p>Administrar entidades del sistema</p>
                        </header>                        {/* Selector de tipo de CRUD */}
                        <div className="crud-selector">
                            <button 
                                className={`crud-type-btn ${selectedCrudType === 'customers' ? 'active' : ''}`}
                                onClick={() => setSelectedCrudType('customers')}
                            >
                                <span className="crud-icon">👥</span>
                                <span>Clientes</span>
                            </button>
                            <button 
                                className={`crud-type-btn ${selectedCrudType === 'vehicles' ? 'active' : ''}`}
                                onClick={() => setSelectedCrudType('vehicles')}
                            >
                                <span className="crud-icon">🚗</span>
                                <span>Vehículos</span>
                            </button>
                            <button 
                                className={`crud-type-btn ${selectedCrudType === 'admin' ? 'active' : ''}`}
                                onClick={() => setSelectedCrudType('admin')}
                            >
                                <span className="crud-icon">👑</span>
                                <span>Administradores</span>
                            </button>
                            <button 
                                className={`crud-type-btn ${selectedCrudType === 'assessor' ? 'active' : ''}`}
                                onClick={() => setSelectedCrudType('assessor')}
                            >
                                <span className="crud-icon">💼</span>
                                <span>Asesores</span>
                            </button>
                            <button 
                                className={`crud-type-btn ${selectedCrudType === 'logistic' ? 'active' : ''}`}
                                onClick={() => setSelectedCrudType('logistic')}
                            >
                                <span className="crud-icon">📦</span>
                                <span>Op. Logístico</span>
                            </button>
                        </div>

                        {/* Área de contenido CRUD */}
                        <div className="crud-area">                            <div className="crud-header">
                                <h2>
                                    {selectedCrudType === 'customers' && '👥 Gestión de Clientes'}
                                    {selectedCrudType === 'vehicles' && '🚗 Gestión de Vehículos'}
                                    {selectedCrudType === 'admin' && '👑 Gestión de Administradores'}
                                    {selectedCrudType === 'assessor' && '💼 Gestión de Asesores'}
                                    {selectedCrudType === 'logistic' && '📦 Gestión de Operadores Logísticos'}
                                </h2>
                                {selectedCrudType !== 'vehicles' && (
                                    <button className="add-btn">
                                        <span>➕</span> Agregar Nuevo
                                    </button>
                                )}
                            </div>                            <div className="crud-table-container">
                                {selectedCrudType === 'vehicles' ? (
                                    <VehicleManagement />
                                ) : (
                                    <div className="crud-placeholder">
                                        <div className="placeholder-icon">
                                            {selectedCrudType === 'customers' && '👥'}
                                            {selectedCrudType === 'admin' && '👑'}
                                            {selectedCrudType === 'assessor' && '💼'}
                                            {selectedCrudType === 'logistic' && '📦'}
                                        </div>
                                        <h3>Área de {selectedCrudType === 'customers' ? 'Clientes' : 
                                                   selectedCrudType === 'admin' ? 'Administradores' : 
                                                   selectedCrudType === 'assessor' ? 'Asesores' : 
                                                   'Operadores Logísticos'}</h3>
                                        <p>La lógica de CRUD será implementada por tu compañero.</p>
                                        <p>Esta área contendrá la tabla con datos y controles de edición.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>                )}

                {selectedSection === 'vehicles' && (
                    <div className="vehicles-content">
                        <header className="content-header">
                            <h1>🚗 Gestión de Vehículos</h1>
                            <p>Administrar el inventario de vehículos del sistema</p>
                        </header>
                        
                        <VehicleManagement />
                    </div>
                )}

                {selectedSection === 'reports' && (
                    <div className="reports-content">
                        <header className="content-header">
                            <h1>📈 Reportes del Sistema</h1>
                            <p>Análisis y métricas de rendimiento</p>
                        </header>
                        
                        <div className="reports-placeholder">
                            <div className="placeholder-icon">📊</div>
                            <h3>Área de Reportes</h3>
                            <p>Aquí se mostrarán gráficos y estadísticas detalladas.</p>
                        </div>
                    </div>
                )}

                {selectedSection === 'settings' && (
                    <div className="settings-content">
                        <header className="content-header">
                            <h1>⚙️ Configuración del Sistema</h1>
                            <p>Ajustes generales y preferencias</p>
                        </header>
                        
                        <div className="settings-placeholder">
                            <div className="placeholder-icon">⚙️</div>
                            <h3>Configuración</h3>
                            <p>Panel de configuración del sistema y preferencias del administrador.</p>
                        </div>
                    </div>
                )}            </main>
        </div>
    );
};

export default AdminHome;
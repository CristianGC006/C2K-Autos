import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VehicleManagement from './VehicleManagement';
import { getDashboardStats, getRecentActivity, formatTimestamp } from '../../services/DashboardService';
import './AdminHome.css';

const AdminHome = () => {
    const navigate = useNavigate();
    const [selectedSection, setSelectedSection] = useState('dashboard');
    const [selectedCrudType, setSelectedCrudType] = useState('customers');
    
    // Estados para el dashboard
    const [dashboardStats, setDashboardStats] = useState({
        totalUsers: 0,
        totalAssessors: 0,
        totalVehicles: 0,
        availableVehicles: 0,
        activeRentals: 0,
        totalBranches: 0
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [isLoadingStats, setIsLoadingStats] = useState(true);
    const [statsError, setStatsError] = useState(null);

    // Cargar datos del dashboard
    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                setIsLoadingStats(true);
                setStatsError(null);
                
                const [stats, activity] = await Promise.all([
                    getDashboardStats(),
                    getRecentActivity()
                ]);
                
                setDashboardStats(stats);
                setRecentActivity(activity);
            } catch (error) {
                console.error('Error loading dashboard data:', error);
                setStatsError('Error al cargar las estadísticas del dashboard');
            } finally {
                setIsLoadingStats(false);
            }
        };

        // Cargar datos al montar el componente y cuando se selecciona dashboard
        if (selectedSection === 'dashboard') {
            loadDashboardData();
        }
    }, [selectedSection]);

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

            <main className="admin-main">                {selectedSection === 'dashboard' && (
                    <div className="dashboard-content">
                        <header className="content-header">
                            <div className="header-info">
                                <h1>📊 Dashboard Administrativo</h1>
                                <p>Panel de control y estadísticas del sistema C2K</p>
                            </div>
                            {!isLoadingStats && (
                                <button 
                                    onClick={() => {
                                        setSelectedSection('dashboard');
                                        window.location.reload();
                                    }}
                                    className="refresh-btn"
                                >
                                    🔄 Actualizar
                                </button>
                            )}
                        </header>
                        
                        {/* Mensaje de error si existe */}
                        {statsError && (
                            <div className="error-message">
                                <span>❌</span>
                                <p>{statsError}</p>
                            </div>
                        )}
                        
                        {/* Estadísticas principales */}
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon">👥</div>
                                <div className="stat-info">
                                    <h3>{isLoadingStats ? '...' : dashboardStats.totalUsers.toLocaleString()}</h3>
                                    <p>Clientes Totales</p>
                                    {!isLoadingStats && (
                                        <small>Registrados en el sistema</small>
                                    )}
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">💼</div>
                                <div className="stat-info">
                                    <h3>{isLoadingStats ? '...' : dashboardStats.totalAssessors.toLocaleString()}</h3>
                                    <p>Asesores Comerciales</p>
                                    {!isLoadingStats && (
                                        <small>Activos: {dashboardStats.activeAssessors}</small>
                                    )}
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">🚗</div>
                                <div className="stat-info">
                                    <h3>{isLoadingStats ? '...' : dashboardStats.totalVehicles.toLocaleString()}</h3>
                                    <p>Vehículos en Flota</p>
                                    {!isLoadingStats && (
                                        <small>Disponibles: {dashboardStats.availableVehicles}</small>
                                    )}
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">🏢</div>
                                <div className="stat-info">
                                    <h3>{isLoadingStats ? '...' : dashboardStats.totalBranches}</h3>
                                    <p>Sucursales</p>
                                    {!isLoadingStats && (
                                        <small>En operación</small>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Actividad reciente */}
                        <div className="recent-activity">
                            <h2>📈 Actividad Reciente</h2>
                            {isLoadingStats ? (
                                <div className="loading-activity">
                                    <div className="loading-spinner"></div>
                                    <p>Cargando actividad reciente...</p>
                                </div>
                            ) : (
                                <div className="activity-list">
                                    {recentActivity.length > 0 ? (
                                        recentActivity.map((activity, index) => (
                                            <div key={index} className="activity-item">
                                                <span className="activity-icon">{activity.icon}</span>
                                                <div className="activity-info">
                                                    <p><strong>{activity.title}:</strong> {activity.description}</p>
                                                    <small>{formatTimestamp(activity.timestamp)}</small>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="no-activity">
                                            <p>No hay actividad reciente para mostrar</p>
                                        </div>
                                    )}
                                </div>
                            )}
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
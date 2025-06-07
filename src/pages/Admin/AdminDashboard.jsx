const AdminDashboard = () => {
    return (
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
                        <small>+12% este mes</small>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">🚗</div>
                    <div className="stat-info">
                        <h3>89</h3>
                        <p>Vehículos Disponibles</p>
                        <small>-3% esta semana</small>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">📋</div>
                    <div className="stat-info">
                        <h3>156</h3>
                        <p>Rentas Activas</p>
                        <small>+25% este mes</small>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">🏢</div>
                    <div className="stat-info">
                        <h3>12</h3>
                        <p>Sucursales</p>
                        <small>Sin cambios</small>
                    </div>
                </div>
            </div>

            {/* Actividad Reciente */}
            <div className="recent-activity">
                <h2>Actividad Reciente</h2>
                <div className="activity-list">
                    <div className="activity-item">
                        <span className="activity-icon">👤</span>
                        <div className="activity-info">
                            <p><strong>Nuevo cliente registrado:</strong> Juan Pérez</p>
                            <small>Hace 2 horas</small>
                        </div>
                    </div>
                    <div className="activity-item">
                        <span className="activity-icon">🚗</span>
                        <div className="activity-info">
                            <p><strong>Vehículo rentado:</strong> Toyota Corolla 2023</p>
                            <small>Hace 4 horas</small>
                        </div>
                    </div>
                    <div className="activity-item">
                        <span className="activity-icon">💼</span>
                        <div className="activity-info">
                            <p><strong>Nuevo asesor agregado:</strong> María García</p>
                            <small>Ayer</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

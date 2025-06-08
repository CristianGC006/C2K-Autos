import { useState, useEffect } from 'react';
import { getDashboardStats, getRecentActivity, formatTimestamp } from '../../services/DashboardService';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        availableVehicles: 0,
        activeRentals: 0,
        totalBranches: 3
    });
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [dashboardStats, recentActivity] = await Promise.all([
                getDashboardStats(),
                getRecentActivity()
            ]);
            
            setStats(dashboardStats);
            setActivities(recentActivity);
            setError(null);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError('Error al cargar los datos del dashboard');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="dashboard-content">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Cargando dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-content">
                <div className="error-container">
                    <p>Error: {error}</p>
                    <button onClick={fetchDashboardData} className="retry-btn">
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }    return (
        <div className="dashboard-content">
            <header className="content-header">
                <h1>📊 Dashboard Administrativo</h1>
                <p>Panel de control y estadísticas del sistema C2K</p>
            </header>
            
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">👥</div>
                    <div className="stat-info">
                        <h3>{stats.totalUsers?.toLocaleString() || '0'}</h3>
                        <p>Clientes Registrados</p>
                        <small>Total en el sistema</small>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">🚗</div>
                    <div className="stat-info">
                        <h3>{stats.availableVehicles || '0'}</h3>
                        <p>Vehículos Disponibles</p>
                        <small>De {stats.totalVehicles || '0'} totales</small>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">📋</div>
                    <div className="stat-info">
                        <h3>{stats.activeRentals || '0'}</h3>
                        <p>Rentas Activas</p>
                        <small>Simulado</small>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">🏢</div>
                    <div className="stat-info">
                        <h3>{stats.totalBranches || '3'}</h3>
                        <p>Sucursales</p>
                        <small>Ubicaciones activas</small>
                    </div>
                </div>
            </div>

            {/* Actividad Reciente */}
            <div className="recent-activity">
                <h2>Actividad Reciente</h2>
                <div className="activity-list">
                    {activities.length > 0 ? (
                        activities.map((activity, index) => (
                            <div key={index} className="activity-item">
                                <span className="activity-icon">{activity.icon}</span>
                                <div className="activity-info">
                                    <p><strong>{activity.title}:</strong> {activity.description}</p>
                                    <small>{formatTimestamp(activity.timestamp)}</small>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="activity-item">
                            <span className="activity-icon">ℹ️</span>
                            <div className="activity-info">
                                <p><strong>Sin actividad reciente</strong></p>
                                <small>Agrega datos al sistema para ver actividad</small>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

const AdminReports = () => {
    return (
        <div className="admin-reports">
            <header className="content-header">
                <h1>📈 Reportes del Sistema</h1>
                <p>Análisis y métricas de rendimiento</p>
            </header>

            <div className="reports-grid">
                <div className="report-card">
                    <h3>📊 Reporte de Ventas</h3>
                    <p>Análisis de rentas y ingresos mensuales</p>
                    <button className="report-btn">Generar</button>
                </div>

                <div className="report-card">
                    <h3>👥 Reporte de Clientes</h3>
                    <p>Estadísticas de registro y actividad de clientes</p>
                    <button className="report-btn">Generar</button>
                </div>

                <div className="report-card">
                    <h3>🚗 Reporte de Vehículos</h3>
                    <p>Uso y disponibilidad de la flota</p>
                    <button className="report-btn">Generar</button>
                </div>

                <div className="report-card">
                    <h3>💰 Reporte Financiero</h3>
                    <p>Estados financieros y flujo de caja</p>
                    <button className="report-btn">Generar</button>
                </div>
            </div>

            <div className="charts-placeholder">
                <div className="placeholder-icon">📊</div>
                <h3>Gráficos y Análisis</h3>
                <p>Aquí se mostrarán gráficos interactivos con las métricas del negocio</p>
            </div>
        </div>
    );
};

export default AdminReports;

const AdminSettings = () => {
    return (
        <div className="admin-settings">
            <header className="content-header">
                <h1>⚙️ Configuración del Sistema</h1>
                <p>Ajustes generales y preferencias del administrador</p>
            </header>

            <div className="settings-sections">
                <div className="settings-section">
                    <h3>👤 Perfil del Administrador</h3>
                    <div className="settings-content">
                        <p>Configurar información personal y credenciales</p>
                        <button className="settings-btn">Editar Perfil</button>
                    </div>
                </div>

                <div className="settings-section">
                    <h3>🏢 Configuración de la Empresa</h3>
                    <div className="settings-content">
                        <p>Información general de C2K Autos</p>
                        <button className="settings-btn">Configurar</button>
                    </div>
                </div>

                <div className="settings-section">
                    <h3>🔐 Seguridad</h3>
                    <div className="settings-content">
                        <p>Configuración de seguridad y accesos</p>
                        <button className="settings-btn">Gestionar</button>
                    </div>
                </div>

                <div className="settings-section">
                    <h3>📊 Reportes</h3>
                    <div className="settings-content">
                        <p>Configuración de reportes automáticos</p>
                        <button className="settings-btn">Configurar</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;

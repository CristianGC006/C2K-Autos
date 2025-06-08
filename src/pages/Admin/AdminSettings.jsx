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
                    <h3>🏢 Sedes</h3>
                    <div className="settings-content">
                        <p>Sedes de C2K</p>
                        <button className="settings-btn">Configurar</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminHome.css';

const AdminHome = () => {
    const navigate = useNavigate();
    const [selectedSection, setSelectedSection] = useState('usuarios');

    const handleLogout = () => {
        navigate('/adminLogin');
    };

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="logo-container">
                    <img src="/C2K-LogoNoBackground.png" alt="C2K Logo" className="admin-logo" />
                </div>
                <h2 className="welcome-text">BIENVENIDO QUERIDO ADMINISTRADOR DE C2K</h2>
                
                <nav className="admin-nav">
                    <button 
                        className={`nav-button ${selectedSection === 'usuarios' ? 'active' : ''}`}
                        onClick={() => setSelectedSection('usuarios')}
                    >
                        USUARIOS
                    </button>
                    <button 
                        className={`nav-button ${selectedSection === 'asesores' ? 'active' : ''}`}
                        onClick={() => setSelectedSection('asesores')}
                    >
                        ASESORES
                    </button>
                    <button 
                        className={`nav-button ${selectedSection === 'rentras' ? 'active' : ''}`}
                        onClick={() => setSelectedSection('rentras')}
                    >
                        RENTRAS
                    </button>
                    <button 
                        className={`nav-button ${selectedSection === 'vehiculos' ? 'active' : ''}`}
                        onClick={() => setSelectedSection('vehiculos')}
                    >
                        VEHICULOS
                    </button>
                    <button 
                        className={`nav-button ${selectedSection === 'sucursales' ? 'active' : ''}`}
                        onClick={() => setSelectedSection('sucursales')}
                    >
                        SUCURSALES
                    </button>
                </nav>

                <button className="logout-button" onClick={handleLogout}>
                    CERRAR SESION
                </button>
            </aside>

            <main className="admin-main">
                <div className="info-card">
                    <button className="close-button">×</button>
                    <h2>INFORMACION SOBRE</h2>
                    <p>(USUARIOS/ASESORES/RENTAS/VEHICULOS/SUCURSALES)</p>
                    <p>SEGUN EL BOTON QUE SE PRECIONES</p>
                </div>
            </main>
        </div>
    );
};

export default AdminHome;
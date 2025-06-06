import React, { useState, useEffect } from 'react';
import C2KLogoNoBackground from "../../assets/C2K-LogoNoBackground.png";
import './AssessorHome.css';
import { Link } from 'react-router-dom';

export default function AssessorHome() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // Obtener la lista de usuarios registrados
        fetch('http://localhost:8080/customer')
            .then(response => response.json())
            .then(data => {
                setCustomers(data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error al obtener los usuarios:', error);
                setLoading(false);
            });
    }, []);

    // Filtrar usuarios según el término de búsqueda
    const filteredCustomers = customers.filter(customer => 
        customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.identificationNumber?.includes(searchTerm)
    );

    return (
        <div className="assessor-container">
            <header className="assessor-header">
                <div className="header-content">
                <img className="logo" alt="C2K-Logo" src={C2KLogoNoBackground} />
                    <h1>Panel de Asesor</h1>
                    <Link to="/" className="logout-button">Cerrar Sesión</Link>
                </div>
            </header>

            <main className="assessor-main">
                <div className="panel-header">
                    <h2>Usuarios Registrados</h2>
                    <div className="search-container">
                        <input 
                            type="text" 
                            placeholder="Buscar usuario..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="loading">Cargando usuarios...</div>
                ) : (
                    <div className="users-table-container">
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Apellido</th>
                                    <th>Tipo de Documento</th>
                                    <th>Número de Documento</th>
                                    <th>Email</th>
                                    <th>Teléfono</th>
                                    <th>Licencia</th>
                                    <th>Fecha de Registro</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCustomers.length > 0 ? (
                                    filteredCustomers.map((customer, index) => (
                                        <tr key={index}>
                                            <td>{customer.name}</td>
                                            <td>{customer.lastName}</td>
                                            <td>{formatDocumentType(customer.identificationType)}</td>
                                            <td>{customer.identificationNumber}</td>
                                            <td>{customer.email}</td>
                                            <td>{customer.phone}</td>
                                            <td>{customer.license}</td>
                                            <td>{formatDate(customer.recordDate)}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="no-results">No se encontraron usuarios</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
}

// Función para formatear el tipo de documento
function formatDocumentType(type) {
    if (!type) return "";
    
    const types = {
        "CEDULA_DE_CIUDADANIA": "Cédula de Ciudadanía",
        "CEDULA_DE_EXTRANJERIA": "Cédula de Extranjería",
        "PASAPORTE": "Pasaporte",
        "OTRO": "Otro"
    };
    
    return types[type] || type;
}

// Función para formatear la fecha
function formatDate(dateString) {
    if (!dateString) return "";
    
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
}
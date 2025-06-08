import { useState, useEffect } from 'react';
import { getCustomers, deleteCustomer } from '../services/CustomerService';
import './CustomerTable.css';

const CustomerTable = ({ onEdit }) => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const data = await getCustomers();
            setCustomers(data);
        } catch (err) {
            setError(err.message);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('¿Está seguro de que desea eliminar este cliente?')) return;
        
        try {
            await deleteCustomer(id);
            fetchCustomers(); // Recargar la lista
        } catch (error) {
            alert('Error al eliminar cliente: ' + error.message);
        }
    };

    const filteredCustomers = customers.filter(customer =>
        customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.identificationNumber?.includes(searchTerm)
    );

    if (loading) return (
        <div className="loading-container">
            <div className="spinner"></div>
            <p>Cargando clientes...</p>
        </div>
    );
    
    if (error) return (
        <div className="error-container">
            <p>Error: {error}</p>
            <button onClick={fetchCustomers} className="retry-btn">Reintentar</button>
        </div>
    );

    return (
        <div className="customer-table-container">
            <div className="table-controls">
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Buscar por nombre, apellido, email o identificación..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
                <div className="table-info">
                    <span>{filteredCustomers.length} de {customers.length} clientes</span>
                </div>
            </div>

            <div className="table-wrapper">                <table className="customer-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Cliente</th>
                            <th>Contacto</th>
                            <th>Género</th>
                            <th>Nacionalidad</th>
                            <th>Fecha</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCustomers.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="no-data">
                                    {searchTerm ? 'No se encontraron clientes con ese criterio' : 'No hay clientes registrados'}
                                </td>
                            </tr>
                        ) : (
                            filteredCustomers.map(customer => (
                                <tr key={customer.idCustomer}>
                                    <td>{customer.idCustomer}</td>
                                    <td>
                                        <div className="customer-info">
                                            <strong>{customer.name} {customer.lastName}</strong>
                                            <div className="identification">
                                                <span className="id-type">{customer.identificationType}</span>
                                                <span className="id-number">{customer.identificationNumber}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="contact-info">
                                            <div className="email">{customer.email}</div>
                                            <div className="phone">{customer.phone}</div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="gender-badge">
                                            {customer.genderType === 'MALE' ? 'M' : 
                                             customer.genderType === 'FEMALE' ? 'F' : 'O'}
                                        </span>
                                    </td>
                                    <td>{customer.nationality}</td>
                                    <td>
                                        {customer.recordDate 
                                            ? new Date(customer.recordDate).toLocaleDateString('es-ES', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: '2-digit'
                                            })
                                            : 'N/A'
                                        }
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button 
                                                onClick={() => onEdit(customer)} 
                                                className="btn-edit"
                                                title="Editar cliente"
                                            >
                                                ✏️
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(customer.idCustomer)} 
                                                className="btn-delete"
                                                title="Eliminar cliente"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CustomerTable;

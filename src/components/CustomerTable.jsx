import { useState, useEffect } from 'react';
import { getCustomers, deleteCustomer } from '../services/CustomerService';
import Swal from 'sweetalert2';
import './CustomerTable.css';

const CustomerTable = ({ onEdit }) => {    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const data = await getCustomers();
            setCustomers(data);
            setError(null); // Limpiar errores previos
        } catch (err) {
            setError(err.message);
            Swal.fire({
                icon: 'error',
                title: 'Error al cargar clientes',
                text: err.message,
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#014421'
            });
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchCustomers();
    }, []);    const handleDelete = async (id, customerName) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            html: `¿Deseas eliminar el cliente <strong>${customerName}</strong>?<br>Esta acción no se puede deshacer.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#014421',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            reverseButtons: true
        });

        if (result.isConfirmed) {
            try {
                // Mostrar loading
                Swal.fire({
                    title: 'Eliminando cliente...',
                    allowOutsideClick: false,
                    showConfirmButton: false,
                    willOpen: () => {
                        Swal.showLoading();
                    }
                });

                await deleteCustomer(id);
                
                // Éxito
                await Swal.fire({
                    icon: 'success',
                    title: '¡Cliente eliminado!',
                    text: `${customerName} ha sido eliminado exitosamente.`,
                    confirmButtonText: 'Entendido',
                    confirmButtonColor: '#014421',
                    timer: 3000
                });

                fetchCustomers(); // Recargar la lista
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al eliminar cliente',
                    text: error.message || 'Ocurrió un error inesperado',
                    confirmButtonText: 'Entendido',
                    confirmButtonColor: '#dc2626'
                });
            }
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
                                            </button>                                            <button 
                                                onClick={() => handleDelete(customer.idCustomer, `${customer.name} ${customer.lastName}`)} 
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

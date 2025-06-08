import React, { useState } from 'react';
import { FaTrash, FaEye, FaCalendarAlt, FaCar, FaUser, FaDollarSign } from 'react-icons/fa';
import Swal from 'sweetalert2';
import './RentalTable.css';

const RentalTable = ({ rentals, onDelete, onView, loading }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [rentalsPerPage] = useState(10);
    const [filterStatus, setFilterStatus] = useState('');

    // Filtrar rentas por estado
    const filteredRentals = rentals.filter(rental => 
        filterStatus === '' || rental.status === filterStatus
    );

    // Calcular rentas para la página actual
    const indexOfLastRental = currentPage * rentalsPerPage;
    const indexOfFirstRental = indexOfLastRental - rentalsPerPage;
    const currentRentals = filteredRentals.slice(indexOfFirstRental, indexOfLastRental);

    // Cambiar página
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Función para obtener el color del badge según el estado
    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'PENDIENTE':
                return 'status-badge status-pending';
            case 'ACTIVA':
                return 'status-badge status-active';
            case 'COMPLETADA':
                return 'status-badge status-completed';
            case 'CANCELADA':
                return 'status-badge status-cancelled';
            case 'RETRASADA':
                return 'status-badge status-overdue';
            default:
                return 'status-badge status-default';
        }
    };

    // Función para formatear fechas
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES');
    };

    // Función para formatear moneda
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP'
        }).format(amount);
    };

    // Función para manejar eliminación con confirmación
    const handleDelete = async (rental) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            html: `¿Deseas eliminar la renta del cliente <strong>${rental.customerName}</strong> para el vehículo <strong>${rental.vehicleBrand} ${rental.vehicleModel}</strong>?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            reverseButtons: true
        });

        if (result.isConfirmed) {
            // Mostrar loading
            Swal.fire({
                title: 'Eliminando...',
                text: 'Procesando eliminación de la renta',
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            try {
                await onDelete(rental.id);
                
                // Mostrar éxito
                Swal.fire({
                    title: '¡Eliminado!',
                    text: 'La renta ha sido eliminada exitosamente',
                    icon: 'success',
                    confirmButtonColor: '#014421',
                    timer: 3000,
                    timerProgressBar: true
                });
            } catch (error) {
                // Mostrar error
                Swal.fire({
                    title: 'Error',
                    text: 'No se pudo eliminar la renta. Inténtalo de nuevo. ' + error,
                    icon: 'error',
                    confirmButtonColor: '#dc2626'
                });
            }
        }
    };    return (
        <div className="rental-table-wrapper">
            {/* Header */}
            <div className="rental-table-header">
                <h2 className="rental-table-title">
                    <FaCalendarAlt className="title-icon" />
                    Gestión de Rentas
                </h2>
                <p className="rental-table-subtitle">
                    {filteredRentals.length} de {rentals.length} rentas mostradas
                </p>
            </div>
            
            {/* Filtros */}
            <div className="rental-filters">
                <div className="filter-group">
                    <label className="filter-label">Estado</label>
                    <select
                        value={filterStatus}
                        onChange={(e) => {
                            setFilterStatus(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="filter-select"
                    >
                        <option value="">Todos los estados</option>
                        <option value="PENDIENTE">Pendiente</option>
                        <option value="ACTIVA">Activa</option>
                        <option value="COMPLETADA">Completada</option>
                        <option value="CANCELADA">Cancelada</option>
                        <option value="RETRASADA">Retrasada</option>
                    </select>
                </div>
                
                {/* Estadísticas rápidas */}
                <div className="quick-stats">
                    <div className="stat-item pending">
                        <div className="stat-value">
                            {rentals.filter(r => r.status === 'PENDIENTE').length}
                        </div>
                        <div className="stat-label">Pendientes</div>
                    </div>
                    <div className="stat-item active">
                        <div className="stat-value">
                            {rentals.filter(r => r.status === 'ACTIVA').length}
                        </div>
                        <div className="stat-label">Activas</div>
                    </div>
                    <div className="stat-item completed">
                        <div className="stat-value">
                            {rentals.filter(r => r.status === 'COMPLETADA').length}
                        </div>
                        <div className="stat-label">Completadas</div>
                    </div>
                </div>
            </div>
            
            {/* Tabla */}            <div className="rental-table-container">
                {loading ? (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <span className="loading-text">Cargando rentas...</span>
                    </div>
                ) : currentRentals.length === 0 ? (
                    <div className="no-rentals">
                        <FaCalendarAlt className="no-rentals-icon" />
                        <h3 className="no-rentals-title">No hay rentas</h3>
                        <p className="no-rentals-message">
                            {filterStatus ? `No se encontraron rentas con estado "${filterStatus}"` : 'No se han registrado rentas aún.'}
                        </p>
                    </div>
                ) : (
                    <table className="rental-table">
                        <thead className="table-header">
                            <tr>
                                <th className="table-cell header-cell">
                                    Cliente
                                </th>
                                <th className="table-cell header-cell">
                                    Vehículo
                                </th>
                                <th className="table-cell header-cell">
                                    Fechas
                                </th>
                                <th className="table-cell header-cell">
                                    Costo
                                </th>
                                <th className="table-cell header-cell">
                                    Estado
                                </th>
                                <th className="table-cell header-cell actions-header">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="table-body">
                            {currentRentals.map((rental) => (
                                <tr key={rental.id} className="table-row">
                                    <td className="table-cell">
                                        <div className="customer-info">
                                            <div className="customer-avatar">
                                                <FaUser className="avatar-icon" />
                                            </div>
                                            <div className="customer-details">
                                                <div className="customer-name">
                                                    {rental.customerName || `Cliente ID: ${rental.customerId}`}
                                                </div>
                                                <div className="customer-meta">
                                                    {rental.customerEmail || rental.customerDocument}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="table-cell">
                                        <div className="vehicle-info">
                                            <FaCar className="vehicle-icon" />
                                            <div className="vehicle-details">
                                                <div className="vehicle-name">
                                                    {rental.vehicleBrand} {rental.vehicleModel}
                                                </div>
                                                <div className="vehicle-meta">
                                                    {rental.vehiclePlate || `Vehículo ID: ${rental.vehicleId}`}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="table-cell">
                                        <div className="dates-info">
                                            <div className="date-item">
                                                <span className="date-label">Inicio:</span>
                                                <span className="date-value">{formatDate(rental.startDate)}</span>
                                            </div>
                                            <div className="date-item">
                                                <span className="date-label">Fin:</span>
                                                <span className="date-value">{formatDate(rental.endDate)}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="table-cell">
                                        <div className="cost-info">
                                            <FaDollarSign className="cost-icon" />
                                            <span className="cost-value">{formatCurrency(rental.totalCost)}</span>
                                        </div>
                                    </td>
                                    <td className="table-cell">
                                        <span className={getStatusBadgeColor(rental.status)}>
                                            {rental.status}
                                        </span>
                                    </td>
                                    <td className="table-cell">
                                        <div className="action-buttons">
                                            <button
                                                onClick={() => onView(rental)}
                                                className="action-btn view-btn"
                                                title="Ver detalles"
                                            >
                                                <FaEye className="btn-icon" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(rental)}
                                                className="action-btn delete-btn"
                                                title="Eliminar renta"
                                            >
                                                <FaTrash className="btn-icon" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>            {/* Paginación */}
            {filteredRentals.length > rentalsPerPage && (
                <div className="pagination-container">
                    <div className="pagination-mobile">
                        <button
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="pagination-btn pagination-prev"
                        >
                            Anterior
                        </button>
                        <button
                            onClick={() => paginate(currentPage + 1)}
                            disabled={indexOfLastRental >= filteredRentals.length}
                            className="pagination-btn pagination-next"
                        >
                            Siguiente
                        </button>
                    </div>
                    
                    <div className="pagination-desktop">
                        <div className="pagination-info">
                            <p className="pagination-text">
                                Mostrando{' '}
                                <span className="pagination-number">{indexOfFirstRental + 1}</span>
                                {' '}a{' '}
                                <span className="pagination-number">
                                    {Math.min(indexOfLastRental, filteredRentals.length)}
                                </span>
                                {' '}de{' '}
                                <span className="pagination-number">{filteredRentals.length}</span>
                                {' '}resultados
                            </p>
                        </div>
                        <div className="pagination-controls">
                            <nav className="pagination-nav">
                                {Array.from({ length: Math.ceil(filteredRentals.length / rentalsPerPage) }, (_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => paginate(i + 1)}
                                        className={`pagination-page ${currentPage === i + 1 ? 'active' : ''} ${
                                            i === 0 ? 'first' : ''
                                        } ${
                                            i === Math.ceil(filteredRentals.length / rentalsPerPage) - 1 ? 'last' : ''
                                        }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RentalTable;

import React, { useState } from 'react';
import { FaBuilding, FaEdit, FaTrash, FaEye, FaMapMarkerAlt, FaPhone, FaClock } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { getStatusBadgeColor } from '../services/BranchService';
import './BranchTable.css';

const BranchTable = ({ branches, onEdit, onDelete, onView, loading }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [branchesPerPage] = useState(10);
    const [filterStatus, setFilterStatus] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Filtrar sucursales por estado y término de búsqueda
    const filteredBranches = branches.filter(branch => {
        const matchesStatus = filterStatus === '' || branch.status === filterStatus;
        const matchesSearch = searchTerm === '' || 
            branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            branch.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
            branch.phone.includes(searchTerm);
        
        return matchesStatus && matchesSearch;
    });

    // Calcular sucursales para la página actual
    const indexOfLastBranch = currentPage * branchesPerPage;
    const indexOfFirstBranch = indexOfLastBranch - branchesPerPage;
    const currentBranches = filteredBranches.slice(indexOfFirstBranch, indexOfLastBranch);

    // Cambiar página
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Función para manejar eliminación con confirmación
    const handleDelete = async (branch) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            html: `¿Deseas eliminar la sucursal <strong>"${branch.name}"</strong>?<br><small>Esta acción no se puede deshacer.</small>`,
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
                text: 'Procesando eliminación de la sucursal',
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            try {
                await onDelete(branch.idBranch);
                
                // Mostrar éxito
                Swal.fire({
                    title: '¡Eliminado!',
                    text: 'La sucursal ha sido eliminada exitosamente',
                    icon: 'success',
                    confirmButtonColor: '#014421',
                    timer: 3000,
                    timerProgressBar: true
                });            } catch (deleteError) {
                // Mostrar error
                console.error('Error al eliminar sucursal:', deleteError);
                Swal.fire({
                    title: 'Error',
                    text: 'No se pudo eliminar la sucursal. Inténtalo de nuevo.',
                    icon: 'error',
                    confirmButtonColor: '#dc2626'
                });
            }
        }
    };

    return (
        <div className="branch-table-wrapper">
            {/* Header */}
            <div className="branch-table-header">
                <h2 className="branch-table-title">
                    <FaBuilding className="title-icon" />
                    Gestión de Sucursales
                </h2>
                <p className="branch-table-subtitle">
                    {filteredBranches.length} de {branches.length} sucursales mostradas
                </p>
            </div>
            
            {/* Filtros y búsqueda */}
            <div className="branch-filters">
                <div className="filter-group">
                    <label className="filter-label">Buscar</label>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="filter-input"
                        placeholder="Buscar por nombre, dirección o teléfono..."
                    />
                </div>
                
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
                        <option value="ACTIVA">Activa</option>
                        <option value="INACTIVA">Inactiva</option>
                        <option value="MANTENIMIENTO">Mantenimiento</option>
                    </select>
                </div>
                
                {/* Estadísticas rápidas */}
                <div className="quick-stats">
                    <div className="stat-item active">
                        <div className="stat-value">
                            {branches.filter(b => b.status === 'ACTIVA').length}
                        </div>
                        <div className="stat-label">Activas</div>
                    </div>
                    <div className="stat-item inactive">
                        <div className="stat-value">
                            {branches.filter(b => b.status === 'INACTIVA').length}
                        </div>
                        <div className="stat-label">Inactivas</div>
                    </div>
                    <div className="stat-item maintenance">
                        <div className="stat-value">
                            {branches.filter(b => b.status === 'MANTENIMIENTO').length}
                        </div>
                        <div className="stat-label">Mantenimiento</div>
                    </div>
                </div>
            </div>
            
            {/* Tabla */}
            <div className="branch-table-container">
                {loading ? (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <span className="loading-text">Cargando sucursales...</span>
                    </div>
                ) : currentBranches.length === 0 ? (
                    <div className="no-branches">
                        <FaBuilding className="no-branches-icon" />
                        <h3 className="no-branches-title">No hay sucursales</h3>
                        <p className="no-branches-message">
                            {searchTerm || filterStatus 
                                ? 'No se encontraron sucursales que coincidan con los filtros aplicados'
                                : 'No se han registrado sucursales aún.'}
                        </p>
                    </div>
                ) : (
                    <table className="branch-table">
                        <thead className="table-header">
                            <tr>
                                <th className="table-cell header-cell">Sucursal</th>
                                <th className="table-cell header-cell">Contacto</th>
                                <th className="table-cell header-cell">Horario</th>
                                <th className="table-cell header-cell">Estado</th>
                                <th className="table-cell header-cell actions-header">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="table-body">
                            {currentBranches.map((branch) => (
                                <tr key={branch.idBranch} className="table-row">
                                    <td className="table-cell">
                                        <div className="branch-info">
                                            <div className="branch-avatar">
                                                <FaBuilding className="avatar-icon" />
                                            </div>
                                            <div className="branch-details">
                                                <div className="branch-name">{branch.name}</div>
                                                <div className="branch-address">
                                                    <FaMapMarkerAlt className="address-icon" />
                                                    {branch.address}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    
                                    <td className="table-cell">
                                        <div className="contact-info">
                                            <div className="contact-item">
                                                <FaPhone className="contact-icon" />
                                                <span className="contact-value">{branch.phone}</span>
                                            </div>
                                        </div>
                                    </td>
                                    
                                    <td className="table-cell">
                                        <div className="schedule-info">
                                            <FaClock className="schedule-icon" />
                                            <span className="schedule-value">{branch.schedule}</span>
                                        </div>
                                    </td>
                                    
                                    <td className="table-cell">
                                        <span className={`status-badge ${getStatusBadgeColor(branch.status)}`}>
                                            {branch.status}
                                        </span>
                                    </td>
                                    
                                    <td className="table-cell">
                                        <div className="action-buttons">
                                            <button
                                                onClick={() => onView(branch)}
                                                className="action-btn view-btn"
                                                title="Ver detalles"
                                            >
                                                <FaEye className="btn-icon" />
                                            </button>
                                            <button
                                                onClick={() => onEdit(branch)}
                                                className="action-btn edit-btn"
                                                title="Editar sucursal"
                                            >
                                                <FaEdit className="btn-icon" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(branch)}
                                                className="action-btn delete-btn"
                                                title="Eliminar sucursal"
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
            </div>

            {/* Paginación */}
            {filteredBranches.length > branchesPerPage && (
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
                            disabled={indexOfLastBranch >= filteredBranches.length}
                            className="pagination-btn pagination-next"
                        >
                            Siguiente
                        </button>
                    </div>
                    
                    <div className="pagination-desktop">
                        <div className="pagination-info">
                            <p className="pagination-text">
                                Mostrando{' '}
                                <span className="pagination-number">{indexOfFirstBranch + 1}</span>
                                {' '}a{' '}
                                <span className="pagination-number">
                                    {Math.min(indexOfLastBranch, filteredBranches.length)}
                                </span>
                                {' '}de{' '}
                                <span className="pagination-number">{filteredBranches.length}</span>
                                {' '}resultados
                            </p>
                        </div>
                        <div className="pagination-controls">
                            <nav className="pagination-nav">
                                {Array.from({ length: Math.ceil(filteredBranches.length / branchesPerPage) }, (_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => paginate(i + 1)}
                                        className={`pagination-page ${currentPage === i + 1 ? 'active' : ''} ${
                                            i === 0 ? 'first' : ''
                                        } ${
                                            i === Math.ceil(filteredBranches.length / branchesPerPage) - 1 ? 'last' : ''
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

export default BranchTable;

import { useState, useMemo } from 'react';
import Swal from 'sweetalert2';
import { getServiceAreaIcon, getServiceAreaLabel } from '../services/LogisticOperatorService';
import './CustomerTable.css'; // Reutilizamos los estilos existentes

const LogisticOperatorTable = ({ 
    operators = [], 
    onEdit, 
    onDelete, 
    isLoading = false 
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    // Filtrar operadores por término de búsqueda
    const filteredOperators = useMemo(() => {
        if (!searchTerm) return operators;
        
        const term = searchTerm.toLowerCase();
        return operators.filter(operator =>
            operator.name.toLowerCase().includes(term) ||
            operator.email.toLowerCase().includes(term) ||
            operator.phone.includes(term) ||
            operator.address.toLowerCase().includes(term) ||
            getServiceAreaLabel(operator.serviceArea).toLowerCase().includes(term)
        );
    }, [operators, searchTerm]);

    // Ordenar operadores
    const sortedOperators = useMemo(() => {
        if (!sortConfig.key) return filteredOperators;

        return [...filteredOperators].sort((a, b) => {
            let aValue = a[sortConfig.key];
            let bValue = b[sortConfig.key];

            // Manejar casos especiales
            if (sortConfig.key === 'serviceArea') {
                aValue = getServiceAreaLabel(aValue);
                bValue = getServiceAreaLabel(bValue);
            }

            if (aValue < bValue) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }, [filteredOperators, sortConfig]);

    const handleSort = (key) => {
        setSortConfig(prevConfig => ({
            key,
            direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const getSortIcon = (columnKey) => {
        if (sortConfig.key !== columnKey) return '↕️';
        return sortConfig.direction === 'asc' ? '↑' : '↓';
    };    const handleDelete = async (operator) => {
        const result = await Swal.fire({
            title: '¿Está seguro?',
            html: `Se eliminará al operador logístico:<br><br>
                   <strong>👤 ${operator.name}</strong><br>
                   📧 ${operator.email}<br>
                   📱 ${operator.phone}<br>
                   🏢 ${getServiceAreaLabel(operator.serviceArea)}<br><br>
                   <em>Esta acción no se puede deshacer.</em>`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            reverseButtons: true
        });

        if (result.isConfirmed) {
            onDelete(operator.idLogisticOperator);
        }
    };

    // Estadísticas
    const stats = useMemo(() => {
        const serviceAreaCount = {};
        operators.forEach(operator => {
            const area = operator.serviceArea;
            serviceAreaCount[area] = (serviceAreaCount[area] || 0) + 1;
        });

        return {
            total: operators.length,
            filtered: filteredOperators.length,
            byServiceArea: serviceAreaCount
        };
    }, [operators, filteredOperators]);

    if (isLoading) {
        return (
            <div className="table-container">
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Cargando operadores logísticos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="table-container">
            {/* Estadísticas */}
            <div className="table-stats">
                <div className="stats-grid">
                    <div className="stat-card">
                        <span className="stat-icon">👥</span>
                        <div className="stat-info">
                            <span className="stat-number">{stats.total}</span>
                            <span className="stat-label">Total Operadores</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <span className="stat-icon">🔍</span>
                        <div className="stat-info">
                            <span className="stat-number">{stats.filtered}</span>
                            <span className="stat-label">Filtrados</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <span className="stat-icon">🚛</span>
                        <div className="stat-info">
                            <span className="stat-number">{stats.byServiceArea.TRANSPORTE || 0}</span>
                            <span className="stat-label">Transporte</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <span className="stat-icon">🧽</span>
                        <div className="stat-info">
                            <span className="stat-number">{stats.byServiceArea.LAVADO || 0}</span>
                            <span className="stat-label">Lavado</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <span className="stat-icon">🔧</span>
                        <div className="stat-info">
                            <span className="stat-number">{stats.byServiceArea.REPARACION || 0}</span>
                            <span className="stat-label">Reparación</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Barra de búsqueda */}
            <div className="table-header">
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="🔍 Buscar por nombre, email, teléfono, dirección o área de servicio..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="clear-search"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            {/* Tabla */}
            {sortedOperators.length === 0 ? (
                <div className="empty-state">
                    {operators.length === 0 ? (
                        <>
                            <span className="empty-icon">📦</span>
                            <h3>No hay operadores logísticos registrados</h3>
                            <p>Comience agregando el primer operador logístico</p>
                        </>
                    ) : (
                        <>
                            <span className="empty-icon">🔍</span>
                            <h3>No se encontraron resultados</h3>
                            <p>Intente con otros términos de búsqueda</p>
                        </>
                    )}
                </div>
            ) : (
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th onClick={() => handleSort('name')} className="sortable">
                                    Nombre {getSortIcon('name')}
                                </th>
                                <th onClick={() => handleSort('email')} className="sortable">
                                    Email {getSortIcon('email')}
                                </th>
                                <th onClick={() => handleSort('phone')} className="sortable">
                                    Teléfono {getSortIcon('phone')}
                                </th>
                                <th onClick={() => handleSort('serviceArea')} className="sortable">
                                    Área de Servicio {getSortIcon('serviceArea')}
                                </th>
                                <th onClick={() => handleSort('address')} className="sortable">
                                    Dirección {getSortIcon('address')}
                                </th>
                                <th className="actions-column">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedOperators.map((operator) => (
                                <tr key={operator.idLogisticOperator}>
                                    <td className="name-cell">
                                        <div className="name-info">
                                            <span className="name">{operator.name}</span>
                                            <span className="id">ID: {operator.idLogisticOperator}</span>
                                        </div>
                                    </td>
                                    <td className="email-cell">
                                        <a href={`mailto:${operator.email}`}>
                                            {operator.email}
                                        </a>
                                    </td>
                                    <td className="phone-cell">
                                        <a href={`tel:${operator.phone}`}>
                                            {operator.phone}
                                        </a>
                                    </td>
                                    <td className="service-area-cell">
                                        <div className="service-area-badge">
                                            <span className="service-icon">
                                                {getServiceAreaIcon(operator.serviceArea)}
                                            </span>
                                            <span className="service-label">
                                                {getServiceAreaLabel(operator.serviceArea)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="address-cell">
                                        <div className="address-info" title={operator.address}>
                                            {operator.address.length > 50 
                                                ? `${operator.address.substring(0, 50)}...` 
                                                : operator.address
                                            }
                                        </div>
                                    </td>
                                    <td className="actions-cell">
                                        <div className="action-buttons">
                                            <button
                                                onClick={() => onEdit(operator)}
                                                className="edit-button"
                                                title="Editar operador"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={() => handleDelete(operator)}
                                                className="delete-button"
                                                title="Eliminar operador"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Información de resultados */}
            {sortedOperators.length > 0 && (
                <div className="table-footer">
                    <span className="results-info">
                        Mostrando {sortedOperators.length} de {operators.length} operadores logísticos
                        {searchTerm && ` (filtrado por: "${searchTerm}")`}
                    </span>
                </div>
            )}
        </div>
    );
};

export default LogisticOperatorTable;

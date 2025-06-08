import { useState, useMemo } from 'react';
import Swal from 'sweetalert2';
import { getServiceAreaIcon, getServiceAreaLabel } from '../services/LogisticOperatorService';
import './LogisticOperatorTable.css'; // Estilos específicos para operadores logísticos

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
    }, [operators, filteredOperators]);    if (isLoading) {
        return (
            <div className="logistic-table-container">
                <div className="logistic-loading-state">
                    <div className="logistic-loading-spinner"></div>
                    <p>Cargando operadores logísticos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="logistic-table-container">
            {/* Estadísticas */}
            <div className="logistic-table-stats">
                <div className="logistic-stats-grid">
                    <div className="logistic-stat-card">
                        <span className="logistic-stat-icon">👥</span>
                        <div className="logistic-stat-info">
                            <span className="logistic-stat-number">{stats.total}</span>
                            <span className="logistic-stat-label">Total Operadores</span>
                        </div>
                    </div>
                    <div className="logistic-stat-card">
                        <span className="logistic-stat-icon">🔍</span>
                        <div className="logistic-stat-info">
                            <span className="logistic-stat-number">{stats.filtered}</span>
                            <span className="logistic-stat-label">Filtrados</span>
                        </div>
                    </div>
                    <div className="logistic-stat-card">
                        <span className="logistic-stat-icon">🚛</span>
                        <div className="logistic-stat-info">
                            <span className="logistic-stat-number">{stats.byServiceArea.TRANSPORTE || 0}</span>
                            <span className="logistic-stat-label">Transporte</span>
                        </div>
                    </div>
                    <div className="logistic-stat-card">
                        <span className="logistic-stat-icon">🧽</span>
                        <div className="logistic-stat-info">
                            <span className="logistic-stat-number">{stats.byServiceArea.LAVADO || 0}</span>
                            <span className="logistic-stat-label">Lavado</span>
                        </div>
                    </div>
                    <div className="logistic-stat-card">
                        <span className="logistic-stat-icon">🔧</span>
                        <div className="logistic-stat-info">
                            <span className="logistic-stat-number">{stats.byServiceArea.REPARACION || 0}</span>
                            <span className="logistic-stat-label">Reparación</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Barra de búsqueda */}
            <div className="logistic-table-header">
                <div className="logistic-search-container">
                    <input
                        type="text"
                        placeholder="🔍 Buscar por nombre, email, teléfono, dirección o área de servicio..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="logistic-search-input"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="logistic-clear-search"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            {/* Tabla */}
            {sortedOperators.length === 0 ? (
                <div className="logistic-empty-state">
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
                <div className="logistic-table-wrapper">
                    <table className="logistic-data-table">
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
                                    <td className="logistic-name-cell">
                                        <div className="name-info">
                                            <span className="name">{operator.name}</span>
                                            <span className="id">ID: {operator.idLogisticOperator}</span>
                                        </div>
                                    </td>
                                    <td className="logistic-email-cell">
                                        <a href={`mailto:${operator.email}`}>
                                            {operator.email}
                                        </a>
                                    </td>
                                    <td className="logistic-phone-cell">
                                        <a href={`tel:${operator.phone}`}>
                                            {operator.phone}
                                        </a>
                                    </td>
                                    <td className="logistic-service-area-cell">
                                        <div className="service-area-badge">
                                            <span className="service-icon">
                                                {getServiceAreaIcon(operator.serviceArea)}
                                            </span>
                                            <span className="service-label">
                                                {getServiceAreaLabel(operator.serviceArea)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="logistic-address-cell">
                                        <div className="address-info" title={operator.address}>
                                            {operator.address.length > 50 
                                                ? `${operator.address.substring(0, 50)}...` 
                                                : operator.address
                                            }
                                        </div>
                                    </td>
                                    <td className="logistic-actions-cell">
                                        <div className="action-buttons">
                                            <button
                                                onClick={() => onEdit(operator)}
                                                className="logistic-edit-button"
                                                title="Editar operador"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={() => handleDelete(operator)}
                                                className="logistic-delete-button"
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
                <div className="logistic-table-footer">
                    <span className="logistic-results-info">
                        Mostrando {sortedOperators.length} de {operators.length} operadores logísticos
                        {searchTerm && ` (filtrado por: "${searchTerm}")`}
                    </span>
                </div>
            )}
        </div>
    );
};

export default LogisticOperatorTable;
